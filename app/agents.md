# OJ Notes & Algorithm Visualizer

ระบบจด note ของโจทย์ online judge + สอน algorithm ด้วย animation การทำงาน

## Stack

- **Backend**: Rust — Loco.rs framework (REST API, ไม่มี auth ใน MVP)
- **Frontend**: React Native — Expo (SDK ~58), ใช้ Expo Router (ดูกฎเพิ่มใน `frontend/AGENTS.md`)
- **Database**: PostgreSQL 16 ผ่าน Docker

## Deploy

Stack ทั้งหมดรันเป็น container บน Railway ได้ (frontend + backend + PostgreSQL)
ดูขั้นตอนที่ [`DEPLOY_RAILWAY.md`](./DEPLOY_RAILWAY.md)

```bash
cd app
docker compose up -d                     # PostgreSQL อย่างเดียว (dev)
docker compose --profile app up --build  # db + API + web (เหมือนบน Railway)
```

## โครงสร้าง

```
app/
├── docker-compose.yml   # PostgreSQL (+ profile `app` = ทั้ง stack) — host port 5433 (5432 ถูก container โปรเจกต์อื่นใช้อยู่ ห้ามเปลี่ยนกลับ)
├── DEPLOY_RAILWAY.md     # ขั้นตอน deploy container stack ขึ้น Railway
├── backend/             # Loco.rs app (API port 5150) — Dockerfile + railway.json
└── frontend/            # Expo app — routes อยู่ใน src/app/ (Expo Router), non-route code อยู่นอก src/app/ — Dockerfile + railway.json
```

## คำสั่งที่ใช้บ่อย

```bash
# Database (รันจาก app/)
docker compose up -d          # เริ่ม PostgreSQL (container: ojnotes-postgres)
docker compose ps             # เช็คสถานะ — ต้อง healthy

# Backend (รันจาก app/backend/) — CLI คือ `loco` v1.x (loco-cli ถูกยกเลิกแล้ว)
cargo loco start              # รัน server ที่ http://localhost:5150
cargo loco db migrate         # รัน migrations
cargo loco db seed            # seed algorithms catalog
cargo loco generate migration <name>
cargo loco generate model <name> <field:type...>
cargo test                    # ต้องผ่านก่อนปิดงานเสมอ

# Frontend (รันจาก app/frontend/)
npx expo install <package>    # ห้ามใช้ npm add — ต้อง expo install เพื่อให้ได้ version ที่เข้ากับ SDK
npx expo start                # dev server
npx tsc --noEmit              # typecheck — ต้องผ่านก่อนปิดงาน
npx expo lint                 # lint
```

## Database

- Connection: `postgres://loco:loco@localhost:5433/ojnotes_development`
- ตาราง `notes`: title, platform, problem_ref, content (markdown), tags (comma-separated), status (`open`/`solved`/`revisit`)
- ตาราง `algorithms`: slug (unique — frontend map ไปหา visualizer), name, category, description, pseudocode, time_complexity, space_complexity, sample_input (jsonb)
- Seed algorithms: `bubble-sort`, `selection-sort`, `binary-search`

## API

- `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/:id`
- `GET /api/algorithms`, `GET /api/algorithms/:slug`
- Validation: title/content ห้ามว่าง, status ต้องอยู่ใน enum

## Frontend conventions

- API base URL อยู่ที่ `frontend/src/config.ts` — Android emulator ใช้ `http://10.0.2.2:5150` (localhost ของ host)
- Animation แบบ **hardcoded ต่อ algorithm**: visualizer component อยู่ใน `frontend/src/visualizers/`, มี registry map `slug → component`; slug ที่ยังไม่มี visualizer ให้แสดงข้อความ "ยังไม่มี animation"
- Step sequence (compare/swap/highlight) คำนวณบน client จาก `sample_input` — backend ไม่ส่ง steps
- Animation ใช้ `react-native-reanimated`, playback controls (play/pause/step/reset/speed) เป็น shared component

## กฎการอัปเดตสถานะงาน (บังคับ)

ทุกครั้งที่ทำงานเสร็จหรือคืบหน้า ต้องอัปเดต **สองที่** ในรอบเดียวกัน:

1. [`PLAN.md`](./PLAN.md) — ช่องสถานะ + `% ที่ได้` ในตาราง Checklist, **Progress รวม**, ตาราง **Progress by phase**,
   วันที่ "สถานะอัปเดตล่าสุด", และเพิ่มบรรทัดใน **ประวัติการอัปเดต**
2. หัวข้อ **สถานะงาน** ท้ายไฟล์นี้ ให้ตรงกับตาราง Checklist (ห้ามให้สองที่นี้ขัดกัน)

ห้ามรายงานว่างาน "เสร็จ" ถ้าไฟล์พวกนี้ยังไม่ถูกอัปเดต

## สถานะงาน (อัปเดต 2026-10-29 · progress 100%)

รายละเอียดน้ำหนักงาน/หลักฐานอยู่ใน [`PLAN.md`](./PLAN.md) — สรุปย่อ:

- [x] docker-compose.yml + PostgreSQL รันแล้ว (port 5433, container `ojnotes-postgres` healthy)
- [x] Rust stable 1.99.1 + loco CLI v1.2.0
- [x] Expo frontend scaffold (`frontend/` — expo ~58.0.19)
- [x] `agents.md` + project skills (`loco-backend`, `expo-app`) + `AGENTS.md` ของแต่ละ service
- [x] เตรียมไฟล์ deploy Railway (Dockerfile + `railway.json` ทั้งสอง service, `DEPLOY_RAILWAY.md`)
- [x] Backend scaffold (`backend/`, loco-rs 1.2) + ตั้งค่า `config/development.yaml` และ `config/test.yaml` ชี้ Postgres 5433 แล้ว
- [x] Migrations + models (`notes`, `algorithms`) + seed (`bubble-sort`, `selection-sort`, `binary-search`)
- [x] REST API `/api/notes` + `/api/algorithms` และ tests (`cargo test` ผ่าน 32/32 tests, `cargo clippy` ผ่าน)
- [x] Frontend deps (`expo-router`, `react-native-reanimated`, `react-native-worklets`, `react-native-markdown-display` ฯลฯ ผ่าน `npx expo install`)
- [x] Frontend screens (`Notes` / `Learn` tabs ใน `src/app/`)
- [x] Visualizers (`SortingVisualizer`, `BinarySearchVisualizer`) + shared `PlaybackControls`
- [x] Verify end-to-end (live API requests + `cargo test` + `npx tsc --noEmit` + `npx expo lint` + `npx expo export --platform web`)

## ข้อควรระวัง

- เครื่องนี้ไม่มี `psql` client — ใช้ `docker exec ojnotes-postgres psql ...` แทน
- ห้ามแตะ container `gpo-enabler-postgres` (ของโปรเจกต์อื่น กำลังรันอยู่)
- `ios/` และ `android/` เป็น generated — ห้ามสร้าง/แก้เอง
