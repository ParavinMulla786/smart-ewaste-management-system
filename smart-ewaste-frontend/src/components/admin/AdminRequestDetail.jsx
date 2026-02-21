/**
 * Admin Request Detail Component
 * Shows detailed view of a pickup request with date change functionality
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminRequestDetail.css';

const AdminRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [newPickupDate, setNewPickupDate] = useState('');
  const [newPickupTime, setNewPickupTime] = useState('');
  const [dateChangeReason, setDateChangeReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pickupPersons, setPickupPersons] = useState([]);
  const [selectedPickupPerson, setSelectedPickupPerson] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
    fetchPickupPersons();
  }, [id]);

  // Auto-dismiss success message after 10 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/pickup-requests/${id}`);
      setRequest(response.data);
      if (response.data.pickupDate) {
        // Split date and time for separate inputs
        const date = new Date(response.data.pickupDate);
        setNewPickupDate(date.toISOString().split('T')[0]);
        setNewPickupTime(date.toTimeString().slice(0, 5));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPickupPersons = async () => {
    try {
      const response = await api.get('/pickup-persons/active');
      setPickupPersons(response.data);
    } catch (err) {
      console.error('Error fetching pickup persons:', err);
    }
  };

  const handleAssignPickupPerson = async () => {
    if (!selectedPickupPerson) {
      setError('Please select a pickup person');
      return;
    }

    if (!window.confirm('Are you sure you want to assign this pickup person?')) return;

    try {
      setProcessing(true);
      setError('');
      
      await api.post('/pickup-persons/assign', {
        requestId: id,
        pickupPersonId: selectedPickupPerson
      });

      setSuccess('Pickup person assigned successfully! They have been notified via email.');
      setShowAssignModal(false);
      setSelectedPickupPerson('');
      
      // Refresh request details
      await fetchRequestDetails();
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign pickup person');
    } finally {
      setProcessing(false);
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
      'PENDING': 'Pending Review',
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

  const handleUpdateDate = async (e) => {
    e.preventDefault();
    
    if (!newPickupDate) {
      setError('Please select a new pickup date');
      return;
    }

    if (!newPickupTime) {
      setError('Please select a pickup time');
      return;
    }

    if (!dateChangeReason.trim()) {
      setError('Please provide a reason for the date change');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      // Combine date and time
      const dateTimeString = `${newPickupDate}T${newPickupTime}:00`;
      
      await api.put(`/admin/pickup-requests/${id}/update-date`, {
        pickupDate: new Date(dateTimeString).toISOString(),
        reason: dateChangeReason
      });

      setSuccess('Pickup date and time updated successfully! User has been notified via email.');
      setShowDateModal(false);
      setDateChangeReason('');
      
      // Refresh request details
      await fetchRequestDetails();
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pickup date');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      setError('');
      await api.put(`/admin/pickup-requests/${id}/reject`, { 
        reason: 'Request rejected by admin - All further actions are disabled' 
      });
      setSuccess('Request rejected successfully! User has been notified.');
      setShowRejectModal(false);
      await fetchRequestDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      setProcessing(true);
      await api.put(`/admin/pickup-requests/${id}`, {
        status: newStatus,
        adminNotes: `Status updated to ${newStatus}`
      });
      setSuccess('Status updated successfully!');
      await fetchRequestDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this request?')) return;

    try {
      setProcessing(true);
      await api.put(`/admin/pickup-requests/${id}/approve`);
      setSuccess('Request accepted and set to IN PROGRESS! User has been notified.');
      await fetchRequestDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;

    try {
      setProcessing(true);
      await api.delete(`/admin/pickup-requests/${id}`);
      setSuccess('Request deleted successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard?tab=requests');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-request-detail-page">
        <div className="admin-detail-container">
          <div className="loading">Loading request details...</div>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="admin-request-detail-page">
        <div className="admin-detail-container">
          <div className="alert alert-error">{error}</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-request-detail-page">
      {processing && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}
      
      <div className="admin-detail-container">
        <div className="detail-header">
          <button onClick={() => navigate('/admin/dashboard?tab=requests')} className="btn btn-back">
            ← Back
          </button>
          <h1>Request Details</h1>
          <div className={`status-badge ${getStatusClass(request.status)}`}>
            {getStatusText(request.status)}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="detail-content">
          {/* Action Buttons */}
          <div className="action-section">
            <h2>⚡ Quick Actions</h2>
            {request.status === 'REJECTED' ? (
              <div className="rejected-notice">
                <div className="rejected-icon">🚫</div>
                <h3>This request has been rejected</h3>
                <p>All actions are disabled for rejected requests. The user has been notified.</p>
                {request.adminNotes && (
                  <div className="rejection-reason">
                    <strong>Rejection Reason:</strong>
                    <p>{request.adminNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="action-buttons">
                {request.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={handleApprove}
                      className="btn btn-approve"
                      disabled={processing}
                      style={{background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)', color: 'white'}}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="btn btn-reject"
                      disabled={processing}
                      style={{background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: 'white'}}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={handleDelete}
                      className="btn btn-delete"
                      disabled={processing}
                      style={{background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)', color: 'white'}}
                    >
                      🗑️ Delete
                    </button>
                  </>
                ) : (
                  <>
                    {!request.assignedPickupPersonId && (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="btn btn-warning"
                        disabled={processing}
                        style={{background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', color: 'white'}}
                      >
                        👤 Assign Pickup Person
                      </button>
                    )}
                    <button
                      onClick={() => setShowDateModal(true)}
                      className="btn btn-primary"
                      disabled={processing}
                    >
                      📅 Change Pickup Date
                    </button>
                    <button
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      className="btn btn-info"
                      disabled={processing || request.status === 'IN_PROGRESS'}
                    >
                      🚀 Mark In Progress
                    </button>
                    {request.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange('RESOLVED')}
                        className="btn btn-success"
                        disabled={processing || request.status === 'RESOLVED'}
                      >
                        ✅ Mark Completed
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

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

          {/* User Information */}
          <div className="detail-section">
            <h2>👤 User Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{request.userName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{request.userEmail}</span>
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
                <label>Scheduled Pickup Date:</label>
                <span className="pickup-date">{formatDate(request.pickupDate)}</span>
              </div>
              {request.remarks && (
                <div className="info-item full-width">
                  <label>User Remarks:</label>
                  <span className="remarks">{request.remarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Pickup Person */}
          {request.assignedPickupPersonId && (
            <div className="detail-section">
              <h2>🚚 Assigned Pickup Person</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{request.assignedPickupPersonName}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{request.assignedPickupPersonEmail}</span>
                </div>
                <div className="info-item">
                  <label>Assigned On:</label>
                  <span>{formatDate(request.assignedAt)}</span>
                </div>
              </div>
            </div>
          )}

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

      {/* Date Change Modal */}
      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Pickup Date</h3>
              <button className="modal-close" onClick={() => setShowDateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateDate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Current Pickup Date & Time:</label>
                  <div className="current-date">{formatDate(request.pickupDate)}</div>
                </div>
                <div className="form-group">
                  <label htmlFor="newPickupDate">New Pickup Date: <span className="required">*</span></label>
                  <input
                    type="date"
                    id="newPickupDate"
                    value={newPickupDate}
                    onChange={(e) => setNewPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPickupTime">New Pickup Time: <span className="required">*</span></label>
                  <input
                    type="time"
                    id="newPickupTime"
                    value={newPickupTime}
                    onChange={(e) => setNewPickupTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reason">Reason for Change: <span className="required">*</span></label>
                  <textarea
                    id="reason"
                    value={dateChangeReason}
                    onChange={(e) => setDateChangeReason(e.target.value)}
                    placeholder="Explain why the pickup date is being changed..."
                    rows="4"
                    required
                  />
                  <small className="form-help">This reason will be sent to the user via email</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowDateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Pickup Person Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Pickup Person</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="pickupPerson">Select Pickup Person: <span className="required">*</span></label>
                <select
                  id="pickupPerson"
                  value={selectedPickupPerson}
                  onChange={(e) => setSelectedPickupPerson(e.target.value)}
                  required
                >
                  <option value="">-- Select a Pickup Person --</option>
                  {pickupPersons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.email} {person.area ? `(${person.area})` : ''}
                    </option>
                  ))}
                </select>
                {pickupPersons.length === 0 && (
                  <small className="form-help" style={{color: '#e74c3c'}}>
                    No active pickup persons available. Please register one first.
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAssignPickupPerson} 
                className="btn btn-primary" 
                disabled={processing || !selectedPickupPerson}
              >
                {processing ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-box reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header reject-header">
              <div className="reject-warning-icon">⚠️</div>
              <h3>Reject Request?</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="reject-warning">
                <p><strong>Warning:</strong> Once you reject this request:</p>
                <ul>
                  <li>❌ The request will be permanently rejected</li>
                  <li>🚫 All actions (schedule, assign person, status changes) will be disabled</li>
                  <li>📧 The user will be notified via email</li>
                  <li>⚠️ This action cannot be easily undone</li>
                </ul>
                <p className="final-warning">Are you sure you want to proceed?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => {
                  setShowRejectModal(false);
                  setError('');
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleReject} 
                className="btn btn-reject" 
                disabled={processing}
                style={{background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: 'white'}}
              >
                {processing ? 'Rejecting...' : '❌ Yes, Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Enlarged view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestDetail;
