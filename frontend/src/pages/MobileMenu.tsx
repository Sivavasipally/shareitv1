import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  CheckSquare, 
  Settings, 
  User, 
  LogOut,
  HelpCircle
} from 'lucide-react';

const MobileMenu: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
      
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex flex-col">
          <Link
            to="/add-book"
            className="px-4 py-3 flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          >
            <PlusCircle size={20} className="mr-3 text-blue-800" />
            <span className="text-gray-800">Add Books</span>
          </Link>
          
          <Link
            to="/add-board-game"
            className="px-4 py-3 flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          >
            <PlusCircle size={20} className="mr-3 text-blue-800" />
            <span className="text-gray-800">Add Board Games</span>
          </Link>
          
          <Link
            to="/approve-requests"
            className="px-4 py-3 flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          >
            <CheckSquare size={20} className="mr-3 text-blue-800" />
            <span className="text-gray-800">Approve Requests</span>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mt-4">
        <div className="flex flex-col">
          <button className="px-4 py-3 flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
            <User size={20} className="mr-3 text-gray-700" />
            <span className="text-gray-800">Profile</span>
          </button>
          
          <button className="px-4 py-3 flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
            <Settings size={20} className="mr-3 text-gray-700" />
            <span className="text-gray-800">Settings</span>
          </button>
          
          <button className="px-4 py-3 flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
            <HelpCircle size={20} className="mr-3 text-gray-700" />
            <span className="text-gray-800">Help & Support</span>
          </button>
          
          <button className="px-4 py-3 flex items-center hover:bg-gray-50 transition-colors duration-150">
            <LogOut size={20} className="mr-3 text-red-600" />
            <span className="text-red-600">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;