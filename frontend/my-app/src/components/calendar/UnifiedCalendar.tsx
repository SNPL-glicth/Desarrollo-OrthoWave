import React, { useState, useMemo, useCallback } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isToday,
  isSameDay,
  isWeekend,
  isBefore,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getCurrentColombiaDate,
  isDateInPastColombia,
  isTimeInPastColombia,
  isDateTimeInPastColombia,
  getCurrentColombiaDateOnly
} from '../../utils/timezoneUtils';
import useIndependentSlots, { IndependentSlot } from '../../hooks/useIndependentSlots';

interface UnifiedCalendarProps {
  doctorId: number;
  onSlotSelect: (slot: IndependentSlot) => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  selectedSlot?: IndependentSlot | null;
  initialView?: 'day' | 'week' | 'month';
}

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  doctorId,
  onSlotSelect,
  onDateSelect,
  selectedDate: propSelectedDate,
  selectedSlot: propSelectedSlot,
  initialView = 'week'
}) => {
  const [currentDate, setCurrentDate] = useState(propSelectedDate || getCurrentColombiaDate());
  const [view, setView] = useState<'day' | 'week' | 'month'>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(propSelectedDate);

  // Use independent slots hook
  const {
    allSlots,
    availableSlots,
    selectedSlot,
    loading,
    error,
    selectSlot,
    clearSelection,
    getSlotsForDate,
    isSlotSelected,
    refresh
  } = useIndependentSlots({
    doctorId,
    viewType: view,
    selectedDate: currentDate
  });

  // Generate month days for month view
  const monthDays = useMemo(() => {
    if (view !== 'month') return [];
    
    const startMonth = startOfMonth(currentDate);
    const endMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 });
    const endDate = endOfWeek(endMonth, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate, view]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    if (view !== 'week') return [];
    
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  }, [view]);

  const goToNext = useCallback(() => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  }, [view]);

  const goToToday = useCallback(() => {
    const today = getCurrentColombiaDate();
    setCurrentDate(today);
    setSelectedDate(today);
    onDateSelect(today);
  }, [onDateSelect]);

  // Handle date selection with proper Colombia timezone validation
  const handleDateSelect = useCallback((date: Date) => {
    console.log('🎯 DATE SELECTION ATTEMPT:', {
      clickedDate: {
        iso: date.toISOString(),
        readable: format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
      },
      currentColombiaTime: getCurrentColombiaDate().toISOString(),
      validation: {
        isInPast: isDateInPastColombia(date),
        isWeekend: isWeekend(date)
      },
      view: view
    });
    
    // Use Colombia timezone validation instead of browser local time
    if (isDateInPastColombia(date)) {
      console.log('❌ Date is in the past according to Colombia time - blocked');
      return;
    }
    
    // Don't allow weekends (assuming no work on weekends)
    if (isWeekend(date)) {
      console.log('❌ Weekend date - blocked');
      return;
    }

    console.log('✅ Date selection allowed - proceeding');
    setSelectedDate(date);
    setCurrentDate(date);
    onDateSelect(date);
    
    // If in month view and date is selected, switch to day view
    if (view === 'month') {
      console.log('🔄 Switching from month view to day view');
      setView('day');
    }
  }, [view, onDateSelect]);


  // Handle slot selection
  const handleSlotSelect = useCallback((slot: IndependentSlot) => {
    if (selectSlot(slot)) {
      onSlotSelect(slot);
    }
  }, [selectSlot, onSlotSelect]);

  // Check if date has available slots
  const hasAvailableSlots = useCallback((date: Date) => {
    const daySlots = getSlotsForDate(date);
    return daySlots.some(slot => slot.isAvailable);
  }, [getSlotsForDate]);

  // Get header text
  const getHeaderText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: es });
      default:
        return '';
    }
  };

  // Render day view
  const renderDayView = () => {
    const daySlots = getSlotsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Day header */}
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            {isToday(currentDate) && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Hoy
              </span>
            )}
          </h3>
        </div>

        {/* Time slots */}
        <div className="max-h-96 overflow-y-auto">
          {daySlots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No hay horarios disponibles para este día</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {daySlots.map(slot => (
                <div
                  key={slot.key}
                  onClick={() => slot.isAvailable && handleSlotSelect(slot)}
                  className={`
                    p-4 flex items-center space-x-4 transition-colors cursor-pointer
                    ${slot.isAvailable 
                      ? 'hover:bg-blue-50 cursor-pointer' 
                      : 'bg-gray-50 cursor-not-allowed opacity-60'
                    }
                    ${isSlotSelected(slot) ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
                  `}
                >
                  <div className="w-16 text-sm font-medium text-gray-900">
                    {slot.displayTime}
                  </div>
                  <div className="flex-1">
                    {slot.isAvailable ? (
                      <div className="text-sm text-green-600 font-medium">
                        ✅ Disponible
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        ❌ Ocupado
                      </div>
                    )}
                  </div>
                  <div className={`
                    w-3 h-3 rounded-full
                    ${slot.isAvailable ? 'bg-green-400' : 'bg-red-400'}
                  `} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map(day => (
          <div 
            key={day.toString()} 
            className="p-3 text-center border-r border-gray-200 last:border-r-0"
          >
            <div className="text-sm font-medium text-gray-600">
              {format(day, 'EEE', { locale: es })}
            </div>
            <div 
              className={`
                text-lg font-bold mt-1 cursor-pointer hover:text-blue-600
                ${isToday(day) ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'}
                ${selectedDate && isSameDay(day, selectedDate) ? 'bg-blue-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}
                ${!hasAvailableSlots(day) ? 'text-red-400' : ''}
              `}
              onClick={() => handleDateSelect(day)}
            >
              {format(day, 'd')}
            </div>
            {hasAvailableSlots(day) && (
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Week time slots grid */}
      <div className="max-h-96 overflow-y-auto">
        {/* Generate time slots for the week */}
        {Array.from(new Set(allSlots.map(s => s.time))).sort().map(time => (
          <div key={time} className="grid grid-cols-7 border-b border-gray-100">
            {weekDays.map(day => {
              const daySlots = getSlotsForDate(day);
              const slot = daySlots.find(s => s.time === time);
              
              return (
                <div
                  key={`${day.toString()}-${time}`}
                  onClick={() => slot && slot.isAvailable && handleSlotSelect(slot)}
                  className={`
                    p-2 text-center border-r border-gray-100 last:border-r-0 min-h-[50px] flex items-center justify-center transition-colors
                    ${!slot ? 'bg-gray-50' :
                      slot.isAvailable ? 'hover:bg-blue-50 cursor-pointer' : 'bg-red-50 cursor-not-allowed'}
                    ${slot && isSlotSelected(slot) ? 'bg-blue-100 border-2 border-blue-500' : ''}
                  `}
                >
                  <div className="text-xs">
                    {slot ? (
                      <>
                        <div className="font-medium">{time}</div>
                        {slot.isAvailable ? (
                          <div className="text-green-600 text-xs">✓</div>
                        ) : (
                          <div className="text-red-600 text-xs">✗</div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400">-</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Render month view
  const renderMonthView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Month days header */}
      <div className="grid grid-cols-7 bg-gray-50">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Month calendar grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, index) => {
          const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
          // Use Colombia timezone validation instead of browser local time
          const isPast = isDateInPastColombia(day);
          const hasSlots = hasAvailableSlots(day);
          const isWeekendDay = isWeekend(day);
          
          // Additional debug logging for month view
          if (index < 7) { // Only log first week for debugging
            console.log(`📅 Month Day ${format(day, 'd')}:`, {
              day: day.toISOString(),
              isPast,
              isCurrentMonth,
              hasSlots,
              isWeekend: isWeekendDay,
              clickable: !isPast && isCurrentMonth && !isWeekendDay
            });
          }
          
          return (
            <div
              key={index}
              onClick={() => {
                if (!isPast && isCurrentMonth && !isWeekendDay) {
                  handleDateSelect(day);
                }
              }}
              className={`
                p-3 border-r border-b border-gray-100 last:border-r-0 min-h-[80px] transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${isPast || isWeekendDay ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                ${selectedDate && isSameDay(day, selectedDate) ? 'bg-blue-100' : ''}
                ${isToday(day) && !selectedDate ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
              `}
            >
              <div className="text-sm font-medium">
                {format(day, 'd')}
              </div>
              {hasSlots && !isPast && !isWeekendDay && isCurrentMonth && (
                <div className="mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
              )}
              {/* Visual indicators */}
              {isPast && isCurrentMonth && (
                <div className="mt-1 text-xs text-red-400">Pasado</div>
              )}
              {isWeekendDay && isCurrentMonth && (
                <div className="mt-1 text-xs text-orange-400">Fin de semana</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Navigation header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* View switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes
            </button>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {getHeaderText()}
          </div>

          <button
            onClick={goToNext}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={goToToday}
            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Loading and error states */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando disponibilidad...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={refresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Calendar content */}
      {!loading && !error && (
        <>
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedCalendar;
