import React, { useState, useEffect } from 'react';

interface MiniCalendarProps {
  currentDate: Date;  // Fecha que está siendo mostrada en el calendario principal
  onDateSelect: (date: Date) => void;  // Callback para navegar el calendario principal
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, onDateSelect }) => {
  // El mes que se está mostrando en el mini calendario (puede ser diferente al currentDate)
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date(currentDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  // Fecha de hoy para resaltar
  const today = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  // Sincronizar mini calendario cuando el calendario principal navegue
  useEffect(() => {
    const newMonth = currentDate.getMonth();
    const newYear = currentDate.getFullYear();
    
    setViewDate(prevViewDate => {
      if (prevViewDate.getMonth() !== newMonth || prevViewDate.getFullYear() !== newYear) {
        return new Date(newYear, newMonth, 1);
      }
      return prevViewDate;
    });
  }, [currentDate]);

  // Generar calendario exactamente como Google Calendar
  const generateCalendarDays = () => {
    const days = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = domingo
    
    // Último día del mes anterior
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = daysInPrevMonth - (startingDayOfWeek - 1 - i);
      const date = new Date(prevYear, prevMonth, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isNextMonth: false,
        isPrevMonth: true
      });
    }
    
    // Días del mes actual
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isNextMonth: false,
        isPrevMonth: false
      });
    }
    
    // Días del mes siguiente (para completar 42 días = 6 semanas)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(nextYear, nextMonth, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isNextMonth: true,
        isPrevMonth: false
      });
    }
    
    return days;
  };

  // Navegación de meses en el mini calendario
  const goToPreviousMonth = () => {
    setViewDate(prevViewDate => {
      const newViewDate = new Date(prevViewDate.getFullYear(), prevViewDate.getMonth() - 1, 1);
      
      // Para navegación por flechas del mini calendario, navegar al día 15 del mes (centro del mes)
      // Esto asegura que el calendario principal muestre el mes completo
      const newTargetDate = new Date(newViewDate.getFullYear(), newViewDate.getMonth(), 15);
      
      // Notificar al calendario principal para que navegue también
      onDateSelect(newTargetDate);
      
      return newViewDate;
    });
  };

  const goToNextMonth = () => {
    setViewDate(prevViewDate => {
      const newViewDate = new Date(prevViewDate.getFullYear(), prevViewDate.getMonth() + 1, 1);
      
      // Para navegación por flechas del mini calendario, navegar al día 15 del mes (centro del mes)
      // Esto asegura que el calendario principal muestre el mes completo
      const newTargetDate = new Date(newViewDate.getFullYear(), newViewDate.getMonth(), 15);
      
      // Notificar al calendario principal para que navegue también
      onDateSelect(newTargetDate);
      
      return newViewDate;
    });
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  // Verificar si una fecha es la fecha activa en el calendario principal
  const isSelectedDate = (date: Date) => {
    const compareDate = new Date(date);
    const currentCompare = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    currentCompare.setHours(0, 0, 0, 0);
    return compareDate.getTime() === currentCompare.getTime();
  };

  // Obtener nombre del mes en español
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="w-full">
      {/* Header con navegación de mes - estilo Google Calendar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
          title="Mes anterior"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-sm font-medium text-gray-700 capitalize">
          {getMonthName(viewDate)}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
          title="Mes siguiente"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grilla del calendario - estilo Google Calendar */}
      <div className="p-2">
        {/* Headers de días de la semana */}
        <div className="grid grid-cols-7 mb-1">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
            <div key={`${day}-${index}`} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((dayInfo, index) => {
            const isCurrentMonth = dayInfo.isCurrentMonth;
            const isTodayDate = isToday(dayInfo.date);
            const isSelected = isSelectedDate(dayInfo.date);
            
            return (
              <button
                key={`${dayInfo.date.getFullYear()}-${dayInfo.date.getMonth()}-${dayInfo.date.getDate()}`}
                onClick={() => {
                  // Al hacer clic en cualquier día, navegar el calendario principal a esa fecha
                  onDateSelect(dayInfo.date);
                }}
                className={`
                  w-8 h-8 text-xs flex items-center justify-center transition-all duration-150 rounded-full
                  ${!isCurrentMonth ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}
                  ${isTodayDate && !isSelected ? 'bg-blue-600 text-white font-medium' : ''}
                  ${isSelected && !isTodayDate ? 'bg-blue-100 text-blue-700 font-medium' : ''}
                  ${isTodayDate && isSelected ? 'bg-blue-700 text-white font-medium' : ''}
                `}
                title={`Navegar a ${dayInfo.date.toLocaleDateString('es', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`}
              >
                {dayInfo.day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
