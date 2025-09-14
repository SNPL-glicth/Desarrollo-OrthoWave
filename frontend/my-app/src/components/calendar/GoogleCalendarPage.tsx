import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleCalendarNavbar from './GoogleCalendarNavbar';
import GoogleStyleCalendar from './GoogleStyleCalendar';
import MiniCalendar from './MiniCalendar';
import UserAccountModal from './UserAccountModal';
import AppointmentRequestsOffcanvas from '../doctor/AppointmentRequestsOffcanvas';
import DoctorAppointmentModal from '../doctor/DoctorAppointmentModal';
import AppointmentDetailsModal from '../doctor/AppointmentDetailsModal';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { useAuth } from '../../context/AuthContext';
import { CalendarView, CalendarEvent } from '../../types/calendar';
import '../../styles/GoogleCalendar.css';

const GoogleCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showNotificationsOffcanvas, setShowNotificationsOffcanvas] = useState(false);
  
  // Estado para el modal de detalles de cita
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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
    console.log('🎯 Event clicked:', event);
    
    // Buscar el evento completo en la lista de eventos
    const fullEvent = events.find(e => e.id === event.id);
    
    if (fullEvent) {
      console.log('📋 Evento completo encontrado:', {
        id: fullEvent.id,
        title: fullEvent.title,
        startTime: fullEvent.startTime,
        endTime: fullEvent.endTime,
        status: fullEvent.status,
        extendedProps: fullEvent.extendedProps
      });
      
      setSelectedEvent(fullEvent);
      setShowDetailsModal(true);
    } else {
      console.warn('⚠️ No se pudo encontrar el evento completo para:', event.id);
      // Crear un evento temporal con los datos disponibles
      const tempEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        startTime: new Date(event.start),
        endTime: new Date(event.end || event.start),
        type: 'appointment',
        status: 'confirmed',
        description: '',
        backgroundColor: event.backgroundColor || '#3B82F6',
        textColor: '#ffffff',
        extendedProps: event.extendedProps || {}
      };
      
      setSelectedEvent(tempEvent);
      setShowDetailsModal(true);
    }
  };
  
  const handleEditEvent = (event: CalendarEvent) => {
    console.log('✏️ Editar evento:', event.id);
    setShowDetailsModal(false);
    // TODO: Implementar edición de citas
    alert('Función de edición en desarrollo');
  };
  
  const handleCancelEvent = (event: CalendarEvent) => {
    console.log('❌ Cancelar evento:', event.id);
    setShowDetailsModal(false);
    // TODO: Implementar cancelación de citas
    alert('Función de cancelación en desarrollo');
  };

  const handleDateSelect = (start: Date, end: Date) => {
    console.log('🔥🔥🔥 ============ DEBUGGING PROFUNDO ============');
    console.log('🎯 GoogleCalendarPage - Date selected:', start, end);
    console.log('🎯 GoogleCalendarPage - Current view:', currentView);
    console.log('🎯 GoogleCalendarPage - Start date ISO:', start.toISOString());
    console.log('🎯 GoogleCalendarPage - Start date local:', start.toString());
    console.log('🎯 GoogleCalendarPage - Start date getTime():', start.getTime());
    console.log('🎯 GoogleCalendarPage - Start date components:', {
      fullYear: start.getFullYear(),
      month: start.getMonth(),
      date: start.getDate(),
      hours: start.getHours(),
      minutes: start.getMinutes(),
      seconds: start.getSeconds(),
      timezoneOffset: start.getTimezoneOffset()
    });
    
    // También verificar la fecha actual para contexto
    const now = new Date();
    console.log('🎯 GoogleCalendarPage - Fecha actual del navegador:', {
      now: now.toISOString(),
      nowLocal: now.toString(),
      nowComponents: {
        fullYear: now.getFullYear(),
        month: now.getMonth(),
        date: now.getDate(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        timezoneOffset: now.getTimezoneOffset()
      }
    });
    
    // NUEVO COMPORTAMIENTO: Si estamos en vista mes, redirigir a vista día
    if (currentView === 'dayGridMonth') {
      console.log('🎯 GoogleCalendarPage - Vista mes detectada, redirigiendo a vista día');
      
      // ⚠️ MULTIPLE ESTRATEGIAS DE CORRECCIÓN
      
      // Estrategia 1: Fecha "limpia" basada en componentes
      const correctedDate1 = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0, 0, 0);
      
      // Estrategia 2: Ajustar por timezone offset
      const correctedDate2 = new Date(start.getTime() + (start.getTimezoneOffset() * 60000));
      
      // Estrategia 3: Usar solo la parte de fecha ISO
      const isoDateOnly = start.toISOString().split('T')[0]; // "2025-08-08"
      const correctedDate3 = new Date(isoDateOnly + 'T12:00:00.000');
      
      console.log('🎯 GoogleCalendarPage - ESTRATEGIAS DE CORRECCIÓN:');
      console.log('📅 Estrategia 1 (componentes):', {
        date: correctedDate1,
        iso: correctedDate1.toISOString(),
        local: correctedDate1.toString(),
        day: correctedDate1.getDate()
      });
      
      console.log('📅 Estrategia 2 (timezone offset):', {
        date: correctedDate2,
        iso: correctedDate2.toISOString(),
        local: correctedDate2.toString(),
        day: correctedDate2.getDate()
      });
      
      console.log('📅 Estrategia 3 (ISO date only):', {
        isoDateOnly,
        date: correctedDate3,
        iso: correctedDate3.toISOString(),
        local: correctedDate3.toString(),
        day: correctedDate3.getDate()
      });
      
      // Usar la estrategia 3 que debería ser más confiable
      const finalCorrectedDate = correctedDate3;
      
      console.log('🚀 GoogleCalendarPage - FECHA FINAL SELECCIONADA:');
      console.log('📅 Fecha final:', {
        date: finalCorrectedDate,
        iso: finalCorrectedDate.toISOString(),
        local: finalCorrectedDate.toString(),
        day: finalCorrectedDate.getDate(),
        month: finalCorrectedDate.getMonth(),
        year: finalCorrectedDate.getFullYear()
      });
      
      setCurrentDate(finalCorrectedDate);
      setCurrentView('timeGridDay');
      console.log('🔥🔥🔥 ============ FIN DEBUGGING ============');
      return; // No abrir modal, solo cambiar vista
    }
    
    // COMPORTAMIENTO ORIGINAL: En vista día/semana, abrir modal para crear cita
    
    // Extraer la hora directamente de la fecha local sin conversión de zona horaria
    const hours = start.getHours().toString().padStart(2, '0');
    const minutes = start.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    console.log('🎯 GoogleCalendarPage - Hora calculada directamente:', timeString);
    console.log('🎯 GoogleCalendarPage - Fecha para modal:', start);
    console.log('🎯 GoogleCalendarPage - ABRIENDO DoctorAppointmentModal con estos datos');
    
    setSelectedDate(start);
    setSelectedTime(timeString);
    setShowCreateModal(true);
  };

  const handleMiniCalendarDateClick = (date: Date) => {
    // Siempre cambiar a la vista de día específico cuando se hace clic en una fecha del mini calendario
    setCurrentDate(date);
    setCurrentView('timeGridDay');
  };

  const handleMiniCalendarMonthChange = (date: Date) => {
    // Actualizar la fecha del calendario principal cuando se navega en el mini calendario
    setCurrentDate(date);
  };

  const handleCreateEvent = () => {
    setSelectedDate(new Date());
    setSelectedTime(''); // Limpiar hora cuando se crea desde el botón
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        onHamburgerClick={() => {
          console.log('Hamburger clickeado, abriendo offcanvas...');
          setShowNotificationsOffcanvas(true);
        }}
        userInfo={{
          name: user.nombre || user.email,
          email: user.email,
          avatar: undefined,
        }}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierdo estilo Google Calendar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Botón Crear */}
          <div className="p-6">
            <button
              onClick={handleCreateEvent}
              className="flex items-center space-x-3 bg-gray-50 border border-gray-300 rounded-full px-6 py-3 hover:shadow-md transition-shadow w-full group hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-700 font-medium">Crear cita</span>
            </button>
          </div>


          {/* Mini Calendar */}
          <div className="px-6 pb-6 flex-1">
            <MiniCalendar
              currentDate={currentDate}
              onDateClick={handleMiniCalendarDateClick}
              onMonthChange={handleMiniCalendarMonthChange}
              events={events}
              selectedDate={currentDate}
            />
          </div>
        </div>

        {/* Área principal del calendario */}
        <div className="flex-1 bg-gray-50 overflow-hidden">
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
          onNavigateToHome={() => {
            setIsUserMenuOpen(false);
            navigate('/');
          }}
        />
      )}

      {/* Modal de crear cita */}
      <DoctorAppointmentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedDate(null);
          setSelectedTime('');
        }}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onAppointmentCreated={(appointment) => {
          console.log('Nueva cita creada:', appointment);
          // Aquí se podría actualizar el calendario con la nueva cita
          refreshEvents();
        }}
      />

      
      {/* Modal de detalles de cita */}
      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onCancel={handleCancelEvent}
      />
      
      {/* Offcanvas de solicitudes de citas */}
      <AppointmentRequestsOffcanvas
        isOpen={showNotificationsOffcanvas}
        onClose={() => setShowNotificationsOffcanvas(false)}
        onNavigateToCalendar={(date) => {
          // Navegar al calendario con la fecha específica
          setCurrentDate(date);
          setCurrentView('timeGridDay');
          setShowNotificationsOffcanvas(false);
        }}
      />
    </div>
  );
};

export default GoogleCalendarPage;
