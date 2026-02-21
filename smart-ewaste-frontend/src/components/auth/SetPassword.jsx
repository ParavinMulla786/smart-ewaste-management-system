/**
 * Set Password Component
 * 
 * Features:
 * - Verify email via token from URL
 * - Set password for new account
 * - Password confirmation validation
 * - Redirect to login after success
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Auth.css';

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      setError('Invalid verification link. Please check your email and try again.');
      setTokenValid(false);
    }
  }, [token]);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call set password API
      const response = await api.post('/auth/set-password', {
        token: token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Success - show message and redirect to login
      alert(response.data.message || 'Password set successfully! You can now login.');
      navigate('/login');
      
    } catch (err) {
      // Handle errors
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to set password. Please try again or request a new verification link.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Invalid Link</h2>
          <div className="error-message">{error}</div>
          <p className="auth-footer">
            Need to register? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Set Your Password</h2>
        <p className="auth-subtitle">Complete your registration by setting a secure password</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password (min 6 characters)"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Setting Password...' : 'Set Password & Activate Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have your password set? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default SetPassword;
