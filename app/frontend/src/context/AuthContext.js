import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Handle both old and new response formats
        const userData = data.user || {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        };
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};