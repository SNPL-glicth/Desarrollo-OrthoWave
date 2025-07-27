import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DoctorNavbarProps {
  title?: string;
  onProfileClick?: () => void;
}

const DoctorNavbar: React.FC<DoctorNavbarProps> = ({ 
  title = "Dashboard", 
  onProfileClick 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img className="h-8 w-auto" src="/images/White logo - no background_page-0001.webp" alt="Logo" />
            <h1 className="ml-4 text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleProfileClick}
              className="text-slate-700 hover:text-slate-900 font-medium hover:bg-slate-100 px-3 py-2 rounded-lg transition-all duration-200"
            >
              Mi Perfil
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Dr. {user?.nombre} {user?.apellido}
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;
