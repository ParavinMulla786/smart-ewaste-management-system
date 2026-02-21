import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/PickupPersonManagement.css';

/**
 * Pickup Person Management Component
 * Admin can register and manage pickup persons
 */
const PickupPersonManagement = () => {
  const navigate = useNavigate();
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    area: '',
    vehicleNumber: '',
    vehicleType: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPickupPersons();
  }, []);

  const fetchPickupPersons = async () => {
    try {
      const response = await api.get('/pickup-persons');
      setPickupPersons(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pickup persons:', err);
      setError('Failed to load pickup persons');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingPerson) {
        // Update existing pickup person
        await api.put(`/pickup-persons/${editingPerson.id}`, formData);
        setSuccess('Pickup person updated successfully!');
      } else {
        // Register new pickup person
        await api.post('/pickup-persons/register', formData);
        setSuccess('Pickup person registered successfully!');
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        area: '',
        vehicleNumber: '',
        vehicleType: ''
      });
      setShowForm(false);
      setEditingPerson(null);
      fetchPickupPersons();
    } catch (err) {
      console.error('Error saving pickup person:', err);
      setError(err.response?.data?.error || 'Failed to save pickup person');
    }
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email,
      phone: person.phone,
      password: '', // Don't populate password
      area: person.area || '',
      vehicleNumber: person.vehicleNumber || '',
      vehicleType: person.vehicleType || ''
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/pickup-persons/${id}/toggle-status`);
      setSuccess('Status updated successfully!');
      fetchPickupPersons();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pickup person?')) {
      try {
        await api.delete(`/pickup-persons/${id}`);
        setSuccess('Pickup person deleted successfully!');
        fetchPickupPersons();
      } catch (err) {
        console.error('Error deleting pickup person:', err);
        setError('Failed to delete pickup person');
      }
    }
  };

  if (loading) {
    return (
      <div className="pickup-person-management">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pickup-person-management">
      <div className="header-section">
        <h2>Pickup Person Management</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingPerson(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              area: '',
              vehicleNumber: '',
              vehicleType: ''
            });
            setError('');
            setSuccess('');
          }}
        >
          {showForm ? 'Cancel' : '+ Register New Pickup Person'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="form-section">
          <h3>{editingPerson ? 'Edit Pickup Person' : 'Register New Pickup Person'}</h3>
          {!editingPerson && (
            <div className="info-message" style={{background: '#e7f3ff', padding: '12px', borderRadius: '4px', marginBottom: '15px', borderLeft: '4px solid #2196F3'}}>
              ℹ️ A temporary password will be automatically generated and sent to the pickup person's email. They will be required to reset it on first login.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={editingPerson} // Can't change email when editing
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {editingPerson && (
                <div className="form-group">
                  <label>Password (Optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Area/Location</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Car">Car</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingPerson ? 'Update Pickup Person' : 'Register Pickup Person'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingPerson(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    area: '',
                    vehicleNumber: '',
                    vehicleType: ''
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="persons-list">
        <h3>All Pickup Persons ({pickupPersons.length})</h3>
        
        {pickupPersons.length === 0 ? (
          <div className="no-data">No pickup persons registered yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Vehicle</th>
                  <th>Pending</th>
                  <th>Completed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pickupPersons.map((person) => (
                  <tr key={person.id}>
                    <td>{person.name}</td>
                    <td>{person.email}</td>
                    <td>{person.phone}</td>
                    <td>{person.area || '-'}</td>
                    <td>
                      {person.vehicleType && person.vehicleNumber 
                        ? `${person.vehicleType} - ${person.vehicleNumber}`
                        : '-'
                      }
                    </td>
                    <td>{person.totalPickupsPending || 0}</td>
                    <td>{person.totalPickupsCompleted || 0}</td>
                    <td>
                      <span className={`status-badge ${person.active ? 'active' : 'inactive'}`}>
                        {person.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(person)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-toggle" 
                        onClick={() => handleToggleStatus(person.id)}
                        title={person.active ? 'Deactivate' : 'Activate'}
                      >
                        {person.active ? '🔒' : '🔓'}
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(person.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
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

export default PickupPersonManagement;
