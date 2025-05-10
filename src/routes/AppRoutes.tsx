import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Dashboard from '../pages/Dashboard';
import Books from '../pages/Books';
import BoardGames from '../pages/BoardGames';
import AddBook from '../pages/AddBook';
import AddBoardGame from '../pages/AddBoardGame';
import ApproveRequests from '../pages/ApproveRequests';
import Notifications from '../pages/Notifications';
import MobileMenu from '../pages/MobileMenu';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import Profile from '../pages/Profile';
import Activity from '../pages/Activity';

const AppRoutes: React.FC = () => {
  // TODO: Implement actual auth check
  const isAuthenticated = true;

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/" />} />

      {/* Protected Routes */}
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/books" element={isAuthenticated ? <Books /> : <Navigate to="/login" />} />
      <Route path="/board-games" element={isAuthenticated ? <BoardGames /> : <Navigate to="/login" />} />
      <Route path="/add-book" element={isAuthenticated ? <AddBook /> : <Navigate to="/login" />} />
      <Route path="/add-board-game" element={isAuthenticated ? <AddBoardGame /> : <Navigate to="/login" />} />
      <Route path="/approve-requests" element={isAuthenticated ? <ApproveRequests /> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
      <Route path="/menu" element={isAuthenticated ? <MobileMenu /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/activity" element={isAuthenticated ? <Activity /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;