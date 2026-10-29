# Deploy บน Railway — container stack (frontend + backend + PostgreSQL)

สถาปัตยกรรมบน Railway มี 3 services ในโปรเจกต์เดียว:

```
                      Railway project
┌───────────────────────────────────────────────────────────────┐
│  frontend (Dockerfile → nginx :8080)                          │
│    Expo web build (static)  ──HTTPS──►  backend (Dockerfile)  │
│                                          Loco.rs :5150        │
│                                              │                │
│                                              ▼                │
│                                     Postgres (managed plugin)│
└───────────────────────────────────────────────────────────────┘
```

- **frontend** — `app/frontend/Dockerfile`: `expo export --platform web` แล้วเสิร์ฟด้วย nginx
- **backend** — `app/backend/Dockerfile`: build Loco.rs แบบ release, รัน `backend-cli start` (production config, auto-migrate)
- **database** — Railway PostgreSQL plugin (ไม่ต้องมี Dockerfile)

ไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | หน้าที่ |
|---|---|
| `app/backend/Dockerfile`, `app/backend/.dockerignore` | image ของ API |
| `app/backend/railway.json` | config-as-code: Dockerfile builder, healthcheck `/_health`, restart policy |
| `app/frontend/Dockerfile`, `app/frontend/.dockerignore` | image ของ web (nginx) |
| `app/frontend/nginx/default.conf.template` | nginx config (อ่าน `PORT` จาก env, SPA fallback) |
| `app/frontend/railway.json` | config-as-code: Dockerfile builder, healthcheck `/`, restart policy |
| `app/frontend/src/config.ts` | อ่าน `EXPO_PUBLIC_API_URL` (ฝังตอน build) |
| `app/docker-compose.yml` | รัน stack เดียวกันในเครื่อง (`--profile app`) |

> ค่าที่ Railway ให้มาแต่ละ service ต้องประกาศเป็น `ARG` ใน Dockerfile ก่อน ถ้าจะใช้ตอน build
> (frontend ใช้วิธีนี้กับ `EXPO_PUBLIC_API_URL`) — ตัวแปรอื่นอ่านตอน runtime ได้ตามปกติ

---

## ขั้นตอน deploy

### 1. สร้างโปรเจกต์ + PostgreSQL

1. Railway → **New Project** → **Deploy from GitHub repo** เลือก repo นี้
   (ถ้า Railway สร้าง service จาก repo ให้ลบทิ้งก่อน เพราะเราจะเพิ่มทีละ service)
2. **+ New** → **Database** → **Add PostgreSQL**
3. ปล่อยชื่อ service เป็น `Postgres` (ถ้าเปลี่ยนชื่อ ต้องแก้ reference `${{Postgres.DATABASE_URL}}` ด้านล่างให้ตรงกัน)

### 2. Backend service

1. **+ New** → **GitHub Repo** → เลือก repo เดียวกัน
2. Service → **Settings** → **Source** → **Root Directory** = `app/backend`
   (สำคัญมาก — ถ้าไม่ตั้ง Railway จะหา Dockerfile ไม่เจอ)
3. **Settings** → **Networking** → **Public Networking** → **Generate Domain**
   แล้วตั้ง **Target Port = `5150`**
   (ต้อง generate domain *ก่อน* deploy เพราะ `HOST` อ้างถึงโดเมนของตัวเอง)
4. **Variables** ใส่:

   | Variable | Value | หมายเหตุ |
   |---|---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | ใช้ private network ภายใน Railway |
   | `JWT_SECRET` | `${{secret(64)}}` | Railway สุ่มให้; ห้ามใช้ค่าจาก dev config |
   | `HOST` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | ใช้ทำลิงก์ในอีเมล |
   | `LOG_LEVEL` | `info` | ไม่ใส่ก็ได้ |
   | `CORS_ALLOW_ORIGINS` | `['https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}']` | ไม่ใส่ = `['*']` (ดูข้อควรระวัง) |

   `LOCO_ENV=production`, `BINDING=0.0.0.0`, `PORT=5150` ถูก bake ไว้ใน Dockerfile แล้ว
5. **Deploy** — build แรกจะใช้เวลานาน (ประมาณ 10–15 นาที, Rust compile Loco + SeaORM)
   ครั้งถัด ๆ ไปเร็วขึ้นเพราะ Docker layer cache ของ dependencies
6. ตรวจสอบ: เปิด `https://<backend-domain>/_health` ต้องได้ `200`

Migrations รันอัตโนมัติตอน boot (`auto_migrate: true` ใน `config/production.yaml`)
ถ้าอยากปิดให้ตั้ง `DB_AUTO_MIGRATE=false` (กรณีมีหลาย replica)


### 3. Frontend service

1. **+ New** → **GitHub Repo** → repo เดียวกัน
2. **Root Directory** = `app/frontend`
3. **Variables** ใส่:

   | Variable | Value | หมายเหตุ |
   |---|---|---|
   | `EXPO_PUBLIC_API_URL` | `https://${{backend.RAILWAY_PUBLIC_DOMAIN}}` | ใช้ **ตอน build** — ฝังลง bundle |

   ถ้า service backend ตั้งชื่ออื่น ให้แก้ `backend` ใน reference ให้ตรง
4. **Settings** → **Networking** → **Generate Domain** → **Target Port = `8080`**
5. **Deploy** แล้วเปิดโดเมนของ frontend — ควรเห็นหน้าแอป

> `EXPO_PUBLIC_*` ถูก inline ตอน `expo export` ไม่ใช่ตอน runtime
> ถ้าเปลี่ยนค่า `EXPO_PUBLIC_API_URL` หรือสร้าง backend domain ทีหลัง **ต้อง redeploy frontend**

### 4. Redeploy ด้วย CLI (ทางเลือก)

```bash
npm i -g @railway/cli
railway login
railway link                      # เลือกโปรเจกต์
railway service                   # เลือก service ที่จะสั่งงาน
railway variables --set "LOG_LEVEL=debug"
railway up --service backend
railway up --service frontend
railway logs
```

---

## Environment variables ทั้งหมด

### backend

| Variable | บังคับ | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | ✅ | — | `${{secret(64)}}` |
| `HOST` | ✅ | — | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `PORT` / `BINDING` | | `5150` / `0.0.0.0` | ตั้งใน Dockerfile |
| `DB_MAX_CONNECTIONS` | | `10` | pool size |
| `DB_AUTO_MIGRATE` | | `true` | migrate ตอน boot |
| `CORS_ENABLE` | | `true` | เปิด CORS middleware |
| `CORS_ALLOW_ORIGINS` | | `['*']` | YAML flow list ของ origin ที่อนุญาต |
| `MAILER_STUB` | | `true` | ยังไม่ส่งเมลจริง |
| `MAILER_ENABLE`, `MAILER_HOST`, `MAILER_PORT`, `MAILER_SECURE`, `MAILER_TLS`, `MAILER_USER`, `MAILER_PASSWORD` | | ปิดอยู่ | เปิดเมื่อมี SMTP provider |

### frontend

| Variable | บังคับ | คำอธิบาย |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ (ตอน build) | public URL ของ backend |
| `PORT` | | พอร์ตของ nginx (ค่าเริ่มต้น `8080`) |

---

## รัน stack เดียวกันในเครื่อง

```bash
cd app
docker compose up -d                          # PostgreSQL อย่างเดียว (dev ปกติ)
docker compose --profile app up --build       # db + backend (:5150) + frontend (:8080)
docker compose --profile app down             # หยุดทั้ง stack
```

- backend ในเครื่องรันด้วย `LOCO_ENV=development` (production config ต้องมี secret ของ Railway)
- เปิด `http://localhost:8080` สำหรับ web, `http://localhost:5150/_health` สำหรับ API

## หมายเหตุ / ข้อควรระวัง

- **API เป็น open ไม่มี auth** (MVP) และค่าเริ่มต้น CORS เปิดให้ทุก origin
  ถ้าจะจำกัด origin ให้ตั้ง `CORS_ALLOW_ORIGINS=['https://<frontend-domain>']`
  ทั้งนี้ CORS ไม่ใช่การป้องกัน access — ต้องเพิ่ม auth ก่อนเปิดใช้จริงจัง
- **seed**: `src/fixtures/users.yaml` มี user ตัวอย่างพร้อม password hash
  ถ้าจะ seed บน production ให้คิดก่อน (`railway ssh` แล้วรัน `backend-cli db seed`)
  — ของจริงควร seed แค่ algorithm catalog
- **mobile app** ไม่ได้ deploy ผ่าน Railway: ใช้ Expo Go / EAS build ตามปกติ
  โดยตั้ง `EXPO_PUBLIC_API_URL` เป็น public URL ของ backend
- **พอร์ต**: Railway ไม่ได้ inject `PORT` ให้ Dockerfile service — ต้องตั้ง Target Port
  ในหน้า Networking (5150 backend, 8080 frontend) ตามที่ระบุข้างบน
- เปลี่ยน `Expo SDK` / `loco-rs` แล้วให้ rebuild image และเช็ค `cargo test`, `npx tsc --noEmit` ก่อน deploy

