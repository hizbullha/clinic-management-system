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
  // DATABASE URL (Prioritized for Railway)
  // -----------------------------
  // If a full DATABASE_URL exists, TypeORM uses it automatically over individual fields
  url: process.env.DATABASE_URL,

  // -----------------------------
  // Local Fallback Configs
  // -----------------------------
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // -----------------------------
  // CRITICAL AUTO-GENERATE SCHEMA FIX
  // -----------------------------
  // Force synchronization to true right now so it automatically builds 
  // missing tables (like "users") on your live Railway instance.
  synchronize: true, 

  logging: isProduction ? false : true, // Useful to see generation logs locally

  entities: [UserEntity, DoctorEntity, AppointmentEntity],
  subscribers: [],
  migrations: [],

  // -----------------------------
  // SSL FIX (Required by Railway PostgreSQL)
  // -----------------------------
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});