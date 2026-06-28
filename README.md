# AgriMate Admin Dashboard

Web dashboard for administrators — React + Vite + TypeScript, Leaflet + OpenStreetMap.
Talks only to the Spring Boot backend; login is restricted to `ADMIN` accounts.

## Run
```bash
npm install
echo "VITE_API_URL=http://localhost:8080" > .env
npm run dev          # → http://localhost:5173
```
Log in with the seeded admin (default `0700000000` / `admin123` — change in production).

## Features
- **Outbreak map** — scan GPS plotted on Leaflet/OSM, color-coded by disease, filter by
  disease and time window, popups with confidence + date, live legend counts.
- **Analytics** — stat cards (scans, users, farmers, pending agronomists) + bar chart of
  detections by disease + weekly scan-trend line (recharts).
- **User management** — list/filter users, approve/reject pending agronomists, suspend/unsuspend.

## Structure
```
src/
  api/         axios client (JWT refresh) + endpoints + types
  auth/        AuthContext (admin-only login)
  components/  Layout (sidebar)
  pages/       Login, OutbreakMap, Analytics, Users
  lib/         formatting + disease colors
```

## Build
```bash
npm run build    # tsc + vite build → dist/
```
"# Agrimate-Admin-Frontend" 
