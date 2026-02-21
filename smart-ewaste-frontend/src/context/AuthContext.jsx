/**
 * Authentication Context
 * 
 * Provides global authentication state and methods throughout the app.
 * 
 * Features:
 * - Stores user and token in state
 * - Persists auth data to localStorage
 * - Provides login/logout methods
 * - Auto-loads auth on app start
 * 
 * Usage:
 * const { user, token, login, logout, isAuthenticated } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Wraps the app to provide authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isTemporaryPassword, setIsTemporaryPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Load authentication data from localStorage on mount
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedIsTemporaryPassword = localStorage.getItem('isTemporaryPassword');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setIsTemporaryPassword(storedIsTemporaryPassword === 'true');
    }

    setLoading(false);
  }, []);

  /**
   * Login function
   * 
   * Stores token, user data, role, and temporary password flag in state and localStorage
   * 
   * @param {string} token - JWT token
   * @param {object} userData - User information
   * @param {string} userRole - User role (USER, ADMIN, or PICKUP_PERSON)
   * @param {boolean} tempPassword - Whether using temporary password (default false)
   */
  const login = (token, userData, userRole = 'USER', tempPassword = false) => {
    setToken(token);
    setUser(userData);
    setRole(userRole);
    setIsTemporaryPassword(tempPassword);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    localStorage.setItem('isTemporaryPassword', tempPassword.toString());
  };

  /**
   * Logout function
   * 
   * Clears token, user data, role, and temporary password flag from state and localStorage
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setIsTemporaryPassword(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('isTemporaryPassword');
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return token !== null && user !== null;
  };

  // Context value
  const value = {
    user,
    token,
    role,
    isTemporaryPassword,
    loading,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 * 
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
