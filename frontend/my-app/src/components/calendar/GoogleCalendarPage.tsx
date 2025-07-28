import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleCalendarNavbar from './GoogleCalendarNavbar';
import GoogleStyleCalendar from './GoogleStyleCalendar';
import MiniCalendar from './MiniCalendar';
import UserAccountModal from './UserAccountModal';
import DebugCalendarSync from './DebugCalendarSync';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { useAuth } from '../../context/AuthContext';
import { CalendarView } from '../../types/calendar';
import '../../styles/GoogleCalendar.css';

const GoogleCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const {
    currentDate,
    currentView,
    events,
    config,
    loading,
    error,
    setCurrentDate,
    setCurrentView,
    nextPeriod,
    previousPeriod,
    goToToday,
    refreshEvents,
  } = useGoogleCalendar();

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigateToPatients = () => {
    setIsUserMenuOpen(false);
    // Navegar al dashboard de pacientes
    navigate('/dashboard/doctor/pacientes');
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    // Aquí puedes abrir un modal con los detalles de la cita
  };

  const handleDateSelect = (start: Date, end: Date) => {
    console.log('Date selected:', start, end);
    // Aquí puedes abrir un modal para crear una nueva cita
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as CalendarView);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Google Calendar Navbar */}
      <GoogleCalendarNavbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onPrevious={previousPeriod}
        onNext={nextPeriod}
        onToday={goToToday}
        onViewChange={handleViewChange}
        currentView={currentView}
        onUserMenuToggle={handleUserMenuToggle}
        userInfo={{
          name: user.nombre || user.email,
          email: user.email,
          avatar: undefined, // Por ahora sin avatar
        }}
      />

      {/* Sidebar izquierdo estilo Google Calendar */}
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          {/* Botón Crear */}
          <div className="p-6">
            <button className="flex items-center space-x-3 bg-white border border-gray-300 rounded-full px-6 py-3 hover:shadow-md transition-shadow w-full">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-700 font-medium">Crear</span>
            </button>
          </div>

          {/* Mini calendario */}
          <div className="px-6 pb-6">
          <MiniCalendar
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
          />
          </div>

          {/* Buscar personas */}
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Buscar a gente</span>
            </div>
          </div>

          {/* Mis calendarios */}
          <div className="px-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Mis calendarios</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="text-blue-600" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-sm text-gray-700">{user.nombre || user.email}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="text-green-600" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span className="text-sm text-gray-700">Citas Médicas</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="text-red-600" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  <span className="text-sm text-gray-700">Urgencias</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="text-purple-600" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span className="text-sm text-gray-700">Tareas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Otros calendarios */}
          <div className="px-6 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Otros calendarios</h3>
              <div className="flex space-x-1">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Área principal del calendario */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {!loading && !error && (
            <GoogleStyleCalendar
              events={events}
              config={config}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              onViewChange={handleViewChange}
              onDateChange={setCurrentDate}
            />
          )}
        </div>
      </div>

      {/* Modal de usuario */}
      <UserAccountModal
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        currentUser={{
          name: user.nombre || user.email,
          email: user.email,
          avatar: undefined, // Por ahora sin avatar
        }}
        onSignOut={handleSignOut}
        onNavigateToPatients={handleNavigateToPatients}
      />

      {/* Debug component para desarrollo */}
      <DebugCalendarSync 
        currentDate={currentDate}
        currentView={currentView}
      />
    </div>
  );
};

export default GoogleCalendarPage;
