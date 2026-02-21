/**
 * User Dashboard Component
 * 
 * Main dashboard for logged-in users showing:
 * - Statistics (total pickups, pending, completed, etc.)
 * - Recent pickup requests activity
 * - Quick actions (schedule pickup, view requests)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../services/api';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPickups: 0,
    approvedPickups: 0,
    inProgress: 0,
    completedPickups: 0,
    rejectedPickups: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/pickup-requests');
      const requests = response.data;
      
      // Calculate statistics based on request statuses
      const calculatedStats = {
        totalPickups: requests.length,
        approvedPickups: requests.filter(req => req.status === 'IN_PROGRESS' || req.status === 'ON_HOLD' || req.status === 'PENDING' || req.status === 'ASSIGNED').length,
        inProgress: requests.filter(req => req.status === 'IN_PROGRESS' || req.status === 'ASSIGNED').length,
        completedPickups: requests.filter(req => req.status === 'RESOLVED' || req.status === 'COMPLETED').length,
        rejectedPickups: requests.filter(req => req.status === 'REJECTED').length
      };
      
      setStats(calculatedStats);
      
      // Set recent activity (show latest 5 requests)
      const recentRequests = requests
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(request => ({
          id: request.id,
          type: `${request.deviceType} - ${request.brand}`,
          date: new Date(request.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          // Map backend statuses to user-friendly display
          status: mapBackendStatusToDisplay(request.status),
          backendStatus: request.status, // Keep original for mapping
          icon: getDeviceIcon(request.deviceType)
        }));
      
      setRecentActivity(recentRequests);
    } catch (error) {
      console.error('Failed to fetch user requests:', error);
      // Keep stats at zero on error
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    const iconMap = {
      'Laptop': '💻',
      'Desktop': '🖥️',
      'Mobile Phone': '📱',
      'Tablet': '📱',
      'Monitor': '🖥️',
      'Keyboard': '⌨️',
      'Mouse': '🖱️',
      'Printer': '🖨️',
      'Other': '📦'
    };
    return iconMap[deviceType] || '📦';
  };

  // Map backend status to display status
  const mapBackendStatusToDisplay = (backendStatus) => {
    switch(backendStatus) {
      case 'PENDING':
      case 'ON_HOLD':
        return 'pending';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'ASSIGNED':
        return 'assigned';
      case 'POSTPONED':
        return 'postponed';
      case 'COMPLETED':
      case 'RESOLVED':
        return 'completed';
      case 'REJECTED':
        return 'rejected';
      case 'IN_REVIEW':
        return 'in-review';
      default:
        return backendStatus.toLowerCase().replace('_', '-');
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-progress';
      case 'assigned': return 'status-assigned';
      case 'postponed': return 'status-postponed';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      case 'in-review': return 'status-review';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'assigned': return 'Assigned';
      case 'postponed': return 'Postponed';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      case 'in-review': return 'In Review';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome to Smart E-Waste Portal</p>
        </div>

        {/* Statistics Cards - Updated labels */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon-wrapper stat-icon-red">
              <span className="stat-icon">�</span>
            </div>
            <div className="stat-info">
              <h3 className="stat-number stat-number-bold">{stats.totalPickups}</h3>
              <p className="stat-label">Total Requests</p>
            </div>
          </div>

          <div className="stat-card stat-approved">
            <div className="stat-icon-wrapper stat-icon-yellow">
              <span className="stat-icon">⏳</span>
            </div>
            <div className="stat-info">
              <h3 className="stat-number stat-number-bold">{stats.approvedPickups}</h3>
              <p className="stat-label">Pending</p>
            </div>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-icon-wrapper stat-icon-blue">
              <span className="stat-icon">🚚</span>
            </div>
            <div className="stat-info">
              <h3 className="stat-number stat-number-bold">{stats.inProgress}</h3>
              <p className="stat-label">In Progress</p>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-icon-wrapper stat-icon-green">
              <span className="stat-icon">✅</span>
            </div>
            <div className="stat-info">
              <h3 className="stat-number stat-number-bold">{stats.completedPickups}</h3>
              <p className="stat-label">Completed</p>
            </div>
          </div>

          <div className="stat-card stat-rejected">
            <div className="stat-icon-wrapper stat-icon-red-dark">
              <span className="stat-icon">❌</span>
            </div>
            <div className="stat-info">
              <h3 className="stat-number stat-number-bold">{stats.rejectedPickups}</h3>
              <p className="stat-label">Rejected</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* E-Waste Impact Section */}
          <div className="chart-card">
            <h2 className="section-title">Your E-Waste Impact 🌍</h2>
            <div className="impact-container">
              <div className="impact-stats">
                <div className="impact-item">
                  <div className="impact-icon">♻️</div>
                  <div className="impact-info">
                    <h3>{stats.completedPickups}</h3>
                    <p>Devices Recycled</p>
                  </div>
                </div>
                <div className="impact-item">
                  <div className="impact-icon">🌱</div>
                  <div className="impact-info">
                    <h3>{stats.completedPickups * 2.5}kg</h3>
                    <p>E-Waste Diverted</p>
                  </div>
                </div>
                <div className="impact-item">
                  <div className="impact-icon">💧</div>
                  <div className="impact-info">
                    <h3>{stats.completedPickups * 500}L</h3>
                    <p>Water Saved</p>
                  </div>
                </div>
              </div>
              <div className="impact-message">
                <p>✨ Thank you for contributing to a cleaner environment!</p>
                <p className="impact-subtitle">Every device recycled makes a difference</p>
              </div>
            </div>
          </div>

          {/* Completion Progress Chart */}
          <div className="chart-card">
            <h2 className="section-title">Overall Progress</h2>
            <div className="chart-container">
              <div className="progress-chart">
                <div className="progress-circle">
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#e9ecef"
                      strokeWidth="20"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#28a745"
                      strokeWidth="20"
                      strokeDasharray={`${stats.totalPickups ? (stats.completedPickups / stats.totalPickups * 439.6) : 0} 439.6`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                    />
                    <text x="90" y="85" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#333">
                      {stats.totalPickups ? Math.round((stats.completedPickups / stats.totalPickups) * 100) : 0}%
                    </text>
                    <text x="90" y="105" textAnchor="middle" fontSize="14" fill="#666">
                      Completed
                    </text>
                  </svg>
                </div>
                <div className="progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{background: '#28a745'}}></span>
                    <span className="legend-text">Completed: {stats.completedPickups}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{background: '#ffc107'}}></span>
                    <span className="legend-text">Pending: {stats.approvedPickups + stats.inProgress}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{background: '#dc3545'}}></span>
                    <span className="legend-text">Rejected: {stats.rejectedPickups}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Activity Section */}
          <div className="dashboard-section recent-activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              {loading ? (
                <div className="empty-state">
                  <p>Loading...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon-wrapper">
                      <span className="activity-device-icon">{activity.icon}</span>
                    </div>
                    <div className="activity-details">
                      <p className="activity-type">{activity.type}</p>
                      <p className="activity-date">{activity.date}</p>
                    </div>
                    <span className={`activity-status ${getStatusClass(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="dashboard-section quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-list">
              <Link to="/schedule-pickup" className="action-button action-primary">
                <span className="action-icon">➕</span>
                <span className="action-text">Schedule New Pickup</span>
              </Link>
              
              <Link to="/my-requests" className="action-button action-secondary">
                <span className="action-icon">📋</span>
                <span className="action-text">View All Requests</span>
              </Link>

              <Link to="/recycling-info" className="action-button action-secondary">
                <span className="action-icon">ℹ️</span>
                <span className="action-text">Recycling Guidelines</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;