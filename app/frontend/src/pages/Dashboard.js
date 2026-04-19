import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserDashboard from '../components/user/UserDashboard';
import ProviderDashboard from '../components/service-provider/ProviderDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'provider':
        return <ProviderDashboard />;
      case 'user':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="dashboard">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;