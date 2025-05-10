import React from 'react';
import { useState } from 'react';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { UserProvider } from './context/UserContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-neutral-50">
        {isAuthenticated ? (
          <Layout onLogout={handleLogout}>
            <Dashboard />
          </Layout>
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </div>
    </UserProvider>
  );
}

export default App;