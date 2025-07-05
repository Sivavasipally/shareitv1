import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Dice1 as Dice, Menu, Bell } from 'lucide-react';

const MobileNav: React.FC = () => {
  return (
    <div className="bg-white border-t border-gray-200 fixed bottom-0 w-full">
      <div className="grid grid-cols-5">
        <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <MobileNavItem to="/books" icon={<BookOpen size={20} />} label="Books" />
        <MobileNavItem to="/board-games" icon={<Dice size={20} />} label="Board Games" />
        <MobileNavItem to="/notifications" icon={<Bell size={20} />} label="Notices" badge={3} />
        <MobileNavItem to="/menu" icon={<Menu size={20} />} label="Menu" />
      </div>
    </div>
  );
};

interface MobileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ to, icon, label, badge }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex flex-col items-center justify-center py-2
        ${isActive ? 'text-blue-800' : 'text-gray-600'}
      `}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};

export default MobileNav;