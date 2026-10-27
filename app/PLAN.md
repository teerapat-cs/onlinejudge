# แผนงาน: OJ Notes & Algorithm Visualizer

> สถานะอัปเดตล่าสุด: 2026-10-27

## สถาปัตยกรรม

- **Backend**: Rust — Loco.rs framework (REST API, port 5150, ไม่มี auth ใน MVP)
- **Frontend**: React Native — Expo SDK ~58, ใช้ Expo Router
- **Database**: PostgreSQL 16 ผ่าน Docker — host port **5433** (5432 ถูก container `gpo-enabler-postgres` ของโปรเจกต์อื่นใช้อยู่)
- **Animation**: hardcoded ต่อ algorithm (Reanimated) — backend ส่งเฉพาะข้อมูล algorithm/pseudocode, step sequence คำนวณฝั่ง client

## Checklist

| # | งาน | สถานะ |
|---|---|---|
| 1 | PostgreSQL 16 ผ่าน Docker (`app/docker-compose.yml`) | ✅ เสร็จ — container `ojnotes-postgres`, port 5433, healthy |
| 2 | Toolchain: Rust 1.99.1 + `loco` CLI v1.2.0 | ✅ เสร็จ — update จาก 1.87; ใช้ crate `loco` (loco-cli deprecate แล้ว) |
| 3 | Scaffold frontend — Expo blank-typescript | ✅ เสร็จ — `app/frontend/` |
| 4 | อัปเดต root `.gitignore` (target/, node_modules/, .expo/) | ✅ เสร็จ |
| 5 | `app/agents.md` + project skills (`loco-backend`, `expo-app`) | ✅ เสร็จ |
| 6 | Scaffold backend (`loco new`) | ⛔ **Blocked** — `loco new` error `IO NotFound`; ถ้าแก้ไม่ได้จะ scaffold ด้วยมือตาม template มาตรฐาน |
| 7 | Migrations + models: `notes`, `algorithms` + seed (bubble-sort, selection-sort, binary-search) | ⬜ รอ |
| 8 | REST API: notes CRUD + algorithms (read-only) | ⬜ รอ |
| 9 | Backend tests (`cargo test`) | ⬜ รอ |
| 10 | ติดตั้ง frontend deps: expo-router, reanimated, markdown-display ฯลฯ | ⬜ รอ |
| 11 | Screens: tabs Notes (list/editor/detail) + Learn (algorithm list/detail) | ⬜ รอ |
| 12 | Visualizers: SortingVisualizer, BinarySearchVisualizer + PlaybackControls | ⬜ รอ |
| 13 | Verify end-to-end: curl API จริง + เปิดแอปสร้าง note + เล่น animation | ⬜ รอ |

## รายละเอียดแต่ละขั้น

### ขั้นที่ 6 — Backend scaffold
- แก้ปัญหา `loco new` error ก่อน; fallback คือ scaffold ด้วยมือ
- เลือก template Rest API, DB Postgres
- ตั้งค่า `config/development.yaml` + `config/test.yaml` → `postgres://loco:loco@localhost:5433/...`

### ขั้นที่ 7 — Data model

**ตาราง `notes`**

| column | type | หมายเหตุ |
|---|---|---|
| id | serial PK | |
| title | string not null | ชื่อโจทย์ |
| platform | string null | beecrowd, aizu, spoj ฯลฯ |
| problem_ref | string null | เลขข้อ/URL |
| content | text not null | note แบบ markdown |
| tags | string null | comma-separated |
| status | string not null default 'open' | open / solved / revisit |
| created_at / updated_at | timestamp | |

**ตาราง `algorithms`**

| column | type | หมายเหตุ |
|---|---|---|
| id | serial PK | |
| slug | string unique not null | frontend map ไปหา visualizer |
| name | string not null | |
| category | string not null | sorting / searching / graph |
| description | text | |
| pseudocode | text | |
| time_complexity | string | เช่น `O(n^2)` |
| space_complexity | string | |
| sample_input | jsonb | input เริ่มต้นสำหรับ animation |
| created_at / updated_at | timestamp | |

### ขั้นที่ 8 — REST API
- `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/:id`
- `GET /api/algorithms`, `GET /api/algorithms/:slug`
- Validation: title/content ห้ามว่าง, status ต้องอยู่ใน enum

### ขั้นที่ 10–12 — Frontend
- `npx expo install` เท่านั้น (ห้าม npm add)
- Tabs: **Notes** — NotesList / NoteEditor / NoteDetail (render markdown); **Learn** — AlgorithmList / AlgorithmDetail
- Visualizers ใน `src/visualizers/` + registry map `slug → component`; slug ที่ยังไม่มีแสดง "ยังไม่มี animation"
- PlaybackControls (play/pause/step/reset/speed) เป็น shared component

### ขั้นที่ 13 — Verify
- `cargo loco start` แล้วยิง curl ทุก endpoint จริง
- `cargo test` + `npx tsc --noEmit` + `npx expo lint` ต้องผ่าน
- เปิดแอป: สร้าง note → เห็นใน list; เปิด bubble sort → animation เล่นได้

## ความเสี่ยง / ข้อควรระวัง

- ไม่มี `psql` client ในเครื่อง → ใช้ `docker exec -it ojnotes-postgres psql -U loco -d ojnotes_development`
- ห้ามแตะ container `gpo-enabler-postgres`
- `ios/`, `android/` เป็น generated — ห้ามสร้าง/แก้เอง
- API เป็น open (ไม่มี auth) — ใช้เฉพาะ dev/local เท่านั้น
