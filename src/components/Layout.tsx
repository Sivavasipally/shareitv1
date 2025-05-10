import React, { ReactNode, useState } from 'react';
import { Book, Users, Puzzle as PuzzlePiece, User, LogOut, Menu, X, Home, Search } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Book size={20} />, label: 'Books', path: '/books' },
    { icon: <PuzzlePiece size={20} />, label: 'Board Games', path: '/boards' },
    { icon: <Search size={20} />, label: 'Search', path: '/search' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  // Admin menu items
  const adminMenuItems = [
    { icon: <Users size={20} />, label: 'Manage Users', path: '/admin/users' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Book className="text-primary-600" size={32} />
            <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900">Book & Boards</h1>
          </div>
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.path}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
              {user?.isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Users size={20} />
                  <span>Admin</span>
                </a>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-error-500 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md animate-fade-in">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
              {user?.isAdmin && adminMenuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg text-error-500 hover:bg-error-100 transition-colors w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Book size={24} />
              <p className="text-lg font-bold">Book & Boards</p>
            </div>
            <div className="text-sm text-white/80">
              <p>© 2025 Book & Boards. Promoting sustainable reading and gaming.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;