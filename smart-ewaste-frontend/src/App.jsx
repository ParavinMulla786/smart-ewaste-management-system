/**
 * Main App Component
 * 
 * Sets up routing and authentication context
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import SetPassword from './components/auth/SetPassword';
import PasswordReset from './components/auth/PasswordReset';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import SchedulePickup from './components/dashboard/SchedulePickup';
import MyRequests from './components/dashboard/MyRequests';
import RequestDetailView from './components/dashboard/RequestDetailView';
import History from './components/dashboard/History';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRequestDetail from './components/admin/AdminRequestDetail';
import AdminHistory from './components/admin/AdminHistory';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import PickupPersonProtectedRoute from './components/auth/PickupPersonProtectedRoute';
import PickupPersonDashboard from './components/dashboard/PickupPersonDashboard';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Default route - landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            
            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            
            <Route
              path="/admin/request-details/:id"
              element={
                <AdminProtectedRoute>
                  <AdminRequestDetail />
                </AdminProtectedRoute>
              }
            />
            
            <Route
              path="/admin/history"
              element={
                <AdminProtectedRoute>
                  <AdminHistory />
                </AdminProtectedRoute>
              }
            />
            
            {/* Pickup Person routes */}
            <Route
              path="/pickup-person/dashboard"
              element={
                <PickupPersonProtectedRoute>
                  <PickupPersonDashboard />
                </PickupPersonProtectedRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/schedule-pickup"
              element={
                <ProtectedRoute>
                  <SchedulePickup />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/request-details/:id"
              element={
                <ProtectedRoute>
                  <RequestDetailView />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
