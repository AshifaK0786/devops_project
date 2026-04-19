import React, { useState, useEffect } from 'react';

const BookingForm = ({ service, onBack }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedDate && service._id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, service._id]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await fetch(`http://localhost:5000/api/slots/available/${service._id}/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.slots);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          service: service._id,
          timeSlot: selectedSlot,
          notes
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Appointment booked successfully!');
        onBack();
      } else {
        alert(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment');
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-form">
      <button onClick={onBack} className="back-btn">← Back to Services</button>
      
      <div className="booking-header">
        <h3>📅 Book Appointment</h3>
        <div className="service-info">
          <h4>{service.name}</h4>
          <div className="service-details">
            <span className="price">${service.price}</span>
            <span className="duration">⏱️ {service.duration} minutes</span>
          </div>
          {service.description && (
            <p className="service-description">{service.description}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="slot-booking-form">
        <div className="form-group">
          <label htmlFor="date-select">Select Date:</label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(''); // Reset selected slot when date changes
            }}
            min={today}
            required
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
                <p>No time slots are available for this date. Please select a different date.</p>
              </div>
            ) : (
              <div className="slots-grid">
                {availableSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`slot-option ${selectedSlot === slot._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot._id)}
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
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Any special requests or notes..."
            className="notes-textarea"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={!selectedSlot || loading}
            className="book-btn"
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Booking...
              </>
            ) : (
              <>
                📅 Book Appointment
                {selectedSlot && availableSlots.find(slot => slot._id === selectedSlot)?.customPrice && (
                  <span className="final-price">
                    - ${availableSlots.find(slot => slot._id === selectedSlot)?.customPrice || service.price}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .booking-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .back-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .booking-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }

        .booking-header h3 {
          margin: 0 0 20px 0;
          color: #495057;
          font-size: 1.8em;
        }

        .service-info h4 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 1.4em;
        }

        .service-details {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 10px;
        }

        .price {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
        }

        .duration {
          background: #f8f9fa;
          color: #495057;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
        }

        .service-description {
          color: #6c757d;
          margin: 15px 0 0 0;
          font-style: italic;
        }

        .slot-booking-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #495057;
          font-size: 1.1em;
        }

        .date-input {
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

        .no-slots p {
          margin: 0;
        }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
          font-size: 1.2em;
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
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: 600;
        }

        .availability {
          color: #28a745;
          font-weight: 600;
          font-size: 0.9em;
        }

        .slot-notes {
          color: #6c757d;
          font-size: 0.9em;
          font-style: italic;
          margin-top: 5px;
        }

        .notes-textarea {
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1em;
          resize: vertical;
          min-height: 80px;
          transition: all 0.3s ease;
        }

        .notes-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-actions {
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .book-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 1.2em;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .book-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .book-btn:disabled {
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

        .final-price {
          margin-left: 10px;
          font-weight: 700;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .booking-form {
            padding: 15px;
            margin: 10px;
          }
          
          .slots-grid {
            grid-template-columns: 1fr;
          }
          
          .service-details {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingForm;