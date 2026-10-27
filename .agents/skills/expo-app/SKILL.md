---
name: expo-app
description: ทำงานกับ Expo/React Native frontend ของโปรเจกต์ onlinejudge/app — expo install, dev server, API base URL, navigation และ conventions ของ algorithm visualizers
---

# Expo Frontend (app/frontend)

Expo SDK ~58, React Native 0.88, React 19 — กฎพื้นฐานของ Expo อยู่ใน `app/frontend/AGENTS.md` (อ่านก่อนเสมอ โดยเฉพาะเรื่องห้ามเชื่อ training data ของ Expo API)

## คำสั่ง

รันจาก `app/frontend/`:

```bash
npx expo install <package>   # ห้าม npm add — ต้อง expo install เท่านั้น
npx expo start               # dev server (เปิดด้วย Expo Go หรือ emulator)
npx tsc --noEmit             # typecheck — ต้องผ่านก่อนปิดงาน
npx expo lint                # lint — ต้องผ่านก่อนปิดงาน
```

## การเชื่อม backend

- Backend (Loco) รันที่ port **5150**
- Base URL อยู่ใน `src/config.ts`:
  - Android emulator: `http://10.0.2.2:5150`
  - iOS simulator / Expo Go บนเครื่องเดียวกัน: `http://localhost:5150`
  - มือถือจริงผ่าน Expo Go: ใช้ IP ของเครื่อง dev เช่น `http://192.168.x.x:5150`

## Navigation

- ใช้ Expo Router — screens อยู่ใน `src/app/`, ทุกไฟล์คือ route, `_layout.tsx` คือ navigator
- Tabs หลัก 2 อัน: **Notes** (list/editor/detail) และ **Learn** (algorithm list/detail)

## Algorithm Visualizers (hardcoded ต่อ algorithm)

- อยู่ใน `src/visualizers/` — แต่ละ algorithm เป็น component ของตัวเอง
- Registry ใน `src/visualizers/index.ts`: map `slug → component`; slug ที่ไม่มีใน map ให้แสดง "ยังไม่มี animation"
- Step sequence (compare/swap/highlight) คำนวณฝั่ง client จาก `sample_input` ที่ backend ส่งมา — backend ไม่ส่ง steps
- Animation ใช้ `react-native-reanimated` (shared values + withTiming); อย่าลืม babel plugin ตาม doc ของ SDK ปัจจุบัน
- Playback controls (play/pause/step/reset/speed) เป็น shared component — ห้ามเขียนแยกในแต่ละ visualizer

## Visualizers ที่มี

- `SortingVisualizer` — ใช้ร่วมกันระหว่าง `bubble-sort`, `selection-sort` (รับ steps จากฟังก์ชันคำนวณของแต่ละ slug)
- `BinarySearchVisualizer` — `binary-search` (low/mid/high pointers)
