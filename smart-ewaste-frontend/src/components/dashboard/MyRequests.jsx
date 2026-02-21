/**
 * My Requests Component
 * Shows user's pickup requests with status tracking
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../services/api';
import '../../styles/MyRequests.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/pickup-requests');
      // Sort requests to show newest first
      const sortedRequests = response.data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
      setRequests(sortedRequests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="my-requests-page">
      <Navbar />
      
      <div className="my-requests-container">
        <div className="my-requests-header">
          <h1>My Pickup Requests</h1>
          <Link to="/schedule-pickup" className="btn btn-primary">
            + Schedule New Pickup
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading your requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No Pickup Requests Yet</h2>
            <p>You haven't submitted any e-waste pickup requests.</p>
            <Link to="/schedule-pickup" className="btn btn-primary">
              Schedule Your First Pickup
            </Link>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-id">
                    Request #{request.id.substring(0, 8)}
                  </div>
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="request-body">
                  <div className="request-detail">
                    <label>Device:</label>
                    <span>{request.deviceType}</span>
                  </div>
                  <div className="request-detail">
                    <label>Brand & Model:</label>
                    <span>{request.brand} {request.model}</span>
                  </div>
                  <div className="request-detail">
                    <label>Condition:</label>
                    <span>{request.condition}</span>
                  </div>
                  <div className="request-detail">
                    <label>Quantity:</label>
                    <span>{request.quantity}</span>
                  </div>
                  <div className="request-detail">
                    <label>Pickup Address:</label>
                    <span>{request.pickupAddress}</span>
                  </div>
                  {request.remarks && (
                    <div className="request-detail">
                      <label>Remarks:</label>
                      <span>{request.remarks}</span>
                    </div>
                  )}
                  {request.adminNotes && (
                    <div className="request-detail admin-notes">
                      <label>Admin Notes:</label>
                      <span>{request.adminNotes}</span>
                    </div>
                  )}
                </div>

                <div className="request-footer">
                  <div className="request-footer-dates">
                    <div className="request-date">
                      Submitted on {formatDate(request.createdAt)}
                    </div>
                    {request.updatedAt !== request.createdAt && (
                      <div className="request-updated">
                        Last updated: {formatDate(request.updatedAt)}
                      </div>
                    )}
                  </div>
                  <Link to={`/request-details/${request.id}`} className="btn btn-details">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;