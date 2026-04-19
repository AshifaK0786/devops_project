import React, { useState, useEffect, useCallback } from 'react';
import './SlotManager.css';

const SlotManager = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    duration: 60,
    breakBetweenSlots: 15,
    maxBookings: 1
  });

  // Manual slot form state
  const [manualSlot, setManualSlot] = useState({
    startTime: '',
    endTime: '',
    maxBookings: 1,
    customPrice: '',
    notes: ''
  });

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services/my-services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchSlots = useCallback(async () => {
    if (!selectedService || !selectedDate) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/slots/my-slots?serviceId=${selectedService}&startDate=${selectedDate}&endDate=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedService, selectedDate]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate) {
      alert('Please select service and date first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/slots/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId: selectedService,
          date: selectedDate,
          ...generateForm
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Generated ${data.slots.length} time slots successfully!`);
        setShowGenerateForm(false);
        fetchSlots();
      } else {
        alert(data.message || 'Error generating slots');
      }
    } catch (error) {
      console.error('Error generating slots:', error);
      alert('Error generating slots');
    }
  };

  const handleCreateManualSlot = async (e) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate) {
      alert('Please select service and date first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/slots/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId: selectedService,
          date: selectedDate,
          timeSlots: [manualSlot]
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Time slot created successfully!');
        setShowManualForm(false);
        setManualSlot({
          startTime: '',
          endTime: '',
          maxBookings: 1,
          customPrice: '',
          notes: ''
        });
        fetchSlots();
      } else {
        alert(data.message || 'Error creating slot');
      }
    } catch (error) {
      console.error('Error creating slot:', error);
      alert('Error creating slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Time slot deleted successfully!');
        fetchSlots();
      } else {
        alert(data.message || 'Error deleting slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting slot');
    }
  };

  const toggleSlotStatus = async (slotId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`http://localhost:5000/api/slots/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchSlots();
      } else {
        alert(data.message || 'Error updating slot status');
      }
    } catch (error) {
      console.error('Error updating slot status:', error);
      alert('Error updating slot status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'blocked': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '⏸️';
      case 'blocked': return '🚫';
      default: return '❓';
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="slot-manager-container">
      <div className="slot-manager-header">
        <h2>🕐 Time Slot Manager</h2>
        <p>Create and manage time slots for your services</p>
      </div>

      {/* Service and Date Selection */}
      <div className="selection-panel">
        <div className="selection-row">
          <div className="selection-group">
            <label htmlFor="service-select">Service:</label>
            <select
              id="service-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="service-select"
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} - ${service.price} ({service.duration}min)
                </option>
              ))}
            </select>
          </div>

          <div className="selection-group">
            <label htmlFor="date-select">Date:</label>
            <input
              type="date"
              id="date-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="date-select"
            />
          </div>
        </div>

        {selectedService && selectedDate && (
          <div className="action-buttons">
            <button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="generate-btn"
            >
              🤖 Auto Generate Slots
            </button>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="manual-btn"
            >
              ➕ Add Manual Slot
            </button>
          </div>
        )}
      </div>

      {/* Auto Generate Form */}
      {showGenerateForm && (
        <div className="generate-form-container">
          <div className="form-header">
            <h3>🤖 Auto Generate Time Slots</h3>
            <button onClick={() => setShowGenerateForm(false)} className="close-btn">×</button>
          </div>
          
          <form onSubmit={handleGenerateSlots} className="generate-form">
            <div className="form-row">
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={generateForm.startTime}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={generateForm.endTime}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes):</label>
                <input
                  type="number"
                  value={generateForm.duration}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="480"
                  step="15"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Break Between Slots (minutes):</label>
                <input
                  type="number"
                  value={generateForm.breakBetweenSlots}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, breakBetweenSlots: parseInt(e.target.value) }))}
                  min="0"
                  max="60"
                  step="5"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Max Bookings per Slot:</label>
              <input
                type="number"
                value={generateForm.maxBookings}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, maxBookings: parseInt(e.target.value) }))}
                min="1"
                max="10"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setShowGenerateForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="generate-submit-btn">
                Generate Slots
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Slot Form */}
      {showManualForm && (
        <div className="manual-form-container">
          <div className="form-header">
            <h3>➕ Add Manual Time Slot</h3>
            <button onClick={() => setShowManualForm(false)} className="close-btn">×</button>
          </div>
          
          <form onSubmit={handleCreateManualSlot} className="manual-form">
            <div className="form-row">
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={manualSlot.startTime}
                  onChange={(e) => setManualSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={manualSlot.endTime}
                  onChange={(e) => setManualSlot(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Max Bookings:</label>
                <input
                  type="number"
                  value={manualSlot.maxBookings}
                  onChange={(e) => setManualSlot(prev => ({ ...prev, maxBookings: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Custom Price ($):</label>
                <input
                  type="number"
                  value={manualSlot.customPrice}
                  onChange={(e) => setManualSlot(prev => ({ ...prev, customPrice: e.target.value }))}
                  min="0"
                  step="0.01"
                  placeholder="Leave empty for service default"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={manualSlot.notes}
                onChange={(e) => setManualSlot(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes for this slot"
                rows="2"
                maxLength="200"
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setShowManualForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="create-submit-btn">
                Create Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots Display */}
      {selectedService && selectedDate && (
        <div className="slots-display">
          <div className="slots-header">
            <h3>📅 Time Slots for {selectedDate}</h3>
            {loading && <div className="loading-spinner"></div>}
          </div>

          {!loading && slots.length === 0 ? (
            <div className="empty-slots">
              <div className="empty-icon">🕐</div>
              <h4>No Time Slots Created</h4>
              <p>Create your first time slot using the buttons above</p>
            </div>
          ) : (
            <div className="slots-grid">
              {slots.map(slot => (
                <div key={slot._id} className="slot-card">
                  <div className="slot-header">
                    <div className="slot-time">
                      🕐 {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="slot-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(slot.status) }}
                      >
                        {getStatusIcon(slot.status)} {slot.status}
                      </span>
                    </div>
                  </div>

                  <div className="slot-details">
                    <div className="detail-item">
                      <span className="label">Bookings:</span>
                      <span className="value">{slot.currentBookings}/{slot.maxBookings}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="label">Available:</span>
                      <span className={`value ${slot.isAvailable ? 'available' : 'unavailable'}`}>
                        {slot.isAvailable ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    
                    {slot.customPrice && (
                      <div className="detail-item">
                        <span className="label">Price:</span>
                        <span className="value">${slot.customPrice}</span>
                      </div>
                    )}
                    
                    {slot.notes && (
                      <div className="detail-item notes-item">
                        <span className="label">Notes:</span>
                        <span className="value">{slot.notes}</span>
                      </div>
                    )}

                    {slot.currentBooking && (
                      <div className="booking-info">
                        <span className="booking-label">Current Booking:</span>
                        <span className="booking-details">
                          User: {slot.currentBooking.user?.name} | Status: {slot.currentBooking.status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="slot-actions">
                    <button
                      onClick={() => toggleSlotStatus(slot._id, slot.status)}
                      className={`status-btn ${slot.status === 'active' ? 'deactivate' : 'activate'}`}
                      disabled={slot.currentBookings > 0}
                    >
                      {slot.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="delete-btn"
                      disabled={slot.currentBookings > 0}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {slot.currentBookings > 0 && (
                    <div className="slot-warning">
                      ⚠️ Cannot modify - has active bookings
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotManager;