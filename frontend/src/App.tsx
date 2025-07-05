import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import Auth from './pages/Auth';
import apiService from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <Router>
        {isAuthenticated ? (
          <Layout>
            <AppRoutes />
          </Layout>
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </Router>
    </UserProvider>
  );
}

export default App;