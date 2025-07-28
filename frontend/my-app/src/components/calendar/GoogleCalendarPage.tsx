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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
    navigate('/dashboard/doctor/pacientes');
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    // Aquí puedes abrir un modal con los detalles de la cita
  };

  const handleDateSelect = (start: Date, end: Date) => {
    console.log('Date selected:', start, end);
    setSelectedDate(start);
    setShowCreateModal(true);
  };

  const handleMiniCalendarDateClick = (date: Date) => {
    setCurrentDate(date);
    if (currentView === 'dayGridMonth') {
      // Si estamos en vista mensual, ir al mes de esa fecha
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    } else if (currentView === 'timeGridWeek') {
      // Si estamos en vista semanal, ir a esa semana
      setCurrentDate(date);
    } else if (currentView === 'timeGridDay') {
      // Si estamos en vista diaria, ir a ese día específico
      setCurrentDate(date);
    }
  };

  const handleCreateEvent = () => {
    setSelectedDate(new Date());
    setShowCreateModal(true);
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
    <div className="min-h-screen bg-white flex flex-col">
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
          avatar: undefined,
        }}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierdo estilo Google Calendar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Botón Crear */}
          <div className="p-6">
            <button
              onClick={handleCreateEvent}
              className="flex items-center space-x-3 bg-white border border-gray-300 rounded-full px-6 py-3 hover:shadow-md transition-shadow w-full group hover:bg-gray-50"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-700 font-medium">Crear cita</span>
            </button>
          </div>

          {/* Mini Calendar */}
          <div className="px-6 pb-6">
            <MiniCalendar
              currentDate={currentDate}
              onDateClick={handleMiniCalendarDateClick}
              events={events}
              selectedDate={currentDate}
            />
          </div>

          {/* Sección Mis calendarios */}
          <div className="px-6 pb-4 flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Mis calendarios</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Dr. {user.nombre} {user.apellido}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Citas Médicas
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="w-3 h-3 bg-orange-600 rounded-sm"></div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Disponibilidad
                </span>
              </label>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="px-6 pb-6 border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <button
                onClick={handleNavigateToPatients}
                className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Mis Pacientes
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Área principal del calendario */}
        <div className="flex-1 bg-white overflow-hidden">
          <div className="h-full p-6">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando eventos...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-red-800 text-sm">{error}</div>
                <button
                  onClick={refreshEvents}
                  className="text-red-600 text-sm underline mt-1 hover:text-red-800"
                >
                  Reintentar
                </button>
              </div>
            )}

            <GoogleStyleCalendar
              events={events}
              config={config}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              onViewChange={handleViewChange}
              onDateChange={setCurrentDate}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Modal de usuario */}
      {isUserMenuOpen && (
        <UserAccountModal
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          currentUser={{
            name: user.nombre || user.email,
            email: user.email,
            avatar: undefined,
          }}
          onSignOut={handleSignOut}
          onNavigateToPatients={handleNavigateToPatients}
        />
      )}

      {/* Modal de crear evento - placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crear nueva cita</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {selectedDate && `Fecha seleccionada: ${selectedDate.toLocaleDateString()}`}
            </div>
            <div className="text-center py-8 text-gray-500">
              Funcionalidad de crear cita se implementará próximamente
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug component - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <DebugCalendarSync
          currentDate={currentDate}
          currentView={currentView}
        />
      )}
    </div>
  );
};

export default GoogleCalendarPage;
