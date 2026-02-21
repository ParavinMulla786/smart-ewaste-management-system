/**
 * API Service Configuration
 * 
 * Centralized axios configuration for all API calls.
 * Handles:
 * - Base URL configuration
 * - JWT token injection
 * - Request/response interceptors
 * - Error handling
 * 
 * Usage:
 * import api from './services/api';
 * const response = await api.get('/user/profile');
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Automatically adds JWT token to Authorization header
 * Token is retrieved from localStorage
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles common response scenarios:
 * - 401 Unauthorized: Clear auth and redirect to login
 * - Other errors: Pass through for component handling
 */
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Pass error to component for specific handling
    return Promise.reject(error);
  }
);

export default api;
