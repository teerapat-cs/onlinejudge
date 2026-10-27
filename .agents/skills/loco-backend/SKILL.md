---
name: loco-backend
description: ทำงานกับ Loco.rs backend ของโปรเจกต์ onlinejudge/app — รัน server, generate, migrate, seed, test, และ gotchas เฉพาะเครื่องนี้ (port 5433, ไม่มี psql client)
---

# Loco.rs Backend (app/backend)

REST API สำหรับระบบจด note โจทย์ + algorithm catalog

## คำสั่ง

รันทุกคำสั่งจาก `app/backend/`:

```bash
cargo loco start          # dev server → http://localhost:5150
cargo loco db migrate     # apply migrations (ต้องรัน postgres ก่อน)
cargo loco db seed        # seed algorithm catalog
cargo loco db reset       # drop + recreate + migrate + seed
cargo loco generate migration <snake_case_name>
cargo loco generate model <table> <field:type[! or ^]...>   # ! = not null, ^ = nullable
cargo test                # รัน tests (ต้องมี test database ตาม config/test.yaml)
```

## Database

- Docker: `docker compose up -d` จาก `app/` (container `ojnotes-postgres`)
- **Host port 5433 ไม่ใช่ 5432** — 5432 ถูก container `gpo-enabler-postgres` ของโปรเจกต์อื่นใช้อยู่ ห้าม stop/แตะ
- URI: `postgres://loco:loco@localhost:5433/ojnotes_development` — ตั้งใน `config/development.yaml` และ `config/test.yaml`
- ไม่มี psql client ในเครื่อง → ใช้ `docker exec -it ojnotes-postgres psql -U loco -d ojnotes_development`

## Conventions

- CLI ที่ใช้คือ `loco` v1.x (crate `loco`) — `loco-cli` ถูก deprecate แล้ว ห้ามติดตั้งกลับ
- Routes ลงทะเบียนใน `src/app.rs` หรือผ่าน `src/controllers/` ตาม scaffold
- Response ใช้ `format::json(...)`; validation ด้วย `validator` crate บน params struct
- ทุก model ใช้ SeaORM entity ใน `src/models/_entities/` (generated — ห้ามแก้เอง ให้ regenerate)
- ก่อนปิดงาน: `cargo test` ต้องผ่าน และ `cargo loco start` แล้วยิง API จริงด้วย curl

## Endpoints ปัจจุบัน

- `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/:id` — note ของโจทย์ (content เป็น markdown)
- `GET /api/algorithms`, `GET /api/algorithms/:slug` — catalog สำหรับหน้า Learn (read-only, seed จากฝั่ง backend)
