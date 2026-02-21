/**
 * Admin Login Component
 * 
 * Features:
 * - Admin-specific login form
 * - Email and password validation
 * - Error handling
 * - Redirect to admin dashboard after successful login
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please provide a valid email address');
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call admin login API
      const response = await api.post('/admin/login', {
        email: formData.email,
        password: formData.password,
      });

      // Store admin token and role
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminEmail', response.data.email);
      localStorage.setItem('userRole', 'admin');

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Admin login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="admin-badge">👨‍💼 ADMIN PORTAL</div>
        <h2>Admin Login</h2>
        <p className="auth-subtitle">Access the admin dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your admin email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Admin Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Not an admin? <Link to="/login">User Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
