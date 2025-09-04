# 📝 Task Manager — Monorepo (Backend + Mobile)

A full-stack **Task Management** project:

- **Backend** — Node.js + Express + MongoDB (JWT + RBAC, Swagger, tests)
- **Mobile** — React Native (Expo), consuming the API with cookie-based auth

Built to demonstrate **clean architecture**, **security best practices**, and **production-ready API + client**.

---

## 🌳 Repository Structure

```
Task-Management-API/
├─ backend/                      # Node + Express + MongoDB API
│  ├─ src/
│  │  ├─ app.js                  # Express app setup (security, routes, docs)
│  │  ├─ server.js               # Server entry (binds 0.0.0.0)
│  │  ├─ config/
│  │  │  ├─ db.js                # Mongoose connect/disconnect
│  │  │  └─ swagger.js           # OpenAPI (swagger-jsdoc)
│  │  ├─ middleware/             # auth, error handler
│  │  ├─ models/                 # User.js, Task.js (Mongoose)
│  │  ├─ routes/                 # auth.routes.js, tasks.routes.js
│  │  └─ utils/                  # responses.js, validators.js
│  ├─ tests/                     # Jest + Supertest (auth, RBAC, pagination)
│  ├─ .env / .env.test / .env.example
│  └─ package.json
├─ mobile/                       # Expo React Native app
│  ├─ App.tsx
│  ├─ app.json
│  └─ src/
│     ├─ api/                    # axios client
│     ├─ components/             # TaskCard, TaskActions, FiltersBar, etc.
│     ├─ config/env.ts           # API_BASE_URL (your LAN IP)
│     ├─ context/                # AuthContext (SecureStore)
│     ├─ navigation/             # Stack navigator
│     ├─ screens/                # Login, Register, Tasks
│     └─ theme/ui/hooks/...      # UI & helpers
├─ package.json                  # Root (workspaces + scripts + overrides)
└─ .gitignore
```

---

## 🚀 Features

### Backend

- 🔒 **Auth & RBAC** — Register/Login with JWT (cookie), bcrypt hashing; roles: `user` / `admin`
- ✅ **Tasks**

  - Create / list / update status / update priority / delete
  - **Filters**: `ALL | PENDING | LATE | DONE`
  - **Sorting**: `id | dueDate | title | priority | status`

    > `id` maps to creation time (`createdAt`) for stable order

  - **Pagination**: `limit` (1–100, default 20), `skip` (offset)
  - Ownership: users see/manage **their** tasks; admin sees/manages **all**

- 🧱 **API**

  - Consistent envelope `{ success, message, data, error }`
  - Central error handler
  - Swagger (OpenAPI) at `/api-docs`

- 🛡️ **Security**

  - Helmet, CORS, rate-limit, cookie parser

### Mobile (Expo)

- 📱 **Screens**: Login, Register, Tasks
- 🧭 **UX**: 3-dot actions per task (change Status/Priority), clear Logout, “New Task”
- 🔎 **Filters**: status + sort (incl. `dueDate`)
- 🔐 **Auth**: cookie + token persisted with `expo-secure-store`

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt
- **Docs:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Mobile:** React Native (Expo), React Navigation, axios, SecureStore
- **Tests:** Jest + Supertest

---

## ⚙️ Getting Started

### 1) Clone

```bash
git clone https://github.com/GuyBenja/Task-Management-API.git
cd Task-Management-API
```

### 2) Install (root + workspaces)

```bash
# root
npm install

# backend
cd backend && npm install

# mobile
cd ../mobile && npm install
```

### 3) Environment

#### `backend/.env`

```env
PORT=3000
MONGODB_CONNECTION_STRING="your-mongodb-uri"
JWT_SECRET="your-secret-key"

# Security / rate limiting
CORS_ORIGINS=*
RATE_WINDOW_MINUTES=15
RATE_MAX=100
```

#### `backend/.env.test` (for tests — separate DB)

```env
MONGODB_CONNECTION_STRING_TEST="your-test-db-uri"
JWT_SECRET=supersecret
NODE_ENV=test
```

#### `mobile/src/config/env.ts`

```ts
// Use your computer's LAN IP so the phone can reach the API.
export const API_BASE_URL = "http://<YOUR_LAN_IP>:3000";
```

> iPhone and PC must be on the **same Wi-Fi**. If needed, allow TCP 3000 in Windows Firewall.

### 4) Run

**Backend (Swagger at /api-docs):**

```bash
# from repo root
npm run start:api
# or
cd backend && npm start
```

**Mobile (Expo):**

```bash
cd mobile
# Prefer local CLI (avoids npx cache issues):
npm run start -- -c
# or explicitly:
node ./node_modules/expo/bin/cli.js start -c
```

- Press **`t`** in Expo terminal to switch to **Tunnel** if LAN doesn’t work.
- Scan the QR with **Expo Go** (iOS).

---

## 📌 API Overview

| Method | Endpoint          | Description                                      |
| -----: | ----------------- | ------------------------------------------------ |
|   POST | `/auth/register`  | Create user (username, password, role)           |
|   POST | `/auth/login`     | Login → sets `token` cookie (+ returns token)    |
|   POST | `/tasks/new`      | Create task (owner = current user)               |
|    GET | `/tasks/size`     | Count tasks (by `status`)                        |
|    GET | `/tasks/content`  | List tasks with `status`, `sortBy`, `limit/skip` |
|    PUT | `/tasks/status`   | Update task status (owner/admin)                 |
|    PUT | `/tasks/priority` | Update task priority (owner/admin)               |
| DELETE | `/tasks`          | Delete task (owner/admin)                        |

**`/tasks/content` query params**

- `status`: `ALL | PENDING | LATE | DONE` (default `ALL`)
- `sortBy`: `id | dueDate | title | priority | status`
- `limit`: 1–100 (default 20), `skip`: 0+

📖 Full schemas & examples in **Swagger** → `/api-docs`.

---

## 🧪 Tests (Backend)

```bash
# from repo root
npm run test:api

# or directly:
cd backend && npm test
```

- Uses `.env.test` (separate Atlas DB).
- Includes E2E for **auth**, **RBAC**, **pagination**.

---

## 🔐 Security Notes

- **Never** commit `.env` / real Atlas URIs. If leaked — rotate credentials.
- Use strong `JWT_SECRET`; set secure cookie flags behind HTTPS in production.
- Rate-limit + Helmet are enabled; tune via env vars.

---

## 🧯 Expo Troubleshooting

**Error:** `Package subpath './src/lib/TerminalReporter' is not defined by "exports" in metro`
**Cause:** global `npx` pulled Metro 0.83.x which Expo SDK doesn’t expect.
**Fix:**

```powershell
# PowerShell – from anywhere
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx" -ErrorAction SilentlyContinue

# run Expo using the local CLI
cd mobile
node .\node_modules\expo\bin\cli.js start -c
```

---

## 🗺️ Roadmap

- [x] Swagger documentation for all endpoints
- [x] E2E tests: auth, RBAC, pagination
- [ ] Task edit endpoint (title/content/dueDate + status recompute)
- [ ] Search & date range filters
- [ ] Docker & docker-compose (API + Mongo)
- [ ] CI (GitHub Actions): lint + test + optional Docker build
- [ ] Refresh tokens & `/auth/logout` + axios retry interceptor

---

## 👤 About

I’m a junior software developer (B.Sc. in CS).
This project demonstrates end-to-end API & Mobile implementation with robust auth, RBAC, and clean architecture.

- LinkedIn — [https://www.linkedin.com/in/guy-binyamin-1a4323286/](https://www.linkedin.com/in/guy-binyamin-1a4323286/)
