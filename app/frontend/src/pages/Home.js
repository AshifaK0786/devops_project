import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to Appointment Scheduler</h1>
        <p>Book appointments with service providers easily</p>
        <div className="cta-buttons">
          <Link to="/signup" className="cta-button primary">Get Started</Link>
          <Link to="/login" className="cta-button secondary">Login</Link>
        </div>
      </div>
      
      <div className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>For Users</h3>
            <p>Browse services and book appointments with providers</p>
          </div>
          <div className="feature-card">
            <h3>For Service Providers</h3>
            <p>List your services and manage appointments</p>
          </div>
          <div className="feature-card">
            <h3>For Admins</h3>
            <p>Monitor all services and appointments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;