/**
 * Admin Protected Route Component
 * 
 * Protects admin routes and checks admin authentication
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
