/**
 * Admin History Component
 * Shows all pickup requests from all users with filters
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminHistory.css';

const AdminHistory = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, etc.

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, timeFilter, sortOrder, statusFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pickup-requests');
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply time filter
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        filtered = filtered.filter(req => {
          const reqDate = new Date(req.createdAt);
          return reqDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(req => new Date(req.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(req => new Date(req.createdAt) >= monthAgo);
        break;
      case '90days':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(req => new Date(req.createdAt) >= ninetyDaysAgo);
        break;
      case 'all':
      default:
        break;
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredRequests(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'status-pending',
      'ON_HOLD': 'status-on-hold',
      'IN_PROGRESS': 'status-progress',
      'ASSIGNED': 'status-assigned',
      'POSTPONED': 'status-postponed',
      'COMPLETED': 'status-completed',
      'RESOLVED': 'status-completed',
      'REJECTED': 'status-rejected',
      'IN_REVIEW': 'status-review'
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const textMap = {
      'PENDING': 'Pending',
      'ON_HOLD': 'On Hold',
      'IN_PROGRESS': 'In Progress',
      'ASSIGNED': 'Assigned',
      'POSTPONED': 'Postponed',
      'COMPLETED': 'Completed',
      'RESOLVED': 'Completed',
      'REJECTED': 'Rejected',
      'IN_REVIEW': 'In Review'
    };
    return textMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-history-page">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <Link to="/admin/dashboard" className="admin-logo">
            <span className="admin-icon">⚙️</span>
            <span className="admin-title">Admin Portal - History</span>
          </Link>
          <div className="admin-actions">
            <Link to="/admin/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-history-container">
        <div className="history-header">
          <h1>All Requests History</h1>
          <p>View and manage all e-waste pickup requests from all users</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters */}
        <div className="history-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="POSTPONED">Postponed</option>
              <option value="COMPLETED">Completed</option>
              <option value="RESOLVED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Time Period:</label>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="filter-stats">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading history...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No requests found</h3>
            <p>No pickup requests match the selected filters.</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Device Type</th>
                  <th>Brand/Model</th>
                  <th>Status</th>
                  <th>Pickup Date</th>
                  <th>Submitted On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr key={request.id}>
                    <td>
                      <div className="user-info-cell">
                        <div>{request.userName}</div>
                        <small>{request.userEmail}</small>
                      </div>
                    </td>
                    <td>{request.deviceType}</td>
                    <td>{request.brand} {request.model}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td>{formatDate(request.pickupDate)}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <Link 
                        to={`/admin/request-details/${request.id}`}
                        className="btn btn-view-small"
                        title="View Details"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistory;
