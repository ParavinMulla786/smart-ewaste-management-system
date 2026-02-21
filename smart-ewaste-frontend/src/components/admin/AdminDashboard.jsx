import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import AnalyticsCharts from './AnalyticsCharts';
import PickupPersonManagement from './PickupPersonManagement';
import PickupReviewDashboard from './PickupReviewDashboard';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'analytics');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Form states
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Auto-dismiss success messages after 10 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'analytics' || activeTab === 'requests') {
        const response = await api.get('/admin/pickup-requests');
        const sortedRequests = response.data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
        setRequests(sortedRequests);
      } else if (activeTab === 'pending') {
        const response = await api.get('/admin/users/pending');
        setPendingUsers(response.data);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } else if (activeTab === 'admins') {
        const response = await api.get('/admin/admins');
        setAdmins(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/block`);
      setSuccess('User blocked successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      setSuccess('User unblocked successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleApproveUser = async (userId) => {
    if (processingId) return; // Prevent multiple clicks
    
    setProcessingId(userId);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/admin/users/pending/${userId}/approve`);
      setSuccess('User approved! Verification email sent.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectUser = async (userId) => {
    if (processingId) return; // Prevent multiple clicks
    if (!window.confirm('Are you sure you want to reject this registration?')) return;
    
    setProcessingId(userId);
    setError('');
    setSuccess('');
    
    try {
      await api.delete(`/admin/users/pending/${userId}`);
      setSuccess('User registration rejected');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveRequest = async (requestId) => {
    if (processingId) return;
    setProcessingId(requestId);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/admin/pickup-requests/${requestId}/approve`, {
        adminNotes: 'Request approved by admin',
        assignedTo: 'Admin Team'
      });
      setSuccess('Request approved! User has been notified.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (processingId) return;
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    
    setProcessingId(requestId);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/admin/pickup-requests/${requestId}/reject`, { reason });
      setSuccess('Request rejected. User has been notified.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    if (processingId) return;
    setProcessingId(requestId);
    
    try {
      await api.put(`/admin/pickup-requests/${requestId}`, {
        status,
        adminNotes: `Status updated to ${status}`
      });
      setSuccess('Request status updated successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (processingId) return;
    if (!window.confirm('Are you sure you want to delete this pickup request? This action cannot be undone.')) return;
    
    setProcessingId(requestId);
    setError('');
    setSuccess('');
    
    try {
      await api.delete(`/admin/pickup-requests/${requestId}`);
      setSuccess('Pickup request deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await api.post('/admin/admins', newAdmin);
      setSuccess('Admin created successfully');
      setNewAdmin({ name: '', email: '', password: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await api.delete(`/admin/admins/${adminId}`);
      setSuccess('Admin deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  // Helper function to map status to display text
  const getStatusDisplayText = (status) => {
    switch(status) {
      case 'NEW':
        return 'Approved'; // Changed from "New" to "Approved"
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'RESOLVED':
        return 'Completed';
      case 'REJECTED':
        return 'Rejected';
      case 'ON_HOLD':
        return 'On Hold';
      default:
        return status;
    }
  };

  // Helper function to get CSS class for status
  const getStatusClass = (status) => {
    switch(status) {
      case 'NEW':
        return 'status-approved'; // Changed from "status-new" to "status-approved"
      case 'PENDING':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'RESOLVED':
        return 'status-completed';
      case 'REJECTED':
        return 'status-rejected';
      case 'ON_HOLD':
        return 'status-on-hold';
      default:
        return '';
    }
  };

  return (
    <div className="admin-dashboard">
      {processingId && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}
      
      <nav className="admin-navbar">
        <div className="nav-brand">Admin Dashboard</div>
        <div className="nav-actions">
          <Link to="/admin/history" className="btn btn-history">📜 History</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="tabs">
          <button 
            className={activeTab === 'analytics' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={activeTab === 'pending' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('pending')}
          >
            Pending Users {pendingUsers.length > 0 && <span className="badge">{pendingUsers.length}</span>}
          </button>
          <button 
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={activeTab === 'requests' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('requests')}
          >
            Request Management
          </button>
          <button 
            className={activeTab === 'admins' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('admins')}
          >
            Admin Management
          </button>
          <button 
            className={activeTab === 'pickup-persons' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('pickup-persons')}
          >
            🚚 Pickup Persons
          </button>
          <button 
            className={activeTab === 'pickup-reviews' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('pickup-reviews')}
          >
            📋 Pickup Reviews
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'analytics' && (
              <AnalyticsCharts requests={requests} />
            )}
            
            {activeTab === 'pending' && (
              <div className="pending-section">
                <h2>Pending Users</h2>
                {pendingUsers.length === 0 ? (
                  <div className="empty-state">No pending registrations</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Registration Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                          <td>
                            <button 
                              onClick={() => handleApproveUser(user.id)}
                              className="btn btn-approve"
                              disabled={processingId === user.id}
                            >
                              {processingId === user.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => handleRejectUser(user.id)}
                              className="btn btn-reject"
                              disabled={processingId === user.id}
                            >
                              {processingId === user.id ? 'Processing...' : 'Reject'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-section">
                <h2>User Management</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`user-status ${user.blocked ? 'status-blocked' : 'status-active'}`}>
                            {user.blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td>
                          {user.blocked ? (
                            <button 
                              onClick={() => handleUnblockUser(user.id)}
                              className="btn btn-success"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleBlockUser(user.id)}
                              className="btn btn-warning"
                            >
                              Block
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="requests-section">
                <h2>Request Management</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Device</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#999'}}>
                          No pickup requests yet
                        </td>
                      </tr>
                    ) : (
                      requests.map(request => (
                        <tr key={request.id}>
                          <td>
                            <div>{request.userName}</div>
                            <small style={{color: '#7f8c8d'}}>{request.userEmail}</small>
                          </td>
                          <td>
                            <div>{request.deviceType}</div>
                            <small style={{color: '#7f8c8d', display: 'block'}}>{request.brand} {request.model}</small>
                            <small style={{color: '#7f8c8d', display: 'block'}}>{request.condition} • Qty: {request.quantity}</small>
                          </td>
                          <td>
                            <small style={{maxWidth: '200px', display: 'block'}}>
                              {request.pickupAddress.length > 60 
                                ? request.pickupAddress.substring(0, 60) + '...' 
                                : request.pickupAddress}
                            </small>
                          </td>
                          <td>
                            <span className={`status-btn ${getStatusClass(request.status)}`}>
                              {getStatusDisplayText(request.status)}
                            </span>
                          </td>
                          <td>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap', whiteSpace: 'nowrap'}}>
                              <Link 
                                to={`/admin/request-details/${request.id}`}
                                className="btn btn-icon btn-view"
                                title="View Details"
                                style={{padding: '0.4rem 0.7rem', fontSize: '1.3rem', minWidth: '40px', minHeight: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                              >
                                👁️
                              </Link>
                              <button 
                                onClick={() => handleDeleteRequest(request.id)}
                                className="btn btn-icon btn-delete"
                                disabled={processingId === request.id}
                                title="Delete this request"
                                style={{padding: '0.4rem 0.7rem', fontSize: '1.3rem', minWidth: '40px', minHeight: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                              >
                                🗑️
                              </button>
                              {request.status === 'PENDING' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveRequest(request.id)}
                                    className="btn btn-success"
                                    disabled={processingId === request.id}
                                    style={{padding: '0.5rem 1rem', fontSize: '0.85rem'}}
                                  >
                                    {processingId === request.id ? '...' : 'Approve'}
                                  </button>
                                  <button 
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="btn btn-danger"
                                    disabled={processingId === request.id}
                                    style={{padding: '0.5rem 1rem', fontSize: '0.85rem'}}
                                  >
                                    {processingId === request.id ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="admins-section">
                <h2>Admin Management</h2>
                
                <div className="create-admin-form">
                  <h3>Create New Admin</h3>
                  <form onSubmit={handleCreateAdmin}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password (min 8 characters)"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      required
                      minLength={8}
                    />
                    <button type="submit" className="btn btn-primary">Create Admin</button>
                  </form>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Created At</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.id}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                        <td>{admin.createdBy || 'System'}</td>
                        <td>
                          {admin.email === 'cleanstreet02@gmail.com' ? (
                            <span className="btn btn-disabled" title="Default admin cannot be deleted">
                              🔒 Protected
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="btn btn-danger"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'pickup-persons' && (
              <PickupPersonManagement />
            )}

            {activeTab === 'pickup-reviews' && (
              <PickupReviewDashboard />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;