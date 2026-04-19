import React from 'react';

const ServiceList = ({ services, onBookService }) => {
  return (
    <div className="service-list">
      <h3>Available Services</h3>
      <div className="services-grid">
        {services.map(service => (
          <div key={service._id} className="service-card">
            <h4>{service.name}</h4>
            <p>{service.description}</p>
            <p>Price: ${service.price}</p>
            <p>Duration: {service.duration} minutes</p>
            <p>Provider: {service.provider?.name}</p>
            <button onClick={() => onBookService(service)}>
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;