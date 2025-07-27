import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CalendarHeader from './CalendarHeader';
import GoogleStyleCalendar from './GoogleStyleCalendar';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { CalendarEvent, CalendarView } from '../../types/calendar';
import toast from 'react-hot-toast';

interface MedicalCalendarProps {
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
}

const MedicalCalendar: React.FC<MedicalCalendarProps> = ({
  className = '',
  onEventClick,
  onCreateEvent,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
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

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      // Comportamiento por defecto - mostrar información del evento
      toast.success(`Evento: ${event.title}`);
    }
  };

  const handleEventDrop = async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    try {
      // Aquí implementarías la lógica para mover el evento
      toast.success(`Evento "${event.title}" reprogramado para ${format(newStart, 'PPP p', { locale: es })}`);
      await refreshEvents();
    } catch (error) {
      toast.error('Error al reprogramar el evento');
      console.error('Error moving event:', error);
    }
  };

  const handleDateSelect = (start: Date, end: Date) => {
    if (onCreateEvent) {
      onCreateEvent();
    } else {
      // Comportamiento por defecto - mostrar información de selección
      const startStr = format(start, 'PPP p', { locale: es });
      const endStr = format(end, 'p', { locale: es });
      toast.success(`Seleccionado: ${startStr} - ${endStr}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshEvents();
      toast.success('Calendario actualizado');
    } catch (error) {
      toast.error('Error al actualizar el calendario');
    }
  };

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    toast.success(`Vista cambiada a: ${view}`);
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el calendario</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header del calendario */}
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onPrevious={previousPeriod}
        onNext={nextPeriod}
        onToday={goToToday}
        onViewChange={handleViewChange}
        onRefresh={handleRefresh}
        onSettings={() => setShowSettings(true)}
        onCreateEvent={onCreateEvent}
        loading={loading}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Cargando calendario...</span>
          </div>
        </div>
      )}

      {/* Contenido principal del calendario */}
      <div className="relative">
        <GoogleStyleCalendar
          events={events}
          config={config}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onDateSelect={handleDateSelect}
          onViewChange={handleViewChange}
          onDateChange={setCurrentDate}
          className="calendar-content"
        />
      </div>

      {/* Sidebar o panel de información (opcional) */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Total de eventos: {events.length}</span>
            <span>•</span>
            <span>Vista: {currentView}</span>
            <span>•</span>
            <span>Última actualización: {format(new Date(), 'HH:mm', { locale: es })}</span>
          </div>
          
          {/* Leyenda de colores */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Confirmadas</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pendientes</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuración (si es necesario) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Calendario</h3>
            <p className="text-gray-600 mb-4">Aquí puedes configurar las opciones del calendario.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalCalendar;
