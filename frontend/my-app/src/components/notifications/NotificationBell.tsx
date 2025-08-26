import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import useAppointmentRequestsCount from '../../hooks/useAppointmentRequestsCount';

interface NotificationBellProps {
  className?: string;
  onClick?: () => void;
  onConfirmationRequest?: (notificationId: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "", onClick, onConfirmationRequest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotifications();

  // Hook para conteo de solicitudes de citas (solo para doctores)
  const {
    count: requestsCount
  } = useAppointmentRequestsCount();

  // Determinar el conteo a mostrar según el rol del usuario
  const isDoctor = user?.rol === 'doctor';
  const displayCount = isDoctor ? requestsCount : unreadCount;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleNotificationClick = (notification: Notification) => {
    // Para notificaciones pendientes de confirmación, navegar a estados de citas
    if (notification.tipo === 'cita_pendiente_confirmacion') {
      if (!notification.leida) {
        markAsRead(notification.id);
      }
      navigate('/dashboard/patient/estados-citas');
      setIsOpen(false);
      return;
    }
    
    // Comportamiento normal para otras notificaciones
    if (!notification.leida) {
      markAsRead(notification.id);
    }
    // Opcional: navegar a la página de la cita
    // navigate(`/dashboard/patient/citas/${notification.citaId}`);
    setIsOpen(false);
  };


  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'cita_confirmada':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'cita_cancelada':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'cita_pendiente_confirmacion':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`} ref={bellRef}>
      {/* Bell Button - Rediseñado y responsivo */}
      <button
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            setIsOpen(!isOpen);
            if (!isOpen) {
              refresh(); // Actualizar notificaciones al abrir
            }
          }
        }}
        className="relative w-10 h-10 bg-white/80 hover:bg-white border border-gray-200/50 rounded-xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-3.5-3.5A8.1 8.1 0 0018 9a6 6 0 10-12 0c0 2.97 1.64 5.54 4.05 6.93L7 17h5m3 0v1a3 3 0 11-6 0v-1m3 0H9" />
        </svg>
        
        {/* Badge de notificaciones - mejorado */}
        {displayCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm animate-pulse">
              {displayCount > 9 ? '9+' : displayCount}
            </span>
            {/* Efecto de resplandor */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400/40 rounded-full animate-ping"></span>
          </>
        )}
      </button>

      {/* Dropdown de notificaciones - Responsivo y moderno */}
      {!onClick && isOpen && (
        <>
          {/* Backdrop para móviles */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none" onClick={() => setIsOpen(false)} />
          
          {/* Modal - Adaptativo */}
          <div className="absolute top-12 right-0 z-50 w-screen max-w-sm md:w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden transform transition-all duration-200 scale-95 animate-in slide-in-from-top-2">
            {/* Header moderno */}
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-blue-50/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isDoctor ? 'Solicitudes de Citas' : 'Notificaciones'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isDoctor 
                      ? `${displayCount} solicitudes pendientes`
                      : `${unreadCount} sin leer`
                    }
                  </p>
                </div>
                {!isDoctor && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Cargando notificaciones...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5A8.1 8.1 0 0018 9a6 6 0 10-12 0c0 2.97 1.64 5.54 4.05 6.93L7 17h5m3 0v1a3 3 0 11-6 0v-1m3 0H9" />
                  </svg>
                  <p className="font-medium">No tienes notificaciones</p>
                  <p className="text-sm mt-1">Cuando los doctores confirmen tus citas aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.leida ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex space-x-3">
                        {getNotificationIcon(notification.tipo)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium text-gray-900 ${
                              !notification.leida ? 'font-semibold' : ''
                            }`}>
                              {notification.titulo}
                            </h4>
                            {!notification.leida && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.mensaje}
                          </p>
                          {notification.doctorNombre && (
                            <p className="text-sm text-gray-500 mt-1">
                              Dr. {notification.doctorNombre}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(notification.fechaCreacion), "d 'de' MMM, HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
