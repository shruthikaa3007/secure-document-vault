import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();

  // Check if user has specific permissions
  const isAdmin = user?.permissions?.includes('manage:users');
  const isSuperAdmin = user?.permissions?.includes('access:all');

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-xl">Secure Vault</Link>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  Home
                </Link>
                
                {isAuthenticated && (
                  <>
                    <Link to="/documents" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/documents')}`}>
                      Documents
                    </Link>
                    <Link to="/upload" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/upload')}`}>
                      Upload
                    </Link>
                    <Link to="/search" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/search')}`}>
                      Search
                    </Link>
                  </>
                )}
                
                {isAdmin && (
                  <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin')}`}>
                    Admin
                  </Link>
                )}
                
                {isSuperAdmin && (
                  <Link to="/admin/superadmin" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/superadmin')}`}>
                    Super Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          
            
            <div className="ml-3 relative">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <Link to="/profile" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}>
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link to="/login" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/login')}`}>
                    Login
                  </Link>
                  <Link to="/register" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/register')}`}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;