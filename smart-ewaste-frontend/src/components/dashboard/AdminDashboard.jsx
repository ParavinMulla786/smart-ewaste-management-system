import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Stats and chart data
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    acceptedScheduled: 0,
    rejected: 0
  });
  
  const [deviceTypeData, setDeviceTypeData] = useState([]);
  const [statusData, setStatusData] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  
  // Form states
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadData();
    if (activeTab === 'reports') {
      loadReportsData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'pending') {
        const response = await api.get('/admin/users/pending');
        setPendingUsers(response.data);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } else if (activeTab === 'requests') {
        const response = await api.get('/admin/pickup-requests');
        setRequests(response.data);
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

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [usersRes, requestsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/pickup-requests')
      ]);
      
      const allUsers = usersRes.data;
      const allRequests = requestsRes.data;
      
      // Calculate stats
      setStats({
        totalUsers: allUsers.length,
        pendingRequests: allRequests.filter(r => r.status === 'PENDING').length,
        acceptedScheduled: allRequests.filter(r => r.status === 'NEW' || r.status === 'IN_PROGRESS').length,
        rejected: allRequests.filter(r => r.status === 'REJECTED').length
      });
      
      // Calculate device type data
      const deviceCounts = {};
      allRequests.forEach(req => {
        const device = req.deviceType || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      
      const deviceData = Object.entries(deviceCounts).map(([name, count]) => ({
        name,
        count
      }));
      setDeviceTypeData(deviceData);
      
      // Calculate status data
      setStatusData({
        pending: allRequests.filter(r => r.status === 'PENDING').length,
        accepted: allRequests.filter(r => r.status === 'NEW' || r.status === 'IN_PROGRESS').length,
        rejected: allRequests.filter(r => r.status === 'REJECTED').length
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports data');
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

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="nav-brand">Admin Dashboard</div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="admin-content">
        <div className="tabs">
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
            className={activeTab === 'reports' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <div className="pending-section">
                <h2>Pending User Registrations</h2>
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
                          <span className={user.blocked ? 'status-blocked' : 'status-active'}>
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
                            <small style={{color: '#7f8c8d'}}>{request.brand} {request.model}</small>
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
                            <span className={`status-${request.status.toLowerCase()}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                <button 
                                  onClick={() => navigate(`/admin/request-details/${request.id}`)}
                                  className="btn btn-icon btn-view"
                                  title="View Details"
                                >
                                  <span style={{fontSize: '1.3rem'}}>👁️</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteRequest(request.id)}
                                  className="btn btn-icon btn-delete"
                                  disabled={processingId === request.id}
                                  title="Delete this request"
                                >
                                  <span style={{fontSize: '1.3rem'}}>🗑️</span>
                                </button>
                              </div>
                              {request.status === 'PENDING' ? (
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                  <button 
                                    onClick={() => handleApproveRequest(request.id)}
                                    className="btn btn-success"
                                    disabled={processingId === request.id}
                                  >
                                    {processingId === request.id ? 'Processing...' : 'Approve'}
                                  </button>
                                  <button 
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="btn btn-danger"
                                    disabled={processingId === request.id}
                                  >
                                    {processingId === request.id ? 'Processing...' : 'Reject'}
                                  </button>
                                </div>
                              ) : request.status !== 'REJECTED' ? (
                                <select 
                                  onChange={(e) => handleUpdateRequestStatus(request.id, e.target.value)}
                                  value={request.status}
                                  className="status-select"
                                  disabled={processingId === request.id}
                                >
                                  <option value="NEW">New</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="RESOLVED">Completed</option>
                                </select>
                              ) : (
                                <span style={{color: '#e74c3c'}}>Rejected</span>
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
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id)}
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

            {activeTab === 'reports' && (
              <div className="reports-section">
                <h2>Overview of e-waste management system</h2>
                
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card stat-card-users">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <h3 className="stat-number">{stats.totalUsers}</h3>
                      <p className="stat-label">Total Users</p>
                    </div>
                  </div>

                  <div className="stat-card stat-card-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                      <h3 className="stat-number">{stats.pendingRequests}</h3>
                      <p className="stat-label">Pending Requests</p>
                    </div>
                  </div>

                  <div className="stat-card stat-card-accepted">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <h3 className="stat-number">{stats.acceptedScheduled}</h3>
                      <p className="stat-label">Accepted/Scheduled</p>
                    </div>
                  </div>

                  <div className="stat-card stat-card-rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                      <h3 className="stat-number">{stats.rejected}</h3>
                      <p className="stat-label">Rejected</p>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-container">
                  {/* Device Type Chart */}
                  <div className="chart-card">
                    <h3>Requests by Device Type</h3>
                    <div className="bar-chart">
                      {deviceTypeData.length === 0 ? (
                        <div className="empty-chart">No data available</div>
                      ) : (
                        <>
                          <div className="chart-bars">
                            {deviceTypeData.map((item, index) => {
                              const maxCount = Math.max(...deviceTypeData.map(d => d.count));
                              const heightPercent = (item.count / maxCount) * 100;
                              return (
                                <div key={index} className="bar-wrapper">
                                  <div className="bar-container">
                                    <div 
                                      className="bar" 
                                      style={{ height: `${heightPercent}%` }}
                                      title={`${item.name}: ${item.count}`}
                                    >
                                      <span className="bar-value">{item.count}</span>
                                    </div>
                                  </div>
                                  <div className="bar-label">{item.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Chart */}
                  <div className="chart-card">
                    <h3>Requests by Status</h3>
                    <div className="donut-chart">
                      {(statusData.pending + statusData.accepted + statusData.rejected) === 0 ? (
                        <div className="empty-chart">No data available</div>
                      ) : (
                        <>
                          <svg viewBox="0 0 200 200" className="donut-svg">
                            {(() => {
                              const total = statusData.pending + statusData.accepted + statusData.rejected;
                              const pendingPercent = (statusData.pending / total) * 100;
                              const acceptedPercent = (statusData.accepted / total) * 100;
                              const rejectedPercent = (statusData.rejected / total) * 100;
                              
                              const radius = 80;
                              const circumference = 2 * Math.PI * radius;
                              
                              let offset = 0;
                              const segments = [];
                              
                              // Pending segment
                              if (statusData.pending > 0) {
                                const dashArray = `${(pendingPercent / 100) * circumference} ${circumference}`;
                                segments.push(
                                  <circle
                                    key="pending"
                                    cx="100"
                                    cy="100"
                                    r={radius}
                                    fill="none"
                                    stroke="#f39c12"
                                    strokeWidth="30"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={-offset}
                                    transform="rotate(-90 100 100)"
                                  />
                                );
                                offset += (pendingPercent / 100) * circumference;
                              }
                              
                              // Accepted segment
                              if (statusData.accepted > 0) {
                                const dashArray = `${(acceptedPercent / 100) * circumference} ${circumference}`;
                                segments.push(
                                  <circle
                                    key="accepted"
                                    cx="100"
                                    cy="100"
                                    r={radius}
                                    fill="none"
                                    stroke="#27ae60"
                                    strokeWidth="30"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={-offset}
                                    transform="rotate(-90 100 100)"
                                  />
                                );
                                offset += (acceptedPercent / 100) * circumference;
                              }
                              
                              // Rejected segment
                              if (statusData.rejected > 0) {
                                const dashArray = `${(rejectedPercent / 100) * circumference} ${circumference}`;
                                segments.push(
                                  <circle
                                    key="rejected"
                                    cx="100"
                                    cy="100"
                                    r={radius}
                                    fill="none"
                                    stroke="#e74c3c"
                                    strokeWidth="30"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={-offset}
                                    transform="rotate(-90 100 100)"
                                  />
                                );
                              }
                              
                              return segments;
                            })()}
                          </svg>
                          <div className="chart-legend">
                            <div className="legend-item">
                              <span className="legend-color" style={{backgroundColor: '#f39c12'}}></span>
                              <span className="legend-text">Pending ({statusData.pending})</span>
                            </div>
                            <div className="legend-item">
                              <span className="legend-color" style={{backgroundColor: '#27ae60'}}></span>
                              <span className="legend-text">Accepted ({statusData.accepted})</span>
                            </div>
                            <div className="legend-item">
                              <span className="legend-color" style={{backgroundColor: '#e74c3c'}}></span>
                              <span className="legend-text">Rejected ({statusData.rejected})</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Pickup Requests */}
                <div className="recent-requests-section">
                  <div className="section-header">
                    <h3>Recent Pickup Requests</h3>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('requests'); }} className="view-all-link">
                      View All →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
