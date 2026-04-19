import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Link to="/">Appointment Scheduler</Link>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;