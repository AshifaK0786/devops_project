import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      // Redirect based on user role
      const userRole = result.user.role;
      switch (userRole) {
        case 'admin':
          navigate('/dashboard'); // Admin dashboard
          break;
        case 'provider':
          navigate('/dashboard'); // Service provider dashboard
          break;
        case 'user':
        default:
          navigate('/dashboard'); // User dashboard
          break;
      }
    } else {
      alert(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;