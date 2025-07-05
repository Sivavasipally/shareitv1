import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import apiService from './services/api';

// Import pages
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BoardGames from './pages/BoardGames';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AddBook from './pages/AddBook';
import AddBoardGame from './pages/AddBoardGame';
import ApproveRequests from './pages/ApproveRequests';
import Activity from './pages/Activity';
import Admin from './pages/Admin';

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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/board-games" element={<BoardGames />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/add-board-game" element={<AddBoardGame />} />
              <Route path="/approve-requests" element={<ApproveRequests />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </Router>
    </UserProvider>
  );
}

export default App;