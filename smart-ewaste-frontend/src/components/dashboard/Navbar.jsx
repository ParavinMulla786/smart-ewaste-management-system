/**
 * Navbar Component
 * 
 * Navigation bar for authenticated users with:
 * - Logo and brand name
 * - Navigation links
 * - Profile access
 * - Logout functionality
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">♻️</span>
          <span className="brand-name">Smart E-Waste Portal</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-menu">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          
          <Link to="/schedule-pickup" className={isActive('/schedule-pickup')}>
            <span className="nav-icon">📦</span>
            Schedule Pickup
          </Link>
          
          <Link to="/my-requests" className={isActive('/my-requests')}>
            <span className="nav-icon">📋</span>
            My Requests
          </Link>
          
          <Link to="/history" className={isActive('/history')}>
            <span className="nav-icon">📜</span>
            History
          </Link>
          
          <Link to="/profile" className={isActive('/profile')}>
            <span className="nav-icon">👤</span>
            Profile
          </Link>
        </div>

        {/* User Actions */}
        <div className="navbar-actions">
          <div className="user-info">
            <span className="user-greeting">Hello, {user?.name || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
