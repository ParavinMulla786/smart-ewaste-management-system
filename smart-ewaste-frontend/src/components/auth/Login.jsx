/**
 * Login Component
 * 
 * Features:
 * - User login form
 * - JWT authentication
 * - Store token in AuthContext
 * - Redirect to profile after success
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please provide a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
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
      // Call login API
      const response = await api.post('/auth/login', formData);

      console.log('Login response:', response.data);

      // Extract token, user data, role, and temporary password flag from response
      const { token, user, role, isTemporaryPassword } = response.data;

      console.log('Extracted - Token:', token, 'User:', user, 'Role:', role, 'IsTemporaryPassword:', isTemporaryPassword);

      // Store in AuthContext (also saves to localStorage)
      login(token, user, role, isTemporaryPassword || false);

      console.log('About to navigate, role:', role);

      // Check if pickup person needs to reset password
      if (role === 'PICKUP_PERSON' && isTemporaryPassword) {
        console.log('Redirecting to password reset');
        navigate('/reset-password');
        return;
      }

      // Redirect based on role
      if (role === 'ADMIN') {
        console.log('Navigating to admin dashboard');
        navigate('/admin/dashboard');
      } else if (role === 'PICKUP_PERSON') {
        console.log('Navigating to pickup person dashboard');
        navigate('/pickup-person/dashboard');
      } else {
        console.log('Navigating to user dashboard');
        navigate('/dashboard');
      }
      
    } catch (err) {
      // Handle errors
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back!</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
