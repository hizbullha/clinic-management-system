// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './src/config/data-source.js';
import authRoutes from './src/routes/authRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- CORS CONFIG --------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(" Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

// -------------------- MIDDLEWARE --------------------
app.use(express.json());

// -------------------- HEALTH CHECK --------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'PERN API running successfully'
  });
});

// -------------------- ROUTES --------------------
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// -------------------- 404 HANDLER --------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// -------------------- START SERVER AFTER DB CONNECT --------------------
AppDataSource.initialize()
  .then(() => {
    console.log(" Database connected successfully");

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });