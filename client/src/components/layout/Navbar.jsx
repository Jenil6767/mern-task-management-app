import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-4">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/projects')}
            >
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white font-bold group-hover:scale-110 transition-transform">
                TM
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">TaskManager</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <NavButton
                onClick={() => navigate('/projects')}
                active={window.location.pathname.startsWith('/projects')}
              >
                Projects
              </NavButton>
              <NavButton
                onClick={() => navigate('/analytics')}
                active={window.location.pathname === '/analytics'}
              >
                Analytics
              </NavButton>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                  <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-1 opacity-70">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm ring-1 ring-gray-100 uppercase">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ children, onClick, active }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
  >
    {children}
  </button>
);

export default Navbar;
