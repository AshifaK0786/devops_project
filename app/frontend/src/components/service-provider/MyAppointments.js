import React, { useState, useEffect } from 'react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
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
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchMyAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <div className="my-appointments">
      <h3>My Appointments</h3>
      <div className="appointments-list">
        {appointments.length === 0 ? (
          <div className="empty-appointments">
            <p>No appointments found.</p>
          </div>
        ) : (
          appointments.map(appointment => (
            <div key={appointment._id} className="appointment-item">
              <div className="appointment-info">
                <h4>{appointment.service?.name}</h4>
                <p>Client: {appointment.user?.name}</p>
                
                {/* Handle both slot-based and legacy appointments */}
                <p>Date: {appointment.timeSlot ? 
                  new Date(appointment.timeSlot.date).toLocaleDateString() :
                  new Date(appointment.date).toLocaleDateString()
                }</p>
                
                <p>Time: {appointment.timeSlot ? 
                  `${new Date(`2000-01-01T${appointment.timeSlot.startTime}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - ${new Date(`2000-01-01T${appointment.timeSlot.endTime}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}` :
                  appointment.time
                }</p>
                
                <p>Status: <span className={`status-${appointment.status}`}>{appointment.status}</span></p>
                
                {appointment.timeSlot && appointment.timeSlot.notes && (
                  <p>Slot Notes: {appointment.timeSlot.notes}</p>
                )}
                
                {appointment.notes && <p>Notes: {appointment.notes}</p>}
              </div>
            <div className="appointment-actions">
              {appointment.status === 'pending' && (
                <>
                  <button 
                    onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                    className="confirm-btn"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <button 
                  onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                  className="complete-btn"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointments;