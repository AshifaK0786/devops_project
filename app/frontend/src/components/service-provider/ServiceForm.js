import React, { useState } from 'react';

const ServiceForm = ({ onServiceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Service added successfully!');
        setFormData({ name: '', description: '', price: '', duration: '' });
        onServiceAdded();
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="service-form">
      <h3>Add New Service</h3>
      <div className="form-group">
        <label>Service Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Price ($):</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Duration (minutes):</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Add Service</button>
    </form>
  );
};

export default ServiceForm;