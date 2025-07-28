import React from 'react';
import { CalendarView } from '../../types/calendar';

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface GoogleCalendarNavbarProps {
  currentDate: Date;
  currentView: CalendarView;
  userInfo: UserInfo;
  onDateChange: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: string) => void;
  onUserMenuToggle: () => void;
}

const GoogleCalendarNavbar: React.FC<GoogleCalendarNavbarProps> = ({
  currentDate,
  currentView,
  userInfo,
  onDateChange,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onUserMenuToggle,
}) => {
  // Formatear la fecha según la vista actual
  const formatDateDisplay = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };

    if (currentView === 'timeGridWeek') {
      // Para vista semanal, mostrar el rango de la semana
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} – ${endOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('es', { month: 'long', year: 'numeric' })}`;
      } else {
        return `${startOfWeek.toLocaleDateString('es', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('es', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else if (currentView === 'timeGridDay') {
      // Para vista diaria, mostrar la fecha completa
      return currentDate.toLocaleDateString('es', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else {
      // Para vista mensual
      return currentDate.toLocaleDateString('es', options);
    }
  };

  const getViewButtonClass = (view: string) => {
    const isActive = currentView === view;
    return `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'text-gray-700 hover:bg-gray-100 border border-transparent'
    }`;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Logo, hamburger y navegación */}
        <div className="flex items-center space-x-6">
          {/* Menú hamburger */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/logo.webp" 
              alt="OrtoWhave" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl text-gray-700 font-normal">
              OrtoWhave
            </h1>
          </div>

          {/* Navegación de fecha */}
          <div className="flex items-center space-x-4">
            {/* Botón Hoy */}
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hoy
            </button>

            {/* Controles de navegación */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onPrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Período anterior"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={onNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Período siguiente"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Fecha actual */}
            <h2 className="text-xl text-gray-900 font-normal capitalize min-w-0">
              {formatDateDisplay()}
            </h2>
          </div>
        </div>

        {/* Lado derecho - Controles de vista y usuario */}
        <div className="flex items-center space-x-4">
          {/* Selector de vista */}
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => onViewChange('dayGridMonth')}
              className={getViewButtonClass('dayGridMonth')}
            >
              Mes
            </button>
            <button
              onClick={() => onViewChange('timeGridWeek')}
              className={getViewButtonClass('timeGridWeek')}
            >
              Semana
            </button>
            <button
              onClick={() => onViewChange('timeGridDay')}
              className={getViewButtonClass('timeGridDay')}
            >
              Día
            </button>
          </div>

          {/* Botones adicionales */}
          <div className="flex items-center space-x-2">
            {/* Buscar */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Buscar">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Configuraciones */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Configuraciones">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Usuario */}
            <button
              onClick={onUserMenuToggle}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={`${userInfo.name} (${userInfo.email})`}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userInfo.name?.charAt(0)?.toUpperCase() || userInfo.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarNavbar;
