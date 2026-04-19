import React from 'react';

const ServicesList = ({ services }) => {
  return (
    <div className="admin-services">
      <h3>All Services</h3>
      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service._id}>
                <td>{service.name}</td>
                <td>{service.description}</td>
                <td>${service.price}</td>
                <td>{service.duration} min</td>
                <td>{service.provider?.name}</td>
                <td>{service.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesList;