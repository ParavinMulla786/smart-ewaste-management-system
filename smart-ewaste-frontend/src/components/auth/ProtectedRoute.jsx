/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 * 
 * Usage:
 * <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth to load from localStorage
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected component
  return children;
};

export default ProtectedRoute;
