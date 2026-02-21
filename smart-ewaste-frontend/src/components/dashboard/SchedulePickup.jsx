/**
 * Schedule Pickup Component
 * Form for submitting e-waste pickup requests
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../services/api';
import '../../styles/SchedulePickup.css';

const SchedulePickup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    deviceType: '',
    brand: '',
    model: '',
    condition: '',
    quantity: 1,
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',
    remarks: '',
    images: []
  });

  const deviceTypes = [
    'Laptop',
    'Mobile Phone',
    'Tablet',
    'Desktop Computer',
    'Monitor',
    'Printer',
    'Television',
    'Keyboard/Mouse',
    'Cables/Chargers',
    'Other Electronics'
  ];

  const conditions = [
    'Working',
    'Damaged',
    'Dead'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if total images will exceed 3
    const totalImages = imageFiles.length + files.length;
    if (totalImages > 3) {
      setError(`Maximum 3 images allowed. You can only upload ${3 - imageFiles.length} more image(s).`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only image files are allowed.');
      setTimeout(() => setError(''), 3000);
    }
    
    // Validate file sizes (5MB max per file)
    const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Some files are too large. Maximum size is 5MB per file.');
      return;
    }
    
    // Combine with existing files
    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);
    
    // Create preview URLs for the new images
    const newImagePreviewData = validFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImagePreviewData]
    }));
  };

  const handleDeleteImage = (indexToDelete) => {
    // Remove from imageFiles
    const newImageFiles = imageFiles.filter((_, index) => index !== indexToDelete);
    setImageFiles(newImageFiles);
    
    // Revoke the URL to free up memory
    URL.revokeObjectURL(formData.images[indexToDelete].url);
    
    // Remove from formData.images
    const newImages = formData.images.filter((_, index) => index !== indexToDelete);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocode to get address
        reverseGeocode(latitude, longitude);
        
        setGettingLocation(false);
        setShowMap(true);
      },
      (error) => {
        setError('Unable to get your location. Please enter address manually.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          pickupAddress: data.display_name
        }));
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  // Initialize map with Leaflet
  useEffect(() => {
    if (showMap && location.lat && location.lng && !mapRef.current) {
      // Dynamically load Leaflet CSS and JS
      const loadLeaflet = async () => {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load JS
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize map
        const L = window.L;
        const mapContainer = document.getElementById('map');
        
        if (mapContainer && !mapRef.current) {
          const map = L.map('map').setView([location.lat, location.lng], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Add draggable marker
          const marker = L.marker([location.lat, location.lng], { draggable: true }).addTo(map);
          
          // Update location when marker is dragged
          marker.on('dragend', function(e) {
            const position = e.target.getLatLng();
            setLocation({ lat: position.lat, lng: position.lng });
            reverseGeocode(position.lat, position.lng);
          });

          // Allow clicking on map to move marker
          map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setLocation({ lat, lng });
            reverseGeocode(lat, lng);
          });

          mapRef.current = map;
          markerRef.current = marker;
        }
      };

      loadLeaflet().catch(err => {
        console.error('Error loading Leaflet:', err);
        setError('Failed to load map. Please enter address manually.');
      });
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap, location.lat, location.lng]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.deviceType || !formData.brand || !formData.model || 
          !formData.condition || !formData.pickupAddress) {
        throw new Error('Please fill in all required fields');
      }

      // Validate images are uploaded
      if (imageFiles.length === 0) {
        throw new Error('Please upload at least one device image');
      }

      let imageUrls = [];

      // Upload images to S3 if any
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const uploadFormData = new FormData();
        imageFiles.forEach(file => {
          uploadFormData.append('files', file);
        });

        try {
          const uploadResponse = await api.post('/files/upload/ewaste-images', uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data.success) {
            imageUrls = uploadResponse.data.imageUrls;
          }
        } catch (uploadErr) {
          throw new Error('Failed to upload images: ' + (uploadErr.response?.data?.message || uploadErr.message));
        } finally {
          setUploadingImages(false);
        }
      }

      // Combine date and time into datetime string
      const pickupDateTime = formData.pickupDate && formData.pickupTime 
        ? `${formData.pickupDate}T${formData.pickupTime}:00`
        : formData.pickupDate;

      // Submit form with S3 image URLs
      const requestData = {
        ...formData,
        pickupDate: pickupDateTime,
        images: imageUrls
      };
      delete requestData.pickupTime;

      await api.post('/user/pickup-requests', requestData);
      
      setSuccess('Pickup request submitted successfully! You will be notified once admin reviews your request.');
      
      // Reset form
      setFormData({
        deviceType: '',
        brand: '',
        model: '',
        condition: '',
        quantity: 1,
        pickupAddress: '',
        pickupDate: '',
        pickupTime: '',
        remarks: '',
        images: []
      });
      setImageFiles([]);

      // Redirect to my requests after 2 seconds
      setTimeout(() => {
        navigate('/my-requests');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-pickup-page">
      <Navbar />
      
      <div className="schedule-pickup-container">
        <div className="schedule-pickup-header">
          <h1>Schedule E-Waste Pickup</h1>
          <p>Fill in the details below to request a pickup for your electronic waste</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="pickup-form">
          {/* Device Details Section */}
          <div className="form-section">
            <h2>Device Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deviceType">Device Type <span className="required">*</span></label>
                <select
                  id="deviceType"
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select device type</option>
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition <span className="required">*</span></label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select condition</option>
                  {conditions.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand <span className="required">*</span></label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Samsung, Dell, HP"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model <span className="required">*</span></label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Galaxy S21, Inspiron 15"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pickup Details Section */}
          <div className="form-section">
            <h2>Pickup Details</h2>
            
            <div className="form-group">
              <label htmlFor="pickupAddress">Pickup Address <span className="required">*</span></label>
              
              <div className="address-actions">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-location"
                  disabled={gettingLocation}
                >
                  📍 {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="btn btn-map"
                >
                  🗺️ {showMap ? 'Hide Map' : 'Select on Map'}
                </button>
              </div>

              {showMap && (
                <div className="map-container">
                  <div id="map" style={{ height: '300px', width: '100%', borderRadius: '8px', marginBottom: '1rem' }}></div>
                  <p className="map-hint">
                    💡 Click on the map or drag the marker to select your pickup location
                  </p>
                  {location.lat && location.lng && (
                    <p className="coordinates">
                      Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              )}

              <textarea
                id="pickupAddress"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Enter your complete address including street, city, state, and PIN code"
                rows="4"
                required
              />
              <small className="form-help">You can type manually, use GPS, or select on the map</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupDate">Preferred Pickup Date <span className="required">*</span></label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="pickupTime">Preferred Pickup Time <span className="required">*</span></label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <small className="form-help">Select your preferred date and time for pickup</small>

            <div className="form-group">
              <label htmlFor="remarks">Additional Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Any additional information or special instructions"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="images">Device Images <span className="required">*</span> (Max 3)</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                required={imageFiles.length === 0}
                disabled={loading || uploadingImages || imageFiles.length >= 3}
              />
              <small className="form-help">
                Upload photos of the device (required, max 3 images, 5MB per image). {imageFiles.length > 0 && `${imageFiles.length}/3 uploaded`}
              </small>
              {uploadingImages && (
                <div className="upload-status">
                  <span>⏳ Uploading images...</span>
                </div>
              )}
              {formData.images.length > 0 && (
                <div className="image-preview">
                  <p><strong>Selected Images ({formData.images.length}/3):</strong></p>
                  <div className="image-preview-grid">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <div className="image-wrapper">
                          <img src={image.url} alt={image.name} />
                          <button
                            type="button"
                            className="delete-image-btn"
                            onClick={() => handleDeleteImage(index)}
                            title="Delete image"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="image-name">{image.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulePickup;
