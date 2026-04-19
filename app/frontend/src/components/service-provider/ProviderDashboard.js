import React, { useState } from 'react';
import ServiceForm from './ServiceForm';
import MyAppointments from './MyAppointments';
import WorkersList from './WorkersList';
import SlotManager from './SlotManager';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const [currentTab, setCurrentTab] = useState('appointments');

  const renderContent = () => {
    switch (currentTab) {
      case 'services':
        return <ServiceManagement />;
      case 'appointments':
        return <MyAppointments />;
      case 'workers':
        return <WorkersList />;
      case 'slots':
        return <SlotManager />;
      default:
        return <MyAppointments />;
    }
  };

  // Service Management Component
  const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);

    React.useEffect(() => {
      fetchMyServices();
    }, []);

    const fetchMyServices = async () => {
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

    return (
      <div className="service-management">
        <div className="section-header">
          <h3>🔧 My Services</h3>
          <button 
            onClick={() => setShowServiceForm(!showServiceForm)}
            className="add-service-btn"
          >
            {showServiceForm ? '❌ Cancel' : '➕ Add New Service'}
          </button>
        </div>
        
        {showServiceForm && (
          <div className="service-form-container">
            <ServiceForm onServiceAdded={() => {
              fetchMyServices();
              setShowServiceForm(false);
            }} />
          </div>
        )}
        
        <div className="services-grid">
          {services.length === 0 ? (
            <div className="empty-services">
              <div className="empty-icon">🔧</div>
              <h4>No Services Yet</h4>
              <p>Start by adding your first service</p>
              <button 
                onClick={() => setShowServiceForm(true)}
                className="add-first-service-btn"
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            services.map(service => (
              <div key={service._id} className="service-card">
                <div className="service-header">
                  <h4>{service.name}</h4>
                  <span className="service-price">${service.price}</span>
                </div>
                <p className="service-description">{service.description}</p>
                <div className="service-details">
                  <span className="service-duration">
                    ⏱️ {service.duration} minutes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h2>Service Provider Dashboard</h2>
        <div className="tab-navigation">
          <button 
            className={currentTab === 'appointments' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setCurrentTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={currentTab === 'services' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setCurrentTab('services')}
          >
            🔧 Services
          </button>
          <button 
            className={currentTab === 'slots' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setCurrentTab('slots')}
          >
            🕐 Time Slots
          </button>
          <button 
            className={currentTab === 'workers' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setCurrentTab('workers')}
          >
            👥 Workers
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProviderDashboard;