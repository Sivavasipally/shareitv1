import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Dice1 as Dice, 
  LogOut, 
  PlusCircle, 
  CheckSquare, 
  Bell,
  Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  // TODO: Implement actual admin check
  const isAdmin = true;

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="text-2xl font-bold text-blue-800 flex items-center">
          <BookOpen className="mr-2" />
          Share-IT - B&B
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <div className="space-y-1">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/books" icon={<BookOpen size={20} />} label="Books" />
          <NavItem to="/board-games" icon={<Dice size={20} />} label="Board Games" />
        </div>
        
        <div className="mt-8">
          <p className="text-xs uppercase text-gray-500 font-medium px-3 mb-2">Management</p>
          <div className="space-y-1">
            <NavItem to="/add-book" icon={<PlusCircle size={20} />} label="Add Books" />
            <NavItem to="/add-board-game" icon={<PlusCircle size={20} />} label="Add Board Games" />
            <NavItem to="/approve-requests" icon={<CheckSquare size={20} />} label="Approve Requests" />
            <NavItem to="/notifications" icon={<Bell size={20} />} label="Notifications" badge={3} />
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8">
            <p className="text-xs uppercase text-gray-500 font-medium px-3 mb-2">Admin</p>
            <div className="space-y-1">
              <NavItem to="/admin" icon={<Settings size={20} />} label="Settings" />
            </div>
          </div>
        )}
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Link to="/login" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 w-full transition-colors duration-150">
          <LogOut size={20} className="mr-3 text-gray-500" />
          Logout
        </Link>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
        ${isActive 
          ? 'bg-blue-50 text-blue-800' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <span className={`mr-3 ${isActive ? 'text-blue-800' : 'text-gray-500'}`}>
            {icon}
          </span>
          <span>{label}</span>
          {badge && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;