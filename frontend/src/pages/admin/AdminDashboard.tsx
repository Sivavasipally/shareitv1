// frontend/src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const AdminDashboard: React.FC = () => {
  const { user } = useUser();

  // Redirect non-admin users
  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Admin features - Coming soon!</p>
        </div>
      } />
      <Route path="/users" element={<div>User Management</div>} />
      <Route path="/activity" element={<div>Activity Log</div>} />
    </Routes>
  );
};

export default AdminDashboard;