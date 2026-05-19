import { useState, useEffect } from 'react';
import { useAppointments } from '../context/useContextHooks';
import { STATUS } from '../context/AuthTypes';
import { X, Calendar, Clock, Clipboard, ChevronRight } from 'lucide-react';

// 🟢 Base API URL (Railway / Production / Local via env)
const API = import.meta.env.VITE_API_URL;

const AppointmentForm = ({ onClose, existing }) => {
  const { bookAppointment, updateAppointmentStatus } = useAppointments();

  const [activeDoctors, setActiveDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    doctorId: existing ? existing.doctorId : '',
    date: existing ? existing.date : '',
    time: existing ? existing.time : '',
    reason: existing ? existing.reason : '',
  });

  // 🔹 FETCH DOCTORS
  useEffect(() => {
    const fetchSystemDoctors = async () => {
      const token = localStorage.getItem('clinic_jwt_token');

      try {
        setLoadingDoctors(true);

        const response = await fetch(`${API}/api/auth/doctors`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setActiveDoctors(data);

          if (!existing && data.length > 0) {
            setFormData(prev => ({
              ...prev,
              doctorId: data[0].id
            }));
          }
        }

      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchSystemDoctors();
  }, [existing]);

  // 🔹 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.date || !formData.time || !formData.doctorId || !formData.reason.trim()) {
      setError('Please fill out all fields.');
      return;
    }

    const payload = {
      doctorId: parseInt(formData.doctorId, 10),
      reason: formData.reason,
      appointmentDate: formData.date,
      appointmentTime: formData.time
    };

    try {
      if (existing) {
        const result = await updateAppointmentStatus(existing.id, {
          status: STATUS.COMPLETED
        });

        if (result.success) onClose();
        else setError(result.error || 'Update failed');
      } else {
        const result = await bookAppointment(payload);

        if (result.success) onClose();
        else setError(result.error || 'Booking failed');
      }

    } catch (err) {
      setError('Unexpected error occurred');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '460px', width: '100%' }}>

        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {existing ? 'Update Status' : 'Request Consultation'}
            </h2>
            <p className="modal-subtitle">
              Fill system parameters to proceed
            </p>
          </div>

          <button type="button" onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', padding: '12px 24px 0', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >

          {!existing && (
            <div className="form-group">
              <label className="form-label">Select Practitioner</label>

              <select
                className="form-control"
                value={formData.doctorId}
                onChange={e =>
                  setFormData(p => ({ ...p, doctorId: e.target.value }))
                }
                required
                disabled={loadingDoctors}
              >
                {loadingDoctors ? (
                  <option>Loading...</option>
                ) : activeDoctors.length > 0 ? (
                  activeDoctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <option>No doctors found</option>
                )}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={12} /> Date
              </label>

              {/* 🔥 FIXED BUG: removed formData.formDataDate */}
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={e =>
                  setFormData(p => ({ ...p, date: e.target.value }))
                }
                required
                disabled={!!existing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={12} /> Time
              </label>

              <input
                type="time"
                className="form-control"
                value={formData.time}
                onChange={e =>
                  setFormData(p => ({ ...p, time: e.target.value }))
                }
                required
                disabled={!!existing}
              />
            </div>

          </div>

          <div className="form-group">
            <label className="form-label">
              <Clipboard size={12} /> Reason
            </label>

            <input
              type="text"
              className="form-control"
              value={formData.reason}
              onChange={e =>
                setFormData(p => ({ ...p, reason: e.target.value }))
              }
              required
              disabled={!!existing}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>

            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!existing && activeDoctors.length === 0}
            >
              <span>
                {existing ? 'Mark Completed' : 'Commit Booking'}
              </span>
              <ChevronRight size={16} />
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;