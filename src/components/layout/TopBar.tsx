import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';

const TopBar: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

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
        <button className="relative p-1 text-gray-500 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors duration-150">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <button className="flex items-center text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-full p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center">
            <User size={16} />
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;