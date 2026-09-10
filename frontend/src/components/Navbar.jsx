import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User, Award, LayoutDashboard, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CoGig</span>
          </Link>

          {user && (
            <div className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {user.role === 'customer' && (
                <Link
                  to="/gigs/create"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Post Gig</span>
                </Link>
              )}

              {user.role === 'worker' && (
                <Link
                  to="/tokens"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
                >
                  <Award className="w-5 h-5" />
                  <span className="hidden sm:inline">Tokens: {user.tokens || 0}</span>
                </Link>
              )}

              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;