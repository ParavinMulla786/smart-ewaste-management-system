import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/Auth.css';

/**
 * Password Reset Component for Pickup Persons
 * Forces password change on first login with temporary password
 */
const PasswordReset = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      setError('Current password is required');
      return false;
    }

    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    if (formData.newPassword === formData.oldPassword) {
      setError('New password must be different from current password');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      // Call reset password API
      const response = await api.post('/pickup-persons/reset-password', {
        email: user.email,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      // Success - redirect to dashboard
      alert('Password reset successfully! Please login again with your new password.');
      
      // Clear auth and redirect to login
      localStorage.clear();
      navigate('/login');
      
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        <p className="auth-subtitle">
          For security reasons, you must change your temporary password before accessing the system.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter your temporary password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-note">
          <strong>Password Requirements:</strong>
          <ul>
            <li>At least 6 characters</li>
            <li>Must be different from your temporary password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
