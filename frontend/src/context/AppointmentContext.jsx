// frontend/src/context/AppointmentContext.jsx
import { useState, useCallback } from 'react';
import { AppointmentContext } from './ContextInstances';

// 🟢 Base API URL (Railway / Production / Local via env)
const API = import.meta.env.VITE_API_URL;

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [user, setUser] = useState(null);

  // 🔹 GET APPOINTMENTS
  const fetchAppointments = useCallback(async () => {
    const token = localStorage.getItem('clinic_jwt_token');
    if (!token) return;

    setFetching(true);

    try {
      if (!user) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUser(payload);
      }

      const response = await fetch(`${API}/api/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve appointment history');
      }

      const data = await response.json();
      setAppointments(data);

    } catch (err) {
      console.error(err.message);
    } finally {
      setFetching(false);
    }
  }, [user]);

  // 🔹 CREATE APPOINTMENT
  const bookAppointment = async (appointmentData) => {
    const token = localStorage.getItem('clinic_jwt_token');

    try {
      const response = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking failure');
      }

      setAppointments(prev => [data.appointment, ...prev]);

      return { success: true };

    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 🔹 UPDATE STATUS
  const updateAppointmentStatus = async (id, statusData) => {
    const token = localStorage.getItem('clinic_jwt_token');
    const payload = typeof statusData === 'string'
      ? { status: statusData }
      : statusData;

    try {
      const response = await fetch(`${API}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setAppointments(prev =>
        prev.map(appt =>
          appt.id === id ? data.appointment : appt
        )
      );

      return { success: true };

    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 🔹 DELETE APPOINTMENT
  const deleteAppointment = async (id) => {
    const token = localStorage.getItem('clinic_jwt_token');

    try {
      const response = await fetch(`${API}/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete record');
      }

      setAppointments(prev =>
        prev.filter(appt => appt.id !== id)
      );

      return { success: true };

    } catch (err) {
      console.error("Delete Error:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        fetching,
        user,
        fetchAppointments,
        bookAppointment,
        updateAppointmentStatus,
        deleteAppointment
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};