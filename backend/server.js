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

/* -------------------- TRUST PROXY (Railway/Vercel safety) -------------------- */
app.set('trust proxy', 1);

/* -------------------- CORS CONFIG -------------------- */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow REST tools like Postman (where origin is undefined)
      if (!origin) return callback(null, true);

      // 1. Exact match check against whitelisted items
      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      
      // 2. Dynamic check allowing any production/preview Vercel subdomain tier
      const isVercelSubdomain = origin.endsWith('.vercel.app');

      if (isExplicitlyAllowed || isVercelSubdomain) {
        return callback(null, true);
      }

      // Log blocked origins for clean tracking in your Railway terminal
      console.log("❌ CORS Blocked:", origin);
      return callback(new Error("CORS policy violation"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Clinic API running successfully"
  });
});

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);

  // If a CORS error drops here, setting the status code to 403 prevents generic 500 crashes
  const statusCode = err.message === "CORS policy violation" ? 403 : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* -------------------- START SERVER -------------------- */
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
  });