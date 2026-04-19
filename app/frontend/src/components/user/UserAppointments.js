import React, { useState, useEffect } from 'react';
import RescheduleForm from './RescheduleForm';
import './UserAppointments.css';

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      // Handle new response format
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        // Fallback for legacy response format
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId, reason = '') => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Appointment cancelled successfully!');
        fetchMyAppointments();
      } else {
        alert(data.message || 'Error cancelling appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment');
    }
  };

  const handleRescheduleAppointment = async (appointmentId, rescheduleData) => {
    try {
      let response;
      
      // Check if it's slot-based or legacy reschedule
      if (rescheduleData.rescheduleType === 'slot') {
        // Use new slot-based reschedule endpoint
        response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/reschedule-slot`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            newTimeSlot: rescheduleData.newTimeSlot,
            notes: rescheduleData.notes
          })
        });
      } else {
        // Use legacy reschedule endpoint
        response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/reschedule`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            date: rescheduleData.date,
            time: rescheduleData.time,
            notes: rescheduleData.notes
          })
        });
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Appointment rescheduled successfully!');
        setShowRescheduleForm(false);
        setRescheduleAppointment(null);
        fetchMyAppointments();
      } else {
        alert(data.message || 'Error rescheduling appointment');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Error rescheduling appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'completed': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🏆';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const canReschedule = (appointment) => {
    return appointment.status === 'pending';
  };

  const canCancel = (appointment) => {
    return appointment.status === 'pending' || appointment.status === 'confirmed';
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === 'all') return true;
    return appointment.status === filterStatus;
  });

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    // Get appointment date for comparison
    const getAppointmentDate = (appointment) => {
      if (appointment.timeSlot && appointment.timeSlot.date) {
        return new Date(appointment.timeSlot.date);
      }
      return appointment.date ? new Date(appointment.date) : new Date(0);
    };
    
    return getAppointmentDate(b) - getAppointmentDate(a);
  });

  if (showRescheduleForm && rescheduleAppointment) {
    return (
      <RescheduleForm
        appointment={rescheduleAppointment}
        onSubmit={(data) => handleRescheduleAppointment(rescheduleAppointment._id, data)}
        onCancel={() => {
          setShowRescheduleForm(false);
          setRescheduleAppointment(null);
        }}
      />
    );
  }

  return (
    <div className="user-appointments-container">
      <div className="appointments-header">
        <h2>📅 My Appointments</h2>
        <div className="filter-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your appointments...</p>
        </div>
      ) : sortedAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Appointments Found</h3>
          <p>
            {filterStatus === 'all' 
              ? "You haven't booked any appointments yet."
              : `No ${filterStatus} appointments found.`
            }
          </p>
        </div>
      ) : (
        <div className="appointments-list">
          {sortedAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="service-info">
                  <h3>{appointment.service?.name}</h3>
                  <p className="service-provider">
                    Provider: {appointment.service?.provider?.name || 'Service Provider'}
                  </p>
                </div>
                <div className="status-badge">
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {getStatusIcon(appointment.status)} {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="appointment-details">
                {/* Date and Time Display - handle both slot-based and legacy */}
                <div className="detail-row">
                  <span className="detail-label">📅 Date:</span>
                  <span className="detail-value">
                    {appointment.timeSlot ? 
                      new Date(appointment.timeSlot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) :
                      new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    }
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">🕒 Time:</span>
                  <span className="detail-value">
                    {appointment.timeSlot ? 
                      `${new Date(`2000-01-01T${appointment.timeSlot.startTime}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - ${new Date(`2000-01-01T${appointment.timeSlot.endTime}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}` :
                      appointment.time
                    }
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">💰 Price:</span>
                  <span className="detail-value">
                    ${appointment.timeSlot && appointment.timeSlot.customPrice ? 
                      appointment.timeSlot.customPrice : 
                      appointment.service?.price}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span className="detail-value">{appointment.service?.duration} minutes</span>
                </div>

                {/* Show booking type */}
                <div className="detail-row">
                  <span className="detail-label">🎫 Type:</span>
                  <span className="detail-value booking-type">
                    {appointment.timeSlot ? 
                      <span className="slot-based">🕐 Slot Booking</span> : 
                      <span className="legacy">📅 Standard Booking</span>
                    }
                  </span>
                </div>

                {appointment.timeSlot && appointment.timeSlot.notes && (
                  <div className="detail-row notes-row">
                    <span className="detail-label">🏷️ Slot Notes:</span>
                    <span className="detail-value slot-notes">{appointment.timeSlot.notes}</span>
                  </div>
                )}

                {appointment.notes && (
                  <div className="detail-row notes-row">
                    <span className="detail-label">📝 Your Notes:</span>
                    <span className="detail-value">{appointment.notes}</span>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                {canReschedule(appointment) && (
                  <button
                    onClick={() => {
                      setRescheduleAppointment(appointment);
                      setShowRescheduleForm(true);
                    }}
                    className="reschedule-btn"
                  >
                    📅 Reschedule
                  </button>
                )}

                {canCancel(appointment) && (
                  <button
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="cancel-btn"
                  >
                    ❌ Cancel
                  </button>
                )}

                {appointment.status === 'completed' && (
                  <div className="completed-badge">
                    🏆 Completed
                  </div>
                )}

                {appointment.status === 'cancelled' && (
                  <div className="cancelled-badge">
                    ❌ Cancelled
                  </div>
                )}
              </div>

              <div className="appointment-footer">
                <small>
                  Booked on: {new Date(appointment.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAppointments;