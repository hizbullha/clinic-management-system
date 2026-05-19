// backend/src/routes/appointmentRoutes.js
import express from 'express';
import {
  createAppointment,
  getAppointments,
  updateStatus
} from '../controllers/appointmentController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ----------------------------
// GLOBAL AUTH PROTECTION
// ----------------------------
router.use(verifyToken);

// ----------------------------
// CREATE APPOINTMENT
// ----------------------------
router.post('/', (req, res, next) => {
  // optional lightweight validation hook
  if (!req.body) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  next();
}, createAppointment);

// ----------------------------
// GET ALL APPOINTMENTS
// ----------------------------
router.get('/', getAppointments);

// ----------------------------
// UPDATE APPOINTMENT STATUS
// ----------------------------
router.patch('/:id/status', (req, res, next) => {
  const { id } = req.params;

  // basic validation before hitting controller
  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "Invalid appointment ID"
    });
  }

  next();
}, updateStatus);

export default router;