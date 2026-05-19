// backend/src/routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';
import { AppDataSource } from '../config/data-source.js';

const router = express.Router();

// ----------------------------
// AUTH ROUTES (PUBLIC)
// ----------------------------
router.post('/register', register);
router.post('/login', login);

// ----------------------------
// GET DOCTORS LIST (PUBLIC OR PROTECTED DEPENDING ON YOUR SYSTEM)
// ----------------------------
router.get('/doctors', async (req, res) => {
  try {
    const doctorsList = await AppDataSource.query(
      'SELECT id, name FROM users WHERE role = $1 ORDER BY name ASC',
      ['DOCTOR']
    );

    res.status(200).json(doctorsList);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({
      message: "Failed to fetch doctors list"
    });
  }
});

// ----------------------------
// DELETE DOCTOR (⚠ SHOULD BE ADMIN ONLY IN REAL DEPLOYMENT)
// ----------------------------
router.delete('/doctors/:id', async (req, res) => {
  const { id } = req.params;

  // basic validation
  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "Invalid doctor ID"
    });
  }

  try {
    const result = await AppDataSource.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: `Successfully removed ${result[0].name}`
    });

  } catch (err) {
    console.error("Delete doctor error:", err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;