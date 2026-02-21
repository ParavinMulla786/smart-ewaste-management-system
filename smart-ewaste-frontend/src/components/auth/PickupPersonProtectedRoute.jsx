/**
 * PickupPersonProtectedRoute Component
 * 
 * Protects routes that should only be accessible to authenticated pickup persons.
 * Redirects to login if not authenticated or not a pickup person.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PickupPersonProtectedRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  console.log('PickupPersonProtectedRoute - isAuthenticated:', isAuthenticated, 'role:', role, 'loading:', loading);

  // Show loading state while checking authentication
  if (loading) {
    console.log('Still loading...');
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard if not a pickup person
  if (role !== 'PICKUP_PERSON') {
    console.log('Not a pickup person, role is:', role);
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Rendering pickup person dashboard');
  // Render the protected component if authenticated as pickup person
  return children;
};

export default PickupPersonProtectedRoute;
