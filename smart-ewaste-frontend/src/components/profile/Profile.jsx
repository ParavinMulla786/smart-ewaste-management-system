/**
 * Profile Component
 * 
 * Features:
 * - Display user profile information
 * - Edit profile functionality
 * - Update profile API integration
 * - Logout functionality
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Navbar from '../dashboard/Navbar';
import '../../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  // Available avatars
  const avatarOptions = [
    { id: 1, emoji: '👨‍💼', name: 'Professional' },
    { id: 2, emoji: '👩‍💼', name: 'Business Woman' },
    { id: 3, emoji: '👨‍🔬', name: 'Scientist' },
    { id: 4, emoji: '👩‍🔬', name: 'Researcher' },
    { id: 5, emoji: '👨‍💻', name: 'Developer' },
    { id: 6, emoji: '👩‍💻', name: 'Programmer' },
    { id: 7, emoji: '👨‍🎓', name: 'Student' },
    { id: 8, emoji: '👩‍🎓', name: 'Graduate' },
    { id: 9, emoji: '🧑‍💼', name: 'Manager' },
    { id: 10, emoji: '👤', name: 'Default' },
    { id: 11, emoji: '🌟', name: 'Star' },
    { id: 12, emoji: '🎯', name: 'Target' },
    { id: 13, emoji: '🚀', name: 'Rocket' },
    { id: 14, emoji: '💚', name: 'Heart' },
    { id: 15, emoji: '🌱', name: 'Plant' },
    { id: 16, emoji: '♻️', name: 'Recycle' }
  ];

  // Profile state
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Form state (for editing)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  /**
   * Fetch user profile on component mount
   */
  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Fetch user profile from API
   */
  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
      
      // Initialize form data
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        avatar: response.data.avatar || '',
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission (update profile)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setUpdating(true);

    try {
      // Call update API
      const response = await api.put('/user/update', formData);
      
      // Update local state
      setUser(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar || '',
    });
    setIsEditing(false);
    setShowAvatarPicker(false);
    setError('');
    setSuccess('');
  };

  /**
   * Handle avatar selection
   */
  const handleAvatarSelect = async (avatarEmoji) => {
    setFormData({
      ...formData,
      avatar: avatarEmoji,
    });
    setShowAvatarPicker(false);
    
    // Auto-save avatar selection
    try {
      const response = await api.put('/user/update', {
        ...formData,
        avatar: avatarEmoji,
      });
      setUser(response.data);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update avatar');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Get current avatar display
   */
  const getCurrentAvatar = () => {
    // Prioritize user.avatar (saved data) over formData.avatar (editing state)
    const avatar = user?.avatar || formData.avatar;
    if (avatar) {
      return avatar;
    }
    // Fallback to first letter of name
    return user?.name?.charAt(0).toUpperCase() || '?';
  };

  /**
   * Handle profile image upload
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend
      const response = await api.post('/files/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update user state with new image URL
        setUser(prev => ({
          ...prev,
          profileImageUrl: response.data.imageUrl
        }));
        setSuccess('Profile image uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } finally {
      setUploadingImage(false);
      // Clear file input
      e.target.value = '';
    }
  };

  /**
   * Handle profile image delete
   */
  const handleImageDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.delete('/files/delete/profile-image');

      if (response.data.success) {
        // Update user state
        setUser(prev => ({
          ...prev,
          profileImageUrl: null
        }));
        setSuccess('Profile image deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete image. Please try again.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (!user) {
    return (
      <div className="error-container">
        <p>Failed to load profile</p>
        <button onClick={fetchProfile}>Retry</button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-content-wrapper">
          {/* Page Header */}
          <div className="profile-page-header">
            <div>
              <h1 className="profile-page-title">Profile</h1>
              <p className="profile-page-subtitle">View all your profile details here.</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Profile Grid Layout */}
          <div className="profile-grid">
            {/* Left Section - Profile Card */}
            <div className="profile-left-section">
              <div className="profile-avatar-section">
                <div className="profile-avatar-frame">
                  <div className="profile-avatar">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="profile-image"
                      />
                    ) : (
                      <span className="avatar-text">{getCurrentAvatar()}</span>
                    )}
                  </div>
                  <button 
                    className="change-avatar-btn" 
                    onClick={() => setShowAvatarPicker(true)}
                    title="Change Avatar"
                  >
                    📷
                  </button>
                </div>
                
                {/* Profile Image Upload Section */}
                <div className="profile-image-upload">
                  <input
                    type="file"
                    id="profileImageInput"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                  />
                  <label 
                    htmlFor="profileImageInput" 
                    className="upload-image-btn"
                    style={{ opacity: uploadingImage ? 0.6 : 1, cursor: uploadingImage ? 'not-allowed' : 'pointer' }}
                  >
                    {uploadingImage ? '⏳ Uploading...' : '📤 Upload Photo'}
                  </label>
                  {user.profileImageUrl && (
                    <button
                      onClick={handleImageDelete}
                      className="delete-image-btn"
                      disabled={uploadingImage}
                      style={{ opacity: uploadingImage ? 0.6 : 1 }}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
                
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-status">Verified User</p>
              </div>
            </div>

            {/* Right Section - Bio & Details */}
            <div className="profile-right-section">
              <div className="profile-details-card">
                <div className="profile-details-header">
                  <h3>Bio & other details</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="edit-icon-btn" title="Edit Profile">
                      ✏️
                    </button>
                  ) : null}
                </div>

                {!isEditing ? (
                  // View Mode
                  <div className="profile-details-grid">
                    <div className="profile-detail-item">
                      <label>Email Address</label>
                      <p>{user.email}</p>
                    </div>

                    <div className="profile-detail-item">
                      <label>Phone Number</label>
                      <p>{user.phone}</p>
                    </div>

                    <div className="profile-detail-item full-width">
                      <label>Address</label>
                      <p>{user.address || 'Not provided'}</p>
                    </div>

                    <div className="profile-detail-item">
                      <label>Member Since</label>
                      <p>{new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}</p>
                    </div>

                    <div className="profile-detail-item">
                      <label>Account Status</label>
                      <div className="status-badge active">
                        <span className="status-dot"></span>
                        Active
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Phone *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email (Cannot be changed)</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="disabled-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="save-button"
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="cancel-button"
                        disabled={updating}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal - Centered on Screen */}
      {showAvatarPicker && (
        <>
          <div className="avatar-picker-overlay" onClick={() => setShowAvatarPicker(false)}></div>
          <div className="avatar-picker-modal-centered">
            <div className="avatar-picker-header">
              <h4>Choose Your Avatar</h4>
              <button 
                className="close-picker-btn"
                onClick={() => setShowAvatarPicker(false)}
              >
                ✕
              </button>
            </div>
            <div className="avatar-options-grid">
              {avatarOptions.map((option) => (
                <button
                  key={option.id}
                  className={`avatar-option ${formData.avatar === option.emoji ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(option.emoji)}
                  title={option.name}
                >
                  <span className="avatar-option-emoji">{option.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
