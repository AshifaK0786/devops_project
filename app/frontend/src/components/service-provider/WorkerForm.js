import React, { useState, useEffect } from 'react';
import './WorkerForm.css';

const WorkerForm = ({ worker = null, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    dateOfBirth: '',
    address: '',
    hourlyRate: '',
    availability: 'Full-time',
    status: 'Active',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (isEditing && worker) {
      setFormData({
        name: worker.name || '',
        email: worker.email || '',
        phone: worker.phone || '',
        specialization: worker.specialization || '',
        experience: worker.experience || '',
        dateOfBirth: worker.dateOfBirth ? worker.dateOfBirth.split('T')[0] : '',
        address: worker.address || '',
        hourlyRate: worker.hourlyRate || '',
        availability: worker.availability || 'Full-time',
        status: worker.status || 'Active',
        notes: worker.notes || ''
      });
    }
  }, [isEditing, worker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.experience) newErrors.experience = 'Experience is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (basic)
    const phoneRegex = /^[a-zA-Z\s-()]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Experience validation
    const experience = parseInt(formData.experience);
    if (formData.experience && (isNaN(experience) || experience < 0 || experience > 50)) {
      newErrors.experience = 'Experience must be between 0 and 50 years';
    }

    // Hourly rate validation
    if (formData.hourlyRate) {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        newErrors.hourlyRate = 'Hourly rate must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Convert experience to number
      const submitData = {
        ...formData,
        experience: parseInt(formData.experience),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined
      };

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-form-container">
      <div className="worker-form-header">
        <h3>{isEditing ? 'Edit Worker' : 'Add New Worker'}</h3>
        <button onClick={onCancel} className="close-btn">×</button>
      </div>

      <form onSubmit={handleSubmit} className="worker-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h4>📝 Basic Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="2"
            />
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="form-section">
          <h4>💼 Professional Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialization">Specialization *</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className={errors.specialization ? 'error' : ''}
                placeholder="e.g., Hair Styling, Massage Therapy"
              />
              {errors.specialization && <span className="error-message">{errors.specialization}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience (Years) *</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className={errors.experience ? 'error' : ''}
                placeholder="Years of experience"
                min="0"
                max="50"
              />
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hourlyRate">Hourly Rate ($)</label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className={errors.hourlyRate ? 'error' : ''}
                placeholder="Enter hourly rate"
                min="0"
                step="0.01"
              />
              {errors.hourlyRate && <span className="error-message">{errors.hourlyRate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="availability">Availability *</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Additional Notes Section */}
        <div className="form-section">
          <h4>📝 Additional Notes</h4>
          
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about the worker..."
              rows="3"
              maxLength="500"
            />
            <small className="char-count">{formData.notes.length}/500</small>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Worker' : 'Add Worker')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerForm;