# 📝 Task Management API

A modular **Node.js + Express** backend for managing tasks with user authentication, built with **MongoDB Atlas** and **JWT**.  
This project demonstrates **clean architecture**, **security best practices**, and **scalable API design**.

---

## 🚀 Features

- 🔒 **Authentication & Authorization**

  - User registration & login with JWT tokens
  - Passwords hashed securely with bcrypt
  - Role-based access (`user` / `admin`)

- 📌 **Task Management**

  - Create, update, delete, and retrieve tasks
  - Filter tasks by status (`ALL`, `PENDING`, `LATE`, `DONE`)
  - Sort tasks by `id`, `title`, or `dueDate`
  - Update task priority (`LOW`, `MID`, `HIGH`)
  - Ownership rules → users can only manage their own tasks, admin can manage all

- 📂 **Project Standards**

  - Consistent JSON responses
  - Centralized error handling
  - Modular structure (routes, models, utils, middleware)
  - Environment-based configuration with dotenv

- 📖 **API Documentation**
  - Integrated Swagger (OpenAPI 3.0)
  - Interactive docs at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + bcrypt
- **Documentation:** Swagger + swagger-jsdoc + swagger-ui-express
- **Testing (planned):** Jest + Supertest
- **Deployment Ready (planned):** Docker & Docker Compose

---

## 📂 Project Structure

```

src/
├─ app.js              # Express app setup
├─ server.js           # Server entry point
├─ config/             # DB + Swagger config
├─ models/             # Mongoose schemas
├─ routes/             # API endpoints
├─ middleware/         # Auth & error handling
└─ utils/              # Validators & response helpers

```

---

## ⚙️ Getting Started

### 1. Clone repository

```bash
git clone https://github.com/GuyBenja/Task-Management-API.git
cd Task-Management-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=3000
MONGODB_CONNECTION_STRING="your-mongodb-uri"
JWT_SECRET="your-secret-key"
```

### 4. Run the server

```bash
npm start
```

The server will be running at:

- Health check → [http://localhost:3000/health](http://localhost:3000/health)
- Swagger docs → [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📌 API Overview

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| GET    | /health         | Health check               |
| POST   | /auth/register  | Register a new user        |
| POST   | /auth/login     | Login & receive JWT cookie |
| POST   | /tasks/new      | Create a task              |
| GET    | /tasks/size     | Get task count             |
| GET    | /tasks/content  | Get filtered tasks         |
| PUT    | /tasks/status   | Update task status         |
| PUT    | /tasks/priority | Update task priority       |
| DELETE | /tasks          | Delete a task              |

📌 Full request/response examples → use Swagger UI.

---

## 🎯 Roadmap

- [x] Add Swagger documentation
- [ ] Add automated tests (Jest + Supertest)
- [ ] Dockerize (API + MongoDB)
- [ ] Expand admin-only endpoints
- [ ] Add CI/CD pipeline (GitHub Actions)

---

## 👤 About Me

I am a **junior software developer** with a B.Sc. in Computer Science.
This project is part of my portfolio to demonstrate backend development, security practices, and clean API design.

Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/guy-binyamin-1a4323286/) or explore more of my work.

---
