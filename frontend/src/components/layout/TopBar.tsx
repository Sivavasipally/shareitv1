import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopBar: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'New book request', time: '2 min ago' },
    { id: 2, message: 'Board game returned', time: '1 hour ago' },
    { id: 3, message: 'Overdue reminder', time: '2 hours ago' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm transition-colors duration-200"
          placeholder="Search books, board games, or users..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-1 text-gray-500 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors duration-150"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  <Link 
                    to="/notifications" 
                    className="text-xs text-blue-800 hover:text-blue-900"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Profile */}
        <div className="relative">
          <button 
            className="flex items-center text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-full p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center">
              <User size={16} />
            </div>
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfile(false)}
              >
                Your Profile
              </Link>
              <Link 
                to="/activity" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfile(false)}
              >
                Activity
              </Link>
              <div className="border-t border-gray-200"></div>
              <Link 
                to="/login" 
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => setShowProfile(false)}
              >
                Sign out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;