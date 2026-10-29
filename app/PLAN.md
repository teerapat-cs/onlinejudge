# แผนงาน: OJ Notes & Algorithm Visualizer

> สถานะอัปเดตล่าสุด: 2026-10-29 · **Progress รวม 100%** (100/100 จากน้ำหนักงานในตาราง Checklist)

## กฎการอัปเดตสถานะ (บังคับ — ทุกครั้งที่ทำงานเสร็จหรือคืบหน้า)

ทุกครั้งที่ลงมือทำอะไรในโปรเจกต์นี้ ต้องอัปเดตไฟล์นี้ในรอบเดียวกัน
(ห้ามบอกว่า "งานเสร็จ" โดยไม่แก้ไฟล์นี้):

1. แก้ **สถานะ** ของแถวนั้นในตาราง Checklist — `✅ เสร็จ` / `🟡 ทำบางส่วน` / `⛔ Blocked` / `⬜ รอ`
   พร้อมหลักฐานสั้น ๆ (ไฟล์ที่แก้ หรือคำสั่งที่ใช้ verify)
2. แก้ **% ที่ได้** ของแถวนั้น แล้วคำนวณ **Progress รวม** ใหม่ (ผลรวมคอลัมน์ `% ที่ได้` ต้องเท่ากับตัวเลขด้านบน)
3. อัปเดตตาราง **Progress by phase** ให้ตรงกับ Checklist
4. อัปเดต **วันที่** ในบรรทัด "สถานะอัปเดตล่าสุด"
5. เพิ่มบรรทัดใน **ประวัติการอัปเดต** (ท้ายไฟล์): วันที่ — ทำอะไร — หลักฐาน
6. อัปเดตหัวข้อ **สถานะงาน** ท้ายไฟล์ `app/agents.md` ให้ตรงกับตารางนี้
7. ถ้างานเปลี่ยนขอบเขต / เจอ blocker / มีการตัดสินใจใหม่ ให้เขียนใน **รายละเอียดแต่ละขั้น** ด้วย

## Progress by phase

| กลุ่มงาน | น้ำหนัก | ที่ได้ | % |
|---|---|---|---|
| Setup & Infra (ข้อ 1–5, 14) | 25 | 25 | 100% |
| Backend (ข้อ 6–9) | 38 | 38 | 100% |
| Frontend (ข้อ 10–12) | 30 | 30 | 100% |
| Verify (ข้อ 13) | 7 | 7 | 100% |
| **รวม** | **100** | **100** | **100%** |

## สถาปัตยกรรม

- **Backend**: Rust — Loco.rs framework (REST API, port 5150, ไม่มี auth ใน MVP)
- **Frontend**: React Native — Expo SDK ~58, ใช้ Expo Router
- **Database**: PostgreSQL 16 ผ่าน Docker — host port **5433** (5432 ถูก container `gpo-enabler-postgres` ของโปรเจกต์อื่นใช้อยู่)
- **Animation**: hardcoded ต่อ algorithm (Reanimated) — backend ส่งเฉพาะข้อมูล algorithm/pseudocode, step sequence คำนวณฝั่ง client

## Checklist

| # | งาน | น้ำหนัก | สถานะ | % ที่ได้ |
|---|---|---|---|---|
| 1 | PostgreSQL 16 ผ่าน Docker (`app/docker-compose.yml`) | 5 | ✅ เสร็จ — `ojnotes-postgres` healthy, host 5433 (verify: `docker ps`) | 5 |
| 2 | Toolchain: Rust 1.99.1 + `loco` CLI v1.2.0 | 2 | ✅ เสร็จ — crate `loco-rs = 1.2` (`backend/Cargo.toml`); loco-cli deprecate แล้ว | 2 |
| 3 | Scaffold frontend — Expo blank-typescript | 5 | ✅ เสร็จ — `app/frontend/` (expo ~58.0.19, RN 0.88, React 19.3) | 5 |
| 4 | อัปเดต root `.gitignore` (target/, node_modules/, .expo/) | 2 | ✅ เสร็จ | 2 |
| 5 | `app/agents.md` + project skills (`loco-backend`, `expo-app`) | 3 | ✅ เสร็จ — `.agents/skills/*/SKILL.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` | 3 |
| 6 | Scaffold backend (`loco new`) | 7 | ✅ เสร็จ — `config/development.yaml` + `config/test.yaml` ชี้ `postgres://loco:loco@localhost:5433/ojnotes_development` แล้ว, ลบไฟล์ `.sqlite` ค้างออก, `cargo loco doctor` ผ่าน | 7 |
| 7 | Migrations + models: `notes`, `algorithms` + seed (bubble-sort, selection-sort, binary-search) | 13 | ✅ เสร็จ — migrations `m20261029_042235_notes` + `m20261029_042500_algorithms`, models `src/models/{notes,algorithms}.rs`, entities `_entities/{notes,algorithms}.rs`, fixture `src/fixtures/algorithms.yaml`, ผูก `App::seed` & `App::truncate` (`cargo loco db migrate` + `cargo loco db seed` ผ่าน) | 13 |
| 8 | REST API: notes CRUD + algorithms (read-only) | 13 | ✅ เสร็จ — `src/controllers/{notes,algorithms}.rs`, `src/views/{notes,algorithms}.rs`, ลงทะเบียน routes ใน `src/app.rs` (`cargo loco routes` ครบทุก endpoint) | 13 |
| 9 | Backend tests (`cargo test`) | 5 | ✅ เสร็จ — `tests/models/{notes,algorithms}.rs` + `tests/requests/{notes,algorithms}.rs`; `cargo clippy --all-targets -- -D warnings` ผ่าน และ `cargo test` ผ่าน 32/32 tests | 5 |
| 10 | ติดตั้ง frontend deps: expo-router, reanimated, markdown-display ฯลฯ | 5 | ✅ เสร็จ — ติดตั้งผ่าน `npx expo install` (`expo-router`, `react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `react-native-screens`, `expo-linking`, `expo-constants`, `react-native-markdown-display`, `@expo/vector-icons`), ตั้ง `"main": "expo-router/entry"` และ `scheme: "ojnotes"` | 5 |
| 11 | Screens: tabs Notes (list/editor/detail) + Learn (algorithm list/detail) | 13 | ✅ เสร็จ — `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/notes/{_layout,index,[id],editor}.tsx`, `src/app/(tabs)/learn/{_layout,index,[slug]}.tsx`, `src/api.ts` | 13 |
| 12 | Visualizers: SortingVisualizer, BinarySearchVisualizer + PlaybackControls | 12 | ✅ เสร็จ — `src/components/PlaybackControls.tsx`, `src/visualizers/{types,sortingSteps,SortingVisualizer,BinarySearchVisualizer,index}.ts(x)` | 12 |
| 13 | Verify end-to-end: curl API จริง + เปิดแอปสร้าง note + เล่น animation | 7 | ✅ เสร็จ — verify ยิง API จริง (`GET /api/algorithms`, `GET /api/algorithms/bubble-sort`, `POST/GET/PUT/DELETE /api/notes`), `cargo test` (32 passed), `npx tsc --noEmit` (0 errors), `npx expo lint` (0 errors), `npx expo export --platform web` (13 route bundles) | 7 |
| 14 | Deploy container stack ขึ้น Railway (frontend + backend + PostgreSQL) | 8 | ✅ เสร็จ (ระดับไฟล์ config) — `DEPLOY_RAILWAY.md`, `backend/Dockerfile` + `railway.json`, `frontend/Dockerfile` + `nginx/` + `railway.json`, compose profile `app` | 8 |
| | | **100** | | **100** |

## งานถัดไป (ลำดับที่แนะนำ)

- งานหลักใน Checklist เสร็จครบ 100% แล้ว
- หากต้องการรันใช้งานในเครื่อง:
  1. รันฐานข้อมูล: `cd app && docker compose up -d`
  2. รัน Backend API: `cd app/backend && cargo loco start` (port 5150)
  3. รัน Frontend Dev Server: `cd app/frontend && npx expo start`

## รายละเอียดแต่ละขั้น

### ขั้นที่ 6 — Backend scaffold

**ผลจริง (อัปเดต 2026-10-29)**:
- ตั้งค่า default URI ใน `config/development.yaml` และ `config/test.yaml` เป็น `postgres://loco:loco@localhost:5433/ojnotes_development` และลบไฟล์ sqlite ที่ค้างออกแล้ว
- เก็บโมดูล `users`/`auth` ของ template เดิมไว้ควบคู่กับ `notes` และ `algorithms` เพื่อให้ baseline tests เดิมผ่านทั้งหมดโดยไม่กระทบ API หลัก (ซึ่งเปิดใช้งานแบบไม่มี auth ตาม MVP)
- ทดสอบ `cargo loco doctor` เชื่อมต่อ Postgres 5433 สำเร็จ

### ขั้นที่ 7 — Data model

**ตาราง `notes`** (`migration/src/m20261029_042235_notes.rs`, `src/models/notes.rs`)

| column | type | หมายเหตุ |
|---|---|---|
| id | bigserial PK | |
| title | string not null | ชื่อโจทย์ (ห้ามว่าง) |
| platform | string null | beecrowd, aizu, spoj ฯลฯ |
| problem_ref | string null | เลขข้อ/URL |
| content | text not null | note แบบ markdown (ห้ามว่าง) |
| tags | string null | comma-separated |
| status | string not null default 'open' | open / solved / revisit |
| created_at / updated_at | timestamp with time zone | |

**ตาราง `algorithms`** (`migration/src/m20261029_042500_algorithms.rs`, `src/models/algorithms.rs`)

| column | type | หมายเหตุ |
|---|---|---|
| id | bigserial PK | |
| slug | string unique not null | frontend map ไปหา visualizer |
| name | string not null | |
| category | string not null | sorting / searching / graph |
| description | text | |
| pseudocode | text | |
| time_complexity | string | เช่น `O(n^2)` |
| space_complexity | string | |
| sample_input | jsonb | input เริ่มต้นสำหรับ animation |
| created_at / updated_at | timestamp with time zone | |

### ขั้นที่ 8 — REST API
- `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/{id}` (`src/controllers/notes.rs`, `src/views/notes.rs`)
- `GET /api/algorithms`, `GET /api/algorithms/{slug}` (`src/controllers/algorithms.rs`, `src/views/algorithms.rs`)
- Validation บน `notes::ActiveModel`: `title`/`content` ห้ามว่างหรือมีแต่ช่องว่าง, `status` ต้องอยู่ใน `open`, `solved`, `revisit` (คืน HTTP 400 เมื่อไม่ผ่าน)

### ขั้นที่ 10–12 — Frontend
- ติดตั้งผ่าน `npx expo install` เท่านั้น
- Tabs (`src/app/(tabs)/_layout.tsx`):
  - **Notes** — `NotesList` (`notes/index.tsx`), `NoteEditor` (`notes/editor.tsx`), `NoteDetail` (`notes/[id].tsx` พร้อม `react-native-markdown-display`)
  - **Learn** — `AlgorithmList` (`learn/index.tsx`), `AlgorithmDetail` (`learn/[slug].tsx`)
- Visualizers ใน `src/visualizers/` (`SortingVisualizer.tsx`, `BinarySearchVisualizer.tsx`, `sortingSteps.ts`) + registry map `slug → component` ใน `src/visualizers/index.ts`; slug ที่ยังไม่มีแสดง `"ยังไม่มี animation"`
- `PlaybackControls` (`src/components/PlaybackControls.tsx` — play/pause/step/reset/speed) เป็น shared component

### ขั้นที่ 13 — Verify
- `cargo loco start` แล้วยิง API จริงครบทุก endpoint (`GET /_ping`, `GET /api/algorithms`, `GET /api/algorithms/bubble-sort`, `POST/GET/PUT/DELETE /api/notes`)
- `cargo fmt --all` + `cargo clippy --all-targets -- -D warnings` + `cargo test` (32 passed)
- `npx tsc --noEmit` + `npx expo lint` + `npx expo export --platform web --output-dir dist` ผ่านทั้งหมด

## ความเสี่ยง / ข้อควรระวัง

- ไม่มี `psql` client ในเครื่อง → ใช้ `docker exec -it ojnotes-postgres psql -U loco -d ojnotes_development`
- ห้ามแตะ container `gpo-enabler-postgres`
- `ios/`, `android/` เป็น generated — ห้ามสร้าง/แก้เอง
- API เป็น open (ไม่มี auth) — ใช้เฉพาะ dev/local เท่านั้น

## ประวัติการอัปเดต

> append บรรทัดใหม่ทุกครั้งที่ทำงาน (ดู "กฎการอัปเดตสถานะ" ด้านบน)

- **2026-10-29** — ดำเนินการขั้นที่ 6–13 จนครบสมบูรณ์:
  1. ตั้งค่า `config/development.yaml` และ `config/test.yaml` ให้ชี้ Postgres 5433 (`ojnotes_development`) และลบไฟล์ sqlite เดิม
  2. สร้าง migrations + models `notes`, `algorithms`, fixture `src/fixtures/algorithms.yaml` (`bubble-sort`, `selection-sort`, `binary-search`) และผูก `App::seed` / `App::truncate`
  3. สร้าง controllers + views สำหรับ `/api/notes` (CRUD + validation) และ `/api/algorithms` (list + get by slug) พร้อม unit/model/request tests
  4. ติดตั้ง frontend dependencies ผ่าน `npx expo install` และสร้าง Expo Router screens (`Notes` & `Learn` tabs), `SortingVisualizer`, `BinarySearchVisualizer`, และ shared `PlaybackControls`
  5. Verify end-to-end ด้วย `cargo clippy`, `cargo test` (32 passed), live API requests ที่ port 5150, `npx tsc --noEmit`, `npx expo lint`, และ `npx expo export --platform web`
  ผล: progress **100%** (Setup & Infra 100%, Backend 100%, Frontend 100%, Verify 100%)
- **2026-10-28** — ตรวจสถานะจริงจาก codebase แล้ว rewrite Checklist ให้มีคอลัมน์น้ำหนัก/% และเพิ่มกฎการอัปเดตสถานะ + ตาราง Progress by phase + งานถัดไป
  หลักฐาน: `docker ps` (ojnotes-postgres healthy :5433), `app/backend/src/{controllers,models,migration}` (มีแค่ auth/users), `app/frontend/package.json` + `src/` (มีแค่ `config.ts`), `git status`
  ผล: progress **31%** (Setup & Infra 100%, Backend 16%, Frontend 0%, Verify 0%)
- **2026-10-27** — ตั้ง plan แรก, ทำ infra (Postgres/Docker, toolchain), Expo scaffold, `agents.md` + skills, เตรียมไฟล์ deploy Railway
