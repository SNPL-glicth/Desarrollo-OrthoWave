import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniCalendar from '../calendar/MiniCalendar';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { Cita } from '../../services/citasService';
import NotificationBell from '../notifications/NotificationBell';
import AppointmentConfirmationModal from '../patient/AppointmentConfirmationModal';
import { useAppointmentConfirmation } from '../../hooks/useAppointmentConfirmation';

// Component para el User Account Modal (sin botón "mis pacientes")
interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut: () => void;
  onNavigateToHome?: () => void;
}

const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onNavigateToHome
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-16 right-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Current user section */}
        <div className="p-6 text-center">
          {/* User avatar */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl font-medium">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* User info */}
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            ¡Hola, {currentUser.name}!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {currentUser.email}
          </p>
          
          {/* Navigate to home button */}
          {onNavigateToHome && (
            <button
              onClick={onNavigateToHome}
              className="w-full mb-4 px-4 py-2 text-sm font-medium text-primary bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Ver Productos para Reservar
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-4">
              <button className="hover:text-gray-700 transition-colors">
                Política de Privacidad
              </button>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">
                Términos del Servicio
              </button>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={onSignOut}
            className="w-full mt-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Usar una sola fecha para simplificar la lógica
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Obtener datos reales de citas
  const { pastAppointments, upcomingAppointments, loading } = usePatientAppointments();
  
  // Hook para manejo de confirmación de citas
  const {
    isModalOpen,
    appointmentToConfirm,
    confirmationLoading,
    // openConfirmationModal, // Comentado para futuro uso
    closeConfirmationModal,
    confirmAppointment
  } = useAppointmentConfirmation();
  
  // Log para verificar que tenemos las próximas citas disponibles
  React.useEffect(() => {
    if (upcomingAppointments.length > 0) {
      console.log('Próximas citas disponibles:', upcomingAppointments.length);
    }
  }, [upcomingAppointments]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleNavigateToAgendar = () => {
    navigate('/dashboard/patient/agendar');
  };

  // Manejar selección de fecha en el mini calendario
  const handleDateSelect = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    setSelectedDate(normalizedDate);
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - optimizado para móviles */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 sm:py-4 px-2 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <img className="h-6 sm:h-8 flex-shrink-0" src="/images/White logo - no background_page-0001.webp" alt="OrtoWhave" />
            <h1 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-800 truncate">Hola, {user.nombre}</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Campana de notificaciones */}
            <NotificationBell />
            
            {/* Botón de perfil - optimizado para touch */}
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="w-10 h-10 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium hover:bg-primary-dark transition-colors text-sm sm:text-base touch-manipulation"
                aria-label="Menú de usuario"
              >
                {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-2 sm:py-4 lg:py-8 px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-8">
          {/* Sidebar - optimizado para móviles */}
          <aside className="w-full lg:w-64 space-y-3 sm:space-y-4 lg:space-y-6">
            <nav className="flex flex-row lg:flex-col gap-2 lg:gap-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              <button className="flex-shrink-0 lg:w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap touch-manipulation min-h-[44px]">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm lg:text-base">Inicio</span>
              </button>

              <button 
                onClick={() => navigate('/dashboard/patient/perfil')}
                className="flex-shrink-0 lg:w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap touch-manipulation min-h-[44px]"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm lg:text-base">Mi perfil</span>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/patient/estados-citas')}
                className="flex-shrink-0 lg:w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap touch-manipulation min-h-[44px]"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm lg:text-base">Estados de citas</span>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/patient/documentos')}
                className="flex-shrink-0 lg:w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap touch-manipulation min-h-[44px]"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm lg:text-base">Mis Documentos</span>
              </button>
            </nav>

            {/* Contactar - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contactar</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(+34) 123 456 789</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@ortowhave.com</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Sección eliminada - sin próxima cita hasta verificar datos en BD */}

            {/* Botón Agendar nueva cita - optimizado para móviles */}
            <button
              onClick={handleNavigateToAgendar}
              className="w-full bg-primary text-white py-4 sm:py-3 px-6 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm text-base sm:text-sm touch-manipulation min-h-[48px]"
            >
              📅 Agendar nueva cita
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendario */}
              <section className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Calendario</h2>
                </div>
                <MiniCalendar
                  currentDate={selectedDate}
                  onDateClick={handleDateSelect}
                />

                {/* Información de la fecha seleccionada */}
                <div className="p-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-900 mb-2">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>No hay citas programadas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Historial de citas - Datos reales */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de citas</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-gray-600">Cargando historial...</p>
                  </div>
                ) : pastAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No hay citas en el historial.</p>
                    <p className="text-sm mt-2">Las citas completadas aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastAppointments.slice(0, 3).map((appointment: Cita) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {format(new Date(appointment.fechaHora), "d 'de' MMM yyyy", { locale: es })}
                              </p>
                              <p className="text-xs text-gray-500">
                                Dr. {appointment.doctor?.nombre || 'No disponible'} - {appointment.tipoConsulta || 'Consulta'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.estado === 'completada' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.estado === 'cancelada'
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.estado}
                        </span>
                      </div>
                    ))}
                    {pastAppointments.length > 3 && (
                      <button 
                        onClick={() => navigate('/dashboard/patient/citas')}
                        className="w-full text-center py-2 text-sm text-primary hover:text-primary-dark font-medium"
                      >
                        Ver todas las citas ({pastAppointments.length})
                      </button>
                    )}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* User Account Modal */}
      <UserAccountModal
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        currentUser={{
          name: user.nombre || user.email,
          email: user.email,
          avatar: undefined,
        }}
        onSignOut={handleLogout}
        onNavigateToHome={() => {
          setIsUserMenuOpen(false);
          navigate('/');
        }}
      />
      
      {/* Appointment Confirmation Modal */}
      <AppointmentConfirmationModal
        isOpen={isModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmAppointment}
        appointmentData={appointmentToConfirm}
        loading={confirmationLoading}
      />
    </div>
  );
};

export default PatientDashboard;
