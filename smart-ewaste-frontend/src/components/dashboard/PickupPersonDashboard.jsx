import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/PickupPersonDashboard.css';

/**
 * Pickup Person Dashboard Component
 * Shows assigned pickup requests with complete/not complete options
 */
const PickupPersonDashboard = () => {
  console.log('PickupPersonDashboard component rendering');
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pickupPersonId, setPickupPersonId] = useState('');
  const [pickupPersonName, setPickupPersonName] = useState('');
  
  // Modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showNotCompletedModal, setShowNotCompletedModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Complete form
  const [actualPickupTime, setActualPickupTime] = useState('');
  const [collectedPhotos, setCollectedPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  // Not completed form
  const [notCompletedReason, setNotCompletedReason] = useState('');
  const [nextAvailableDate, setNextAvailableDate] = useState('');
  const [nextAvailableTime, setNextAvailableTime] = useState('');

  useEffect(() => {
    console.log('useEffect running in PickupPersonDashboard');
    const role = localStorage.getItem('role');
    console.log('Role from localStorage:', role);
    if (role !== 'PICKUP_PERSON') {
      console.log('Not a pickup person, redirecting...');
      navigate('/login');
      return;
    }
    fetchPickupPersonInfo();
  }, []);

  const fetchPickupPersonInfo = async () => {
    try {
      console.log('Fetching pickup person info...');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User from localStorage:', user);
      const response = await api.get(`/pickup-persons/email/${user.email}`);
      console.log('Pickup person info response:', response.data);
      setPickupPersonId(response.data.id);
      setPickupPersonName(response.data.name);
      fetchAssignedRequests(response.data.id);
    } catch (err) {
      console.error('Error fetching pickup person info:', err);
      setError('Failed to load your information');
      setLoading(false);
    }
  };

  const fetchAssignedRequests = async (personId) => {
    try {
      console.log('Fetching assigned requests for personId:', personId);
      const response = await api.get(`/pickup-persons/${personId}/requests`);
      console.log('Assigned requests response:', response.data);
      // Filter out completed, resolved and cancelled requests
      const activeRequests = response.data.filter(
        r => r.status !== 'COMPLETED' && r.status !== 'RESOLVED' && r.status !== 'CANCELLED'
      );
      console.log('Active requests:', activeRequests);
      setRequests(activeRequests);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load assigned requests');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openCompleteModal = (request) => {
    setSelectedRequest(request);
    setActualPickupTime(new Date().toISOString().slice(0, 16));
    setCollectedPhotos([]);
    setShowCompleteModal(true);
    setError('');
    setSuccess('');
  };

  const openNotCompletedModal = (request) => {
    setSelectedRequest(request);
    setNotCompletedReason('');
    setNextAvailableDate('');
    setNextAvailableTime('');
    setShowNotCompletedModal(true);
    setError('');
    setSuccess('');
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setError('');

    try {
      console.log('Uploading photos:', files.length);
      const formData = new FormData();
      
      // Append all files to FormData with key 'files'
      for (let file of files) {
        formData.append('files', file);
      }

      const response = await api.post('/files/upload/ewaste-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      
      // The backend returns { imageUrls: [...] }
      const uploadedUrls = response.data.imageUrls || [];
      setCollectedPhotos([...collectedPhotos, ...uploadedUrls]);
      setSuccess(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    } catch (err) {
      console.error('Error uploading photos:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to upload photos. Please try again.');
      }
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleCompletePickup = async (e) => {
    e.preventDefault();
    
    if (collectedPhotos.length === 0) {
      setError('Please upload at least one photo of collected e-waste');
      return;
    }

    try {
      await api.post('/pickup-persons/complete-pickup', {
        requestId: selectedRequest.id,
        actualPickupTime: new Date(actualPickupTime).toISOString(),
        collectedEwastePhotos: collectedPhotos
      });

      setSuccess('Pickup marked as completed! Awaiting admin review.');
      setShowCompleteModal(false);
      fetchAssignedRequests(pickupPersonId);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error completing pickup:', err);
      setError(err.response?.data?.error || 'Failed to complete pickup');
    }
  };

  const handleNotCompleted = async (e) => {
    e.preventDefault();
    
    if (!notCompletedReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    if (!nextAvailableDate || !nextAvailableTime) {
      setError('Please provide next available date and time');
      return;
    }

    try {
      const nextDateTime = new Date(`${nextAvailableDate}T${nextAvailableTime}`).toISOString();
      
      await api.post('/pickup-persons/not-completed', {
        requestId: selectedRequest.id,
        reason: notCompletedReason,
        nextAvailableDate: nextDateTime
      });

      setSuccess('User has been notified about the postponement.');
      setShowNotCompletedModal(false);
      fetchAssignedRequests(pickupPersonId);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error marking not completed:', err);
      setError(err.response?.data?.error || 'Failed to update pickup status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ASSIGNED': { class: 'status-assigned', text: 'Assigned' },
      'IN_REVIEW': { class: 'status-review', text: 'In Review' },
      'POSTPONED': { class: 'status-postponed', text: 'Postponed' },
      'IN_PROGRESS': { class: 'status-progress', text: 'Retry Needed' }
    };
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="pickup-person-dashboard">
        <div className="loading">Loading your assigned pickups...</div>
      </div>
    );
  }

  return (
    <div className="pickup-person-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚚 Pickup Dashboard</h1>
          <p className="welcome-text">Welcome, {pickupPersonName}!</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{requests.length}</h3>
              <p>Assigned Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{requests.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length}</h3>
              <p>Pending Pickups</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <h3>{requests.filter(r => r.status === 'IN_REVIEW').length}</h3>
              <p>Under Review</p>
            </div>
          </div>
        </div>

        <div className="requests-section">
          <h2>Your Assigned Pickup Requests</h2>
          
          {requests.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📦</div>
              <p>No pickup requests assigned yet.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="card-header">
                    <h3>Request #{request.id.slice(-6)}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Customer:</span>
                      <span className="value">{request.userName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Phone:</span>
                      <span className="value">{request.userPhone || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Device:</span>
                      <span className="value">{request.deviceType} - {request.brand}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Quantity:</span>
                      <span className="value">{request.quantity} unit(s)</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Address:</span>
                      <span className="value address">{request.pickupAddress}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Scheduled:</span>
                      <span className="value">{formatDate(request.pickupDate)}</span>
                    </div>
                    {request.remarks && (
                      <div className="info-row">
                        <span className="label">Remarks:</span>
                        <span className="value">{request.remarks}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    {request.status === 'ASSIGNED' || request.status === 'POSTPONED' || request.status === 'IN_PROGRESS' ? (
                      <>
                        <button 
                          className="btn btn-success"
                          onClick={() => openCompleteModal(request)}
                        >
                          ✅ Completed
                        </button>
                        <button 
                          className="btn btn-warning"
                          onClick={() => openNotCompletedModal(request)}
                        >
                          ⚠️ Not Completed
                        </button>
                      </>
                    ) : request.status === 'IN_REVIEW' ? (
                      <div className="review-message">
                        ⏳ Awaiting admin review
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complete Pickup Modal */}
      {showCompleteModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Complete Pickup</h3>
              <button className="modal-close" onClick={() => setShowCompleteModal(false)}>×</button>
            </div>
            <form onSubmit={handleCompletePickup}>
              <div className="modal-body">
                <p className="modal-subtitle">Request #{selectedRequest.id.slice(-6)} - {selectedRequest.userName}</p>
                
                <div className="form-group">
                  <label>Actual Pickup Time: <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    value={actualPickupTime}
                    onChange={(e) => setActualPickupTime(e.target.value)}
                    max={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Photos of Collected E-Waste: <span className="required">*</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhotos}
                  />
                  <small className="form-help">Upload photos showing the collected e-waste</small>
                  
                  {uploadingPhotos && <p className="upload-status">Uploading photos...</p>}
                  
                  {collectedPhotos.length > 0 && (
                    <div className="photo-preview">
                      <p>{collectedPhotos.length} photo(s) uploaded</p>
                      <div className="photo-grid">
                        {collectedPhotos.map((url, index) => (
                          <img key={index} src={url} alt={`Collected ${index + 1}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCompleteModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadingPhotos || collectedPhotos.length === 0}>
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Not Completed Modal */}
      {showNotCompletedModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowNotCompletedModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pickup Not Completed</h3>
              <button className="modal-close" onClick={() => setShowNotCompletedModal(false)}>×</button>
            </div>
            <form onSubmit={handleNotCompleted}>
              <div className="modal-body">
                <p className="modal-subtitle">Request #{selectedRequest.id.slice(-6)} - {selectedRequest.userName}</p>
                
                <div className="form-group">
                  <label>Reason for Not Completing: <span className="required">*</span></label>
                  <textarea
                    value={notCompletedReason}
                    onChange={(e) => setNotCompletedReason(e.target.value)}
                    placeholder="E.g., Customer not available, address incorrect, etc."
                    rows="4"
                    required
                  />
                  <small className="form-help">This will be sent to the customer</small>
                </div>

                <div className="form-group">
                  <label>Next Available Date: <span className="required">*</span></label>
                  <input
                    type="date"
                    value={nextAvailableDate}
                    onChange={(e) => setNextAvailableDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Next Available Time: <span className="required">*</span></label>
                  <input
                    type="time"
                    value={nextAvailableTime}
                    onChange={(e) => setNextAvailableTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNotCompletedModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit & Notify User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupPersonDashboard;
