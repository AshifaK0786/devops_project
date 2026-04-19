import React, { useState, useEffect } from 'react';
import './RescheduleForm.css';

const RescheduleForm = ({ appointment, onSubmit, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if appointment uses slot-based system
  const isSlotBased = appointment.timeSlot && appointment.timeSlot._id;

  useEffect(() => {
    if (selectedDate && appointment.service?._id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, appointment.service?._id]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await fetch(`http://localhost:5000/api/slots/available/${appointment.service._id}/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Filter out the current slot if it's for the same date
        const filteredSlots = data.slots.filter(slot => {
          if (isSlotBased && appointment.timeSlot) {
            return slot._id !== appointment.timeSlot._id;
          }
          return true;
        });
        setAvailableSlots(filteredSlots);
      } else {
        console.error('Error fetching slots:', data.message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotBasedSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setErrors({ slot: 'Please select a new time slot' });
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit({
        rescheduleType: 'slot',
        newTimeSlot: selectedSlot,
        notes: notes
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setErrors({ submit: 'Error rescheduling appointment' });
    } finally {
      setLoading(false);
    }
  };

  const handleLegacySubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newDate = formData.get('date');
    const newTime = formData.get('time');
    const newNotes = formData.get('notes');

    // Validation
    const newErrors = {};
    if (!newDate) newErrors.date = 'Date is required';
    if (!newTime) newErrors.time = 'Time is required';

    // Date validation - cannot be in the past
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.date = 'Cannot schedule appointment in the past';
    }

    // Check if it's the same date and time
    const originalDate = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '';
    if (newDate === originalDate && newTime === appointment.time) {
      newErrors.date = 'Please select a different date or time';
      newErrors.time = 'Please select a different date or time';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit({
        rescheduleType: 'legacy',
        date: newDate,
        time: newTime,
        notes: newNotes
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setErrors({ submit: 'Error rescheduling appointment' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const today = new Date().toISOString().split('T')[0];

  if (isSlotBased) {
    return (
      <div className="reschedule-form-container">
        <div className="reschedule-form-header">
          <h3>🔄 Reschedule Appointment</h3>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <div className="current-appointment-info">
          <h4>Current Appointment:</h4>
          <div className="current-slot-info">
            <div className="service-name">{appointment.service?.name}</div>
            <div className="slot-details">
              <span className="date">{formatDate(appointment.timeSlot.date)}</span>
              <span className="time">
                {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSlotBasedSubmit} className="slot-reschedule-form">
          <div className="form-group">
            <label htmlFor="date-select">Select New Date:</label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot('');
                setErrors({});
              }}
              min={today}
              className="date-input"
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Available Time Slots:</label>
              
              {loadingSlots ? (
                <div className="slots-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="no-slots">
                  <div className="no-slots-icon">🕐</div>
                  <h4>No Available Slots</h4>
                  <p>No alternative time slots are available for this date.</p>
                </div>
              ) : (
                <div className="slots-grid">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className={`slot-option ${selectedSlot === slot._id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedSlot(slot._id);
                        setErrors({});
                      }}
                    >
                      <div className="slot-time">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      <div className="slot-info">
                        {slot.customPrice && (
                          <span className="custom-price">${slot.customPrice}</span>
                        )}
                        <span className="availability">
                          {slot.availableBookings} spot{slot.availableBookings !== 1 ? 's' : ''} left
                        </span>
                      </div>
                      {slot.notes && (
                        <div className="slot-notes">{slot.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {errors.slot && <span className="error-message">{errors.slot}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Additional Notes:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="reschedule-notice">
            <div className="notice-content">
              <span className="notice-icon">ℹ️</span>
              <div className="notice-text">
                <strong>Slot Swap:</strong> Your current slot will be released and the new slot will be reserved for you.
              </div>
            </div>
          </div>

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
              disabled={loading || !selectedSlot}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Rescheduling...
                </>
              ) : (
                'Swap to New Slot'
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
        </form>

        <style jsx>{`
          .reschedule-form-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.15);
            max-width: 700px;
            margin: 20px auto;
            overflow: hidden;
          }

          .reschedule-form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
          }

          .reschedule-form-header h3 {
            margin: 0;
            font-size: 1.4em;
          }

          .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.3s ease;
          }

          .close-btn:hover {
            background: rgba(255,255,255,0.2);
          }

          .current-appointment-info {
            padding: 25px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
          }

          .current-appointment-info h4 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 1.1em;
          }

          .current-slot-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .service-name {
            font-weight: 600;
            color: #495057;
            font-size: 1.1em;
          }

          .slot-details {
            display: flex;
            gap: 15px;
            align-items: center;
          }

          .date {
            color: #007bff;
            font-weight: 500;
          }

          .time {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9em;
          }

          .slot-reschedule-form {
            padding: 30px;
          }

          .form-group {
            margin-bottom: 25px;
          }

          .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #495057;
          }

          .date-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1em;
            transition: all 0.3s ease;
          }

          .date-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .slots-loading {
            text-align: center;
            padding: 40px 20px;
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          }

          .no-slots {
            text-align: center;
            padding: 40px 20px;
            color: #6c757d;
          }

          .no-slots-icon {
            font-size: 3em;
            margin-bottom: 15px;
          }

          .no-slots h4 {
            margin: 0 0 10px 0;
            color: #495057;
          }

          .slots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 10px;
          }

          .slot-option {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }

          .slot-option:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }

          .slot-option.selected {
            border-color: #28a745;
            background: #e8f5e8;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
          }

          .slot-option.selected::after {
            content: '✓';
            position: absolute;
            top: 10px;
            right: 15px;
            background: #28a745;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          }

          .slot-time {
            font-size: 1.1em;
            font-weight: 700;
            color: #495057;
            margin-bottom: 8px;
          }

          .slot-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
          }

          .custom-price {
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 3px 6px;
            border-radius: 10px;
            font-size: 0.8em;
            font-weight: 600;
          }

          .availability {
            color: #28a745;
            font-weight: 600;
            font-size: 0.85em;
          }

          .slot-notes {
            color: #6c757d;
            font-size: 0.9em;
            font-style: italic;
            margin-top: 5px;
          }

          textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1em;
            resize: vertical;
            min-height: 80px;
            transition: all 0.3s ease;
          }

          textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .reschedule-notice {
            background: #e8f4fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
          }

          .notice-content {
            display: flex;
            align-items: flex-start;
            gap: 10px;
          }

          .notice-icon {
            font-size: 1.2em;
            margin-top: 2px;
          }

          .notice-text {
            flex: 1;
            font-size: 0.9em;
            line-height: 1.5;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
          }

          .cancel-btn,
          .submit-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .cancel-btn {
            background: #6c757d;
            color: white;
          }

          .submit-btn {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
          }

          .cancel-btn:hover,
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }

          .submit-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .button-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .error-message {
            color: #dc3545;
            font-size: 0.9em;
            margin-top: 5px;
            display: block;
          }

          .submit-error {
            text-align: center;
            margin-top: 15px;
            padding: 10px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .reschedule-form-container {
              margin: 10px;
            }
            
            .slots-grid {
              grid-template-columns: 1fr;
            }
            
            .form-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    );
  }

  // Legacy form for appointments that don't use slots
  return (
    <div className="reschedule-form-container">
      <div className="reschedule-form-header">
        <h3>📅 Reschedule Appointment</h3>
        <button onClick={onCancel} className="close-btn">×</button>
      </div>

      <div className="current-appointment-info">
        <h4>Current Appointment Details:</h4>
        <div className="current-info-grid">
          <div className="info-item">
            <span className="info-label">Service:</span>
            <span className="info-value">{appointment.service?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Date:</span>
            <span className="info-value">
              {appointment.date ? formatDate(appointment.date) : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Time:</span>
            <span className="info-value">{appointment.time || 'N/A'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleLegacySubmit} className="reschedule-form">
        <div className="form-section">
          <h4>📝 New Appointment Details</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">New Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                defaultValue={appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : ''}
                className={errors.date ? 'error' : ''}
                min={today}
                required
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="time">New Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                defaultValue={appointment.time || ''}
                className={errors.time ? 'error' : ''}
                required
              />
              {errors.time && <span className="error-message">{errors.time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={appointment.notes || ''}
              placeholder="Any additional information or special requests..."
              rows="3"
              maxLength="500"
            />
          </div>
        </div>

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
            {loading ? 'Rescheduling...' : 'Reschedule Appointment'}
          </button>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}
      </form>
    </div>
  );
};

export default RescheduleForm;