import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarView } from '../../types/calendar';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  RefreshCcw,
  Settings,
  Plus
} from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  currentView: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onRefresh?: () => void;
  onSettings?: () => void;
  onCreateEvent?: () => void;
  loading?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  currentView,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onRefresh,
  onSettings,
  onCreateEvent,
  loading = false,
}) => {
  const getDateTitle = () => {
    switch (currentView) {
      case 'timeGridDay':
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      case 'timeGridWeek':
        return format(currentDate, "MMM yyyy", { locale: es });
      case 'dayGridMonth':
        return format(currentDate, "MMMM yyyy", { locale: es });
      case 'listWeek':
        return 'Agenda';
      default:
        return format(currentDate, "MMMM yyyy", { locale: es });
    }
  };

  const viewButtons = [
    { key: 'timeGridDay' as CalendarView, label: 'Día' },
    { key: 'timeGridWeek' as CalendarView, label: 'Semana' },
    { key: 'dayGridMonth' as CalendarView, label: 'Mes' },
    { key: 'listWeek' as CalendarView, label: 'Agenda' },
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Left section - Logo and navigation */}
      <div className="flex items-center space-x-4">
        {/* Menu hamburger (optional) */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Calendar Icon and Title */}
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-medium text-gray-900">Calendario</h1>
        </div>

        {/* Create button */}
        {onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear</span>
          </button>
        )}
      </div>

      {/* Center section - Date navigation */}
      <div className="flex items-center space-x-4">
        {/* Navigation buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevious}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={onNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Today button */}
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Hoy
        </button>

        {/* Current date title */}
        <h2 className="text-xl font-medium text-gray-900 min-w-[200px] text-center">
          {getDateTitle()}
        </h2>
      </div>

      {/* Right section - View controls and actions */}
      <div className="flex items-center space-x-4">
        {/* View selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {viewButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => onViewChange(button.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentView === button.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={loading}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={loading}
              title="Actualizar calendario"
            >
              <RefreshCcw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Settings button */}
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Configuración"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* User profile or more options */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
