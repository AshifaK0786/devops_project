import React, { useState, useEffect } from 'react';
import ServicesList from './ServicesList';
import AppointmentsList from './AppointmentsList';

const AdminDashboard = () => {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [servicesRes, appointmentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/services', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:5000/api/admin/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      setServices(await servicesRes.json());
      setAppointments(await appointmentsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <ServicesList services={services} />
      <AppointmentsList appointments={appointments} />
    </div>
  );
};

export default AdminDashboard;