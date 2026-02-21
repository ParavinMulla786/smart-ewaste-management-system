/**
 * Request Detail View Component
 * Shows detailed view of a pickup request with images
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../services/api';
import '../../styles/RequestDetailView.css';

const RequestDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromHistory = location.state?.from === 'history';
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/pickup-requests/${id}`);
      setRequest(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details');
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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="request-detail-page">
        <Navbar />
        <div className="request-detail-container">
          <div className="loading">Loading request details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-detail-page">
        <Navbar />
        <div className="request-detail-container">
          <div className="alert alert-error">{error}</div>
          <button onClick={() => navigate(fromHistory ? '/history' : '/my-requests')} className="btn btn-secondary">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="request-detail-page">
      <Navbar />
      
      <div className="request-detail-container">
        <div className="detail-header">
          <button onClick={() => navigate(fromHistory ? '/history' : '/my-requests')} className="btn btn-back">
            ← Back
          </button>
          <h1>Request Details</h1>
          <div className={`status-badge ${getStatusClass(request.status)}`}>
            {getStatusText(request.status)}
          </div>
        </div>

        <div className="detail-content">
          {/* Request Information */}
          <div className="detail-section">
            <h2>📋 Request Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Submitted On:</label>
                <span>{formatDate(request.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{formatDate(request.updatedAt)}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={getStatusClass(request.status)}>
                  {getStatusText(request.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="detail-section">
            <h2>📱 Device Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Device Type:</label>
                <span>{request.deviceType}</span>
              </div>
              <div className="info-item">
                <label>Brand:</label>
                <span>{request.brand}</span>
              </div>
              <div className="info-item">
                <label>Model:</label>
                <span>{request.model}</span>
              </div>
              <div className="info-item">
                <label>Condition:</label>
                <span className={`condition-badge condition-${request.condition?.toLowerCase()}`}>
                  {request.condition}
                </span>
              </div>
              <div className="info-item">
                <label>Quantity:</label>
                <span>{request.quantity} unit(s)</span>
              </div>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="detail-section">
            <h2>📍 Pickup Details</h2>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Pickup Address:</label>
                <span className="address">{request.pickupAddress}</span>
              </div>
              <div className="info-item">
                <label>Preferred Pickup Date:</label>
                <span className="pickup-date">{formatDate(request.pickupDate)}</span>
              </div>
              {request.remarks && (
                <div className="info-item full-width">
                  <label>Additional Remarks:</label>
                  <span className="remarks">{request.remarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {request.adminNotes && (
            <div className="detail-section">
              <h2>📝 Admin Notes</h2>
              <div className="admin-notes">
                <p>{request.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {request.images && request.images.length > 0 && (
            <div className="detail-section">
              <h2>🖼️ Device Images</h2>
              <div className="image-gallery">
                {request.images.map((imageUrl, index) => (
                  <div key={index} className="image-item" onClick={() => setSelectedImage(imageUrl)}>
                    <img src={imageUrl} alt={`Device ${index + 1}`} />
                    <div className="image-overlay">
                      <span>Click to enlarge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Enlarged view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetailView;
