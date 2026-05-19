// backend/src/controllers/appointmentController.js
import { AppDataSource } from '../config/data-source.js';

// ----------------------------
// CREATE APPOINTMENT
// ----------------------------
export const createAppointment = async (req, res) => {
  const { doctorId, reason, appointmentDate, appointmentTime } = req.body;
  const patientId = req.user.id;

  try {
    // ----------------------------
    // INPUT VALIDATION
    // ----------------------------
    if (!doctorId || !reason || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (reason.trim().length < 3) {
      return res.status(400).json({
        message: "Reason must be at least 3 characters"
      });
    }

    // ----------------------------
    // CHECK IF DOCTOR EXISTS
    // ----------------------------
    const doctorCheck = await AppDataSource.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [doctorId, 'DOCTOR']
    );

    if (doctorCheck.length === 0) {
      return res.status(400).json({
        message: "Invalid doctor selection"
      });
    }

    // ----------------------------
    // INSERT APPOINTMENT
    // ----------------------------
    const result = await AppDataSource.query(
      `INSERT INTO appointments 
        (patient_id, doctor_id, reason, appointment_date, appointment_time) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING 
         id, 
         patient_id as "patientId", 
         doctor_id as "doctorId", 
         reason, 
         status, 
         appointment_date as "date", 
         appointment_time as "time"`,
      [patientId, doctorId, reason.trim(), appointmentDate, appointmentTime]
    );

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: result[0]
    });

  } catch (err) {
    console.error("Create Appointment Error:", err);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// ----------------------------
// GET APPOINTMENTS
// ----------------------------
export const getAppointments = async (req, res) => {
  const { id, role } = req.user;

  try {
    const baseSelect = `
      SELECT 
        a.id,
        a.reason,
        a.status,
        a.appointment_date as "date",
        a.appointment_time as "time",
        a.patient_id as "patientId",
        a.doctor_id as "doctorId",
        p.name as "patientName",
        d.name as "doctorName"
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
    `;

    let query = "";
    let params = [];

    if (role === "PATIENT") {
      query = `${baseSelect} WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [id];
    }

    else if (role === "DOCTOR") {
      query = `${baseSelect} WHERE a.doctor_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [id];
    }

    else if (role === "ADMIN") {
      query = `${baseSelect} ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    }

    else {
      return res.status(403).json({
        message: "Invalid role access"
      });
    }

    const appointments = await AppDataSource.query(query, params);

    return res.status(200).json(appointments);

  } catch (err) {
    console.error("Get Appointments Error:", err);

    return res.status(500).json({
      message: "Failed to fetch appointments"
    });
  }
};

// ----------------------------
// UPDATE STATUS
// ----------------------------
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.user.role;

  try {
    // ----------------------------
    // ROLE PROTECTION
    // ----------------------------
    if (userRole !== "DOCTOR" && userRole !== "ADMIN") {
      return res.status(403).json({
        message: "You are not allowed to update appointment status"
      });
    }

    // ----------------------------
    // STATUS VALIDATION
    // ----------------------------
    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!allowedStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const updated = await AppDataSource.query(
      `UPDATE appointments 
       SET status = $1 
       WHERE id = $2 
       RETURNING 
         id, 
         status, 
         reason, 
         appointment_date as "date", 
         appointment_time as "time"`,
      [status.toUpperCase(), id]
    );

    if (updated.length === 0) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    return res.status(200).json({
      message: "Status updated successfully",
      appointment: updated[0]
    });

  } catch (err) {
    console.error("Update Status Error:", err);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};