import React, { useState, useEffect } from 'react';
import ServiceList from './ServiceList';
import BookingForm from './BookingForm';
import UserAppointments from './UserAppointments';
import './UserDashboard.css';

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [currentTab, setCurrentTab] = useState('services');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const renderContent = () => {
    if (selectedService) {
      return (
        <BookingForm 
          service={selectedService} 
          onBack={() => setSelectedService(null)}
        />
      );
    }

    switch (currentTab) {
      case 'services':
        return (
          <ServiceList 
            services={services} 
            onBookService={setSelectedService}
          />
        );
      case 'appointments':
        return <UserAppointments />;
      default:
        return (
          <ServiceList 
            services={services} 
            onBookService={setSelectedService}
          />
        );
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>User Dashboard</h2>
        {!selectedService && (
          <div className="tab-navigation">
            <button 
              className={currentTab === 'services' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setCurrentTab('services')}
            >
              🔧 Browse Services
            </button>
            <button 
              className={currentTab === 'appointments' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setCurrentTab('appointments')}
            >
              📅 My Appointments
            </button>
          </div>
        )}
      </div>
      
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;