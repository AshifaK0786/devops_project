import React from 'react';

const AppointmentsList = ({ appointments }) => {
  return (
    <div className="admin-appointments">
      <h3>All Appointments</h3>
      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment._id}>
                <td>{appointment.user?.name}</td>
                <td>{appointment.service?.name}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
                <td>{appointment.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsList;