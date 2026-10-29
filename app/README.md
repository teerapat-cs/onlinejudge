# OJ Notes & Algorithm Visualizer

จด note โจทย์ online judge + ดู animation การทำงานของ algorithm

- **backend/** — Rust + Loco.rs (REST API, port 5150)
- **frontend/** — React Native + Expo (SDK ~58)
- **database** — PostgreSQL 16 (`docker-compose.yml`, host port 5433)

## เริ่มใช้งาน

```bash
cd app
docker compose up -d          # PostgreSQL
cd backend && cargo loco start
cd frontend && npx expo start
```

## Deploy

ทั้ง stack (frontend + backend + PostgreSQL) deploy ขึ้น Railway แบบ container ได้:
ดู [`DEPLOY_RAILWAY.md`](./DEPLOY_RAILWAY.md)

```bash
cd app
docker compose --profile app up --build   # รันทั้ง stack ในเครื่อง (web :8080, API :5150)
```

รายละเอียด convention ทั้งหมดอยู่ใน [`agents.md`](./agents.md)
