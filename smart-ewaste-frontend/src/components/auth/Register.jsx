/**
 * Registration Component
 * 
 * Features:
 * - User registration form (email verification required)
 * - Client-side validation
 * - Error handling
 * - Email verification link sent after registration
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Auth.css';

const Register = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess(''); // Clear success message on input change
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please provide a valid email address');
      return false;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
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
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call registration API
      const response = await api.post('/auth/register', formData);

      // Success - show message
      setSuccess('Registration successful!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      
    } catch (err) {
      // Handle errors
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
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
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              rows="3"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending Verification Email...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
