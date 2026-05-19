// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    // ----------------------------
    // CHECK JWT SECRET SAFETY
    // ----------------------------
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // ----------------------------
    // EXTRACT AUTH HEADER SAFELY
    // ----------------------------
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access Denied: No token provided"
      });
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    const token = parts[1];

    // ----------------------------
    // VERIFY TOKEN
    // ----------------------------
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload
    req.user = verified;

    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err.message);

    // ----------------------------
    // DISTINCT ERROR RESPONSES
    // ----------------------------
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Session expired. Please login again."
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "Invalid authentication token"
      });
    }

    return res.status(500).json({
      message: "Authentication system error"
    });
  }
};