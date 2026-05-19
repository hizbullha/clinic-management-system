// backend/src/config/data-source.js
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { UserEntity } from "../entities/User.entity.js";
import { DoctorEntity } from "../entities/Doctor.entity.js";
import { AppointmentEntity } from "../entities/Appointment.entity.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",

  // -----------------------------
  // OPTION 1: Production (recommended)
  // -----------------------------
  url: process.env.DATABASE_URL,

  // -----------------------------
  // OPTION 2: Local fallback
  // -----------------------------
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // -----------------------------
  // CRITICAL FIX
  // -----------------------------
  synchronize: isProduction ? false : true,

  logging: false,

  entities: [UserEntity, DoctorEntity, AppointmentEntity],
  subscribers: [],
  migrations: [],

  // -----------------------------
  // SSL FIX (for hosted DBs)
  // -----------------------------
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});