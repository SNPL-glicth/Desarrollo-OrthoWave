import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointmentRequests } from '../hooks/useAppointmentRequests';
import NotificationService from '../services/NotificationService';

interface NotificationBellProps {
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { user } = useAuth();
  const { contadorPendientes } = useAppointmentRequests();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      NotificationService.connect(userId);
    }

    return () => {
      NotificationService.disconnect();
    };
  }, []);

  // Actualizar estado de notificaciones no leídas basado en solicitudes pendientes
  useEffect(() => {
    console.log('NotificationBell - Usuario:', user);
    console.log('NotificationBell - Contador pendientes:', contadorPendientes);
    
    if (user?.rol === 'doctor') {
      setHasUnread(contadorPendientes > 0);
      console.log('NotificationBell - HasUnread actualizado:', contadorPendientes > 0);
    }
  }, [contadorPendientes, user]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleClick}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
        title={user?.rol === 'doctor' ? `${contadorPendientes} solicitudes pendientes` : 'Notificaciones'}
      >
        <svg 
          className={`w-6 h-6 ${hasUnread ? 'text-blue-600' : 'text-gray-600'}`}
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {hasUnread && contadorPendientes > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px] shadow-md border-2 border-white animate-pulse">
            {contadorPendientes > 99 ? '99+' : contadorPendientes}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
