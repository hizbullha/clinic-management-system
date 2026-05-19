// frontend/src/context/AuthContext.jsx
import { useState, useEffect } from 'react';
import { AuthContext } from './ContextInstances';

// 🟢 Base API URL (Railway / Production / Local via env)
const API = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('clinic_jwt_token');
      const savedUser = localStorage.getItem('clinic_user_profile');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error("Failed to parse user profile context:", err);
          localStorage.removeItem('clinic_jwt_token');
          localStorage.removeItem('clinic_user_profile');
        }
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  // 🔐 LOGIN
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('clinic_jwt_token', data.token);
      localStorage.setItem('clinic_user_profile', JSON.stringify(data.user));

      setUser(data.user);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 📝 REGISTER
  const register = async (username, password, name) => {
    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // auto-login after register
      return await login(username, password);
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('clinic_jwt_token');
    localStorage.removeItem('clinic_user_profile');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};