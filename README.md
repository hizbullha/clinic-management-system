# 🏥 Clinic Management System (PERN Stack)

A full-stack Clinic Management System built using PostgreSQL, Express, React, and Node.js (PERN Stack).  
It supports authentication, role-based access control, and appointment management.

# 🚀 Live Demo

Frontend: https://your-vercel-link.vercel.app  
Backend API: https://your-render-link.onrender.com  

# 🛠️ Tech Stack
Frontend:
- React (Vite)
- JavaScript (ES Modules)
- Fetch API / Axios
- CSS / Tailwind (optional)

Backend:
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- CORS
- dotenv

Database:
- PostgreSQL (Supabase)
- TypeORM + Raw SQL
- 
# ✨ Features

- User Registration & Login
- JWT Authentication
- Role-based Access (Patient / Doctor / Admin)
- Appointment Booking System
- View / Manage Appointments
- Secure Password Hashing (bcrypt)
- REST API Architecture
- PostgreSQL Database Integration
---
# 📁 Project Structure

backend/
  src/
    config/
    controllers/
    routes/
    middleware/
  server.js
  package.json

frontend/
  src/
  public/
  vite.config.js
  package.json
---
# ⚙️ Environment Variables

## Backend (.env)

NODE_ENV=development
PORT=5000

DATABASE_URL=your_supabase_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

---
## Frontend (.env)

VITE_API_URL=http://localhost:5000

---

# 🚀 Local Setup

## 1. Clone repository

git clone https://github.com/your-username/clinic-management-system.git
cd clinic-management-system

---

## 2. Backend setup

cd backend
npm install
npm run dev

---

## 3. Frontend setup

cd frontend
npm install
npm run dev

---

# 🗄️ Database Setup (Supabase)

- Create Supabase project
- Copy PostgreSQL connection string
- Add to backend .env as DATABASE_URL
- Ensure tables exist:
  - users
  - doctors
  - appointments

---

# 📡 API Endpoints

## Auth
POST /api/auth/register
POST /api/auth/login

## Appointments
POST /api/appointments
GET /api/appointments
PATCH /api/appointments/:id/status

---

# 🔒 Security Features

- Password hashing using bcryptjs
- JWT authentication
- Protected routes middleware
- Role-based authorization
- Environment variable protection

---

# 🚀 Deployment

Frontend (Vercel):
- Build: npm run build
- Output: dist
- Env: VITE_API_URL

Backend (Render):
- Start: node server.js
- Env:
  - DATABASE_URL
  - JWT_SECRET
  - CLIENT_URL

Database (Supabase):
- PostgreSQL hosted database
- Connected via DATABASE_URL

---

# ⚠️ Important Notes

- Never push .env files
- Always use .env.example for templates
- Update CLIENT_URL in production
- Restart backend after env changes

---

# 👨‍💻 Author

Your Name  
GitHub: https://github.com/your-username

---

# 📜 License

Educational / Portfolio Project
