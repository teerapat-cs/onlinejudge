# OJ Notes & Algorithm Visualizer

ระบบจด note ของโจทย์ online judge + สอน algorithm ด้วย animation การทำงาน

## Stack

- **Backend**: Rust — Loco.rs framework (REST API, ไม่มี auth ใน MVP)
- **Frontend**: React Native — Expo (SDK ~58), ใช้ Expo Router (ดูกฎเพิ่มใน `frontend/AGENTS.md`)
- **Database**: PostgreSQL 16 ผ่าน Docker

## โครงสร้าง

```
app/
├── docker-compose.yml   # PostgreSQL — host port 5433 (5432 ถูก container โปรเจกต์อื่นใช้อยู่ ห้ามเปลี่ยนกลับ)
├── backend/             # Loco.rs app (API port 5150)
└── frontend/            # Expo app — routes อยู่ใน src/app/ (Expo Router), non-route code อยู่นอก src/app/
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

## สถานะงาน (อัปเดต 2026-10-27)

- [x] docker-compose.yml + PostgreSQL รันแล้ว (port 5433)
- [x] Rust stable 1.99.1 + loco CLI v1.2.0
- [x] Expo frontend scaffold (`frontend/`)
- [ ] Backend scaffold — **blocked**: `loco new` error `IO NotFound` อยู่ระหว่างแก้
- [ ] Migrations, models, seed
- [ ] REST API + tests
- [ ] Frontend screens (Notes / Learn tabs)
- [ ] Visualizers + playback controls
- [ ] Verify end-to-end

## ข้อควรระวัง

- เครื่องนี้ไม่มี `psql` client — ใช้ `docker exec ojnotes-postgres psql ...` แทน
- ห้ามแตะ container `gpo-enabler-postgres` (ของโปรเจกต์อื่น กำลังรันอยู่)
- `ios/` และ `android/` เป็น generated — ห้ามสร้าง/แก้เอง
