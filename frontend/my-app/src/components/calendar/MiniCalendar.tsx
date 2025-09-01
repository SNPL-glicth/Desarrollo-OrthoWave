import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../../types/calendar';
import { getTodayColombia } from '../../utils/dateUtils';

interface MiniCalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onMonthChange?: (date: Date) => void; // Nuevo prop para cuando cambien el mes
  events?: CalendarEvent[];
  selectedDate?: Date;
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  onDateClick,
  onMonthChange,
  events = [],
  selectedDate,
  className = '',
}) => {
  const [displayDate, setDisplayDate] = useState(() =>
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );

  // Sincronizar displayDate cuando currentDate cambie
  useEffect(() => {
    const newDisplayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    if (newDisplayDate.getTime() !== displayDate.getTime()) {
      setDisplayDate(newDisplayDate);
    }
  }, [currentDate, displayDate]);

  const today = useMemo(() => {
    return getTodayColombia();
  }, []);

  // Función para verificar si hay eventos en una fecha específica
  const hasEventsOnDate = useCallback((date: Date, eventsList: CalendarEvent[]): boolean => {
    return eventsList.some(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  }, []);

  // Generar días del mes
  const monthDays = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Días del mes anterior para completar la primera semana
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasEvents: boolean;
    }> = [];

    // Días del mes anterior
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        hasEvents: hasEventsOnDate(date, events),
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        hasEvents: hasEventsOnDate(date, events),
      });
    }

    // Días del siguiente mes para completar las 6 semanas
    const totalCells = 42; // 6 semanas × 7 días
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        hasEvents: hasEventsOnDate(date, events),
      });
    }

    return days;
  }, [displayDate, selectedDate, events, today, hasEventsOnDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      
      // Notificar el cambio de mes al componente padre
      if (onMonthChange) {
        onMonthChange(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
      
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    onDateClick(date);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className={`bg-gray-50 ${className}`}>
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Mes anterior"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-sm font-medium text-gray-900">
          {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Mes siguiente"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Nombres de los días */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={`day-${index}`}
            className="text-xs font-medium text-gray-500 text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day.date)}
            className={`
              relative w-8 h-8 text-xs rounded-full transition-all duration-200 ease-in-out
              hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50
              ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
              ${day.isToday
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : day.isSelected
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : ''
              }
            `}
            title={day.date.toLocaleDateString()}
          >
            <span className="relative z-10">
              {day.date.getDate()}
            </span>

            {/* Indicador de eventos */}
            {day.hasEvents && !day.isToday && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full"></div>
            )}

            {/* Indicador especial para eventos en el día de hoy */}
            {day.hasEvents && day.isToday && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>

    </div>
  );
};

export default MiniCalendar;
