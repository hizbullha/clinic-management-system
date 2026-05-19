// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source.js';

/**
 * REGISTER USER
 */
export const register = async (req, res) => {
  const { username, password, name, role } = req.body;

  try {
    // ----------------------------
    // BASIC VALIDATION
    // ----------------------------
    if (!username || !password || !name) {
      return res.status(400).json({
        message: "Username, password, and name are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // normalize username
    const cleanUsername = username.trim().toLowerCase();

    // ----------------------------
    // ROLE SAFETY (IMPORTANT)
    // ----------------------------
    // Prevent users from self-assigning privileged roles
    const allowedRoles = ["PATIENT", "DOCTOR"];
    const finalRole = allowedRoles.includes(role?.toUpperCase())
      ? role.toUpperCase()
      : "PATIENT";

    // ----------------------------
    // CHECK EXISTING USER
    // ----------------------------
    const userCheck = await AppDataSource.query(
      'SELECT id FROM users WHERE username = $1',
      [cleanUsername]
    );

    if (userCheck.length > 0) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    // ----------------------------
    // HASH PASSWORD
    // ----------------------------
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ----------------------------
    // INSERT USER
    // ----------------------------
    const insertResult = await AppDataSource.query(
      `INSERT INTO users (username, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, name, role`,
      [cleanUsername, passwordHash, name, finalRole]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: insertResult[0]
    });

  } catch (err) {
    console.error("Register Error:", err);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

/**
 * LOGIN USER
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // ----------------------------
    // FIND USER
    // ----------------------------
    const userResult = await AppDataSource.query(
      'SELECT * FROM users WHERE username = $1',
      [cleanUsername]
    );

    if (userResult.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const user = userResult[0];

    // ----------------------------
    // VERIFY PASSWORD
    // ----------------------------
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // ----------------------------
    // JWT SAFETY CHECK
    // ----------------------------
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};