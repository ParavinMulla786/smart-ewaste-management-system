import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/PickupReviewDashboard.css';

/**
 * Pickup Review Dashboard Component
 * Admin reviews completed pickups
 */
const PickupReviewDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [approved, setApproved] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/pickup-persons/reviews/pending');
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load pending reviews');
      setLoading(false);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setReviewNotes('');
    setApproved(true);
    setShowReviewModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      await api.post('/pickup-persons/review', {
        requestId: selectedRequest.id,
        approved: approved,
        reviewNotes: reviewNotes
      });

      setSuccess(`Pickup ${approved ? 'approved' : 'rejected'} successfully!`);
      setShowReviewModal(false);
      fetchReviews();
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || 'Failed to submit review');
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

  if (loading) {
    return (
      <div className="pickup-review-dashboard">
        <div className="loading">Loading pending reviews...</div>
      </div>
    );
  }

  return (
    <div className="pickup-review-dashboard">
      <h2>Pickup Reviews Pending</h2>
      <p className="subtitle">Review completed pickups submitted by pickup persons</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {reviews.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">✅</div>
          <p>No pending reviews. All caught up!</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((request) => (
            <div key={request.id} className="review-card">
              <div className="card-header">
                <h3>Request #{request.id.slice(-6)}</h3>
                <span className="status-badge">In Review</span>
              </div>

              <div className="card-body">
                <div className="section">
                  <h4>📋 Request Details</h4>
                  <div className="info-row">
                    <span className="label">Customer:</span>
                    <span className="value">{request.userName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Device:</span>
                    <span className="value">{request.deviceType} - {request.brand} {request.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{request.quantity} unit(s)</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{request.pickupAddress}</span>
                  </div>
                </div>

                <div className="section">
                  <h4>🚚 Pickup Person</h4>
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{request.assignedPickupPersonName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{request.assignedPickupPersonEmail}</span>
                  </div>
                </div>

                <div className="section">
                  <h4>✅ Completion Details</h4>
                  <div className="info-row">
                    <span className="label">Pickup Time:</span>
                    <span className="value">{formatDate(request.actualPickupTime)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Photos:</span>
                    <span className="value">{request.collectedEwastePhotos?.length || 0} photo(s)</span>
                  </div>
                </div>

                {request.collectedEwastePhotos && request.collectedEwastePhotos.length > 0 && (
                  <div className="section">
                    <h4>🖼️ Collected E-Waste Photos</h4>
                    <div className="photo-gallery">
                      {request.collectedEwastePhotos.map((url, index) => (
                        <div key={index} className="photo-item">
                          <img src={url} alt={`Collected ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => openReviewModal(request)}
                >
                  Review This Pickup
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Pickup Completion</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body">
                <p className="modal-subtitle">
                  Request #{selectedRequest.id.slice(-6)} - {selectedRequest.userName}
                </p>

                <div className="review-summary">
                  <p><strong>Pickup Person:</strong> {selectedRequest.assignedPickupPersonName}</p>
                  <p><strong>Pickup Time:</strong> {formatDate(selectedRequest.actualPickupTime)}</p>
                  <p><strong>Photos Submitted:</strong> {selectedRequest.collectedEwastePhotos?.length || 0}</p>
                </div>

                <div className="form-group">
                  <label>Review Decision: <span className="required">*</span></label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="decision"
                        checked={approved}
                        onChange={() => setApproved(true)}
                      />
                      <span className="radio-text approve">✅ Approve - Mark as Completed</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="decision"
                        checked={!approved}
                        onChange={() => setApproved(false)}
                      />
                      <span className="radio-text reject">❌ Reject - Send back for revision</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Review Notes:</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this review (optional)"
                    rows="4"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className={approved ? "btn btn-success" : "btn btn-danger"}>
                  {approved ? 'Approve & Complete' : 'Reject Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupReviewDashboard;
