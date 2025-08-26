import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
  Edit,
  Trash2,
  CalendarDays,
  CalendarX2,
  CalendarRange
} from 'lucide-react';
import { toast } from 'react-toastify';
import ScheduleEditorModal from './ScheduleEditorModal';

// Types
interface TimeSlot {
  startTime: string;
  endTime: string;
  label?: string;
}

interface ScheduleEvent {
  id?: number;
  date: string;
  timeSlots: TimeSlot[];
  type: 'weekly' | 'specific' | 'blocked';
  reason?: string;
  notes?: string;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  hasSchedule: boolean;
  scheduleType?: 'weekly' | 'specific' | 'blocked';
  scheduleData?: ScheduleEvent;
}

interface InteractiveScheduleCalendarProps {
  schedules: any[];
  onDateSelect: (date: string) => void;
  onScheduleChange: (schedules: any[]) => void;
  onSaveSchedule?: (scheduleData: any) => Promise<void>;
  onDeleteSchedule?: (scheduleId: number) => Promise<void>;
}

const InteractiveScheduleCalendar: React.FC<InteractiveScheduleCalendarProps> = ({
  schedules,
  onDateSelect,
  onScheduleChange,
  onSaveSchedule,
  onDeleteSchedule
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [modalScheduleData, setModalScheduleData] = useState<any>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      // Check if date has a schedule
      const hasWeeklySchedule = schedules.some(s => 
        s.scheduleType === 'weekly_recurring' && s.dayOfWeek === date.getDay()
      );
      const hasSpecificSchedule = schedules.some(s => 
        s.scheduleType === 'specific_date' && s.startDate === dateString
      );
      const hasBlockedSchedule = schedules.some(s => 
        s.scheduleType === 'exception' && 
        ((s.startDate === dateString) || 
         (s.startDate <= dateString && s.endDate >= dateString))
      );

      let scheduleType: 'weekly' | 'specific' | 'blocked' | undefined;
      let scheduleData: ScheduleEvent | undefined;

      if (hasBlockedSchedule) {
        scheduleType = 'blocked';
        const blockedSchedule = schedules.find(s => 
          s.scheduleType === 'exception' && 
          ((s.startDate === dateString) || 
           (s.startDate <= dateString && s.endDate >= dateString))
        );
        if (blockedSchedule) {
          scheduleData = {
            id: blockedSchedule.id,
            date: dateString,
            timeSlots: [],
            type: 'blocked',
            reason: blockedSchedule.reason
          };
        }
      } else if (hasSpecificSchedule) {
        scheduleType = 'specific';
        const specificSchedule = schedules.find(s => 
          s.scheduleType === 'specific_date' && s.startDate === dateString
        );
        if (specificSchedule) {
          scheduleData = {
            id: specificSchedule.id,
            date: dateString,
            timeSlots: specificSchedule.timeSlots || [],
            type: 'specific',
            notes: specificSchedule.notes
          };
        }
      } else if (hasWeeklySchedule) {
        scheduleType = 'weekly';
        const weeklySchedule = schedules.find(s => 
          s.scheduleType === 'weekly_recurring' && s.dayOfWeek === date.getDay()
        );
        if (weeklySchedule) {
          scheduleData = {
            id: weeklySchedule.id,
            date: dateString,
            timeSlots: weeklySchedule.timeSlots || [],
            type: 'weekly'
          };
        }
      }

      days.push({
        date,
        dateString,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        hasSchedule: hasWeeklySchedule || hasSpecificSchedule || hasBlockedSchedule,
        scheduleType,
        scheduleData
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDate(day.dateString);
    onDateSelect(day.dateString);
    
    setShowQuickActions(true);
  };

  const getDateStyle = (day: CalendarDay): string => {
    let baseStyle = "w-full h-16 p-1 border border-gray-100 text-left transition-all duration-200 hover:bg-slate-50 relative";
    
    if (!day.isCurrentMonth) {
      baseStyle += " text-gray-300 bg-gray-50";
    } else if (day.isToday) {
      baseStyle += " bg-slate-100 text-slate-900 font-semibold";
    } else if (day.isWeekend) {
      baseStyle += " bg-gray-50";
    }

    if (day.dateString === selectedDate) {
      baseStyle += " ring-2 ring-slate-500 bg-slate-100";
    }

    return baseStyle;
  };

  const getScheduleIndicator = (day: CalendarDay) => {
    if (!day.hasSchedule || !day.scheduleType) return null;

    const indicators = {
      weekly: 'bg-green-400',
      specific: 'bg-blue-400',
      blocked: 'bg-red-400'
    };

    return (
      <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${indicators[day.scheduleType]}`} />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatTimeSlots = (timeSlots: TimeSlot[]): string => {
    if (!timeSlots.length) return 'Sin horarios';
    return timeSlots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ');
  };

  // Función para obtener el rango de fechas de la semana (7 días consecutivos desde fecha seleccionada)
  const getWeekRange = (date: string): { startDate: string; endDate: string } => {
    const selectedDate = new Date(date);
    
    // Inicio: el día seleccionado
    const startOfWeek = new Date(selectedDate);
    
    // Fin: 6 días después del día seleccionado (total 7 días)
    const endOfWeek = new Date(selectedDate);
    endOfWeek.setDate(selectedDate.getDate() + 6);
    
    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    };
  };

  // Función para obtener el rango de fechas del mes
  const getMonthRange = (date: string): { startDate: string; endDate: string } => {
    const selectedDate = new Date(date);
    
    // Primer día del mes
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    
    // Último día del mes
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    };
  };

  // Función para bloquear un rango de fechas
  const blockDateRange = async (startDate: string, endDate: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/doctor-availability/block-dates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
          notifyPatients: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        // Recargar los horarios
        onScheduleChange([]);
        setShowQuickActions(false);
      } else {
        throw new Error('Error al bloquear las fechas');
      }
    } catch (error) {
      console.error('Error blocking date range:', error);
      toast.error('Error al bloquear las fechas');
    }
  };

  const QuickActionsPanel = () => {
    if (!showQuickActions || !selectedDate) return null;

    const selectedDay = calendarDays.find(day => day.dateString === selectedDate);
    
    return (
      <div className="absolute top-0 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDay?.date.toLocaleDateString('es-ES', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {selectedDay?.scheduleType && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                selectedDay.scheduleType === 'weekly' ? 'bg-green-100 text-green-800' :
                selectedDay.scheduleType === 'specific' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedDay.scheduleType === 'weekly' ? 'Horario Semanal' :
                 selectedDay.scheduleType === 'specific' ? 'Horario Específico' :
                 'Bloqueado'}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowQuickActions(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {selectedDay?.hasSchedule && selectedDay?.scheduleData ? (
          <div className="space-y-4">
            {selectedDay.scheduleType === 'blocked' ? (
              <div>
                <p className="text-sm font-medium text-red-800 mb-2">
                  Fecha bloqueada
                </p>
                {selectedDay.scheduleData.reason && (
                  <p className="text-sm text-gray-600 bg-red-50 p-2 rounded">
                    <strong>Motivo:</strong> {selectedDay.scheduleData.reason}
                  </p>
                )}
                <button
                  onClick={async () => {
                    if (selectedDay.scheduleData?.id && onDeleteSchedule) {
                      const confirmed = window.confirm('¿Estás seguro de que quieres desbloquear esta fecha?');
                      if (confirmed) {
                        try {
                          await onDeleteSchedule(selectedDay.scheduleData.id);
                          setShowQuickActions(false);
                        } catch (error: any) {
                          toast.error(error.message || 'Error al desbloquear la fecha');
                        }
                      }
                    }
                  }}
                  className="w-full mt-3 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Desbloquear Fecha
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Horarios configurados:
                </p>
                <div className="space-y-2">
                  {selectedDay.scheduleData.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center text-sm bg-gray-50 p-2 rounded">
                      <Clock className="h-3 w-3 mr-2 text-gray-400" />
                      {slot.startTime} - {slot.endTime}
                      {slot.label && <span className="ml-2 text-xs text-gray-500">({slot.label})</span>}
                    </div>
                  ))}
                </div>
                
                {selectedDay.scheduleData.notes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notas:</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      {selectedDay.scheduleData.notes}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => {
                      if (selectedDay.scheduleData) {
                        setModalScheduleData({
                          id: selectedDay.scheduleData.id,
                          timeSlots: selectedDay.scheduleData.timeSlots,
                          notes: selectedDay.scheduleData.notes,
                          type: selectedDay.scheduleType
                        });
                        setShowEditorModal(true);
                        setShowQuickActions(false);
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedDay.scheduleData?.id && onDeleteSchedule) {
                        const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este horario?');
                        if (confirmed) {
                          try {
                            await onDeleteSchedule(selectedDay.scheduleData.id);
                            setShowQuickActions(false);
                          } catch (error: any) {
                            toast.error(error.message || 'Error al eliminar el horario');
                          }
                        }
                      }
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              No hay horarios configurados para esta fecha.
            </p>
            
            {/* Botón para agregar horario específico */}
            <button
              onClick={() => {
                setModalScheduleData(null);
                setShowEditorModal(true);
                setShowQuickActions(false);
              }}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar Horario Específico
            </button>

            {/* Divisor */}
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Opciones de bloqueo:</p>
            </div>
            
            {/* Botones de bloqueo */}
            <div className="space-y-2">
              <button
                onClick={async () => {
                  if (!selectedDate) return;
                  const confirmed = window.confirm('¿Estás seguro de que quieres bloquear esta fecha específica?');
                  if (confirmed) {
                    const reason = prompt('Motivo del bloqueo:');
                    if (reason) {
                      await blockDateRange(selectedDate, selectedDate, reason);
                    }
                  }
                }}
                className="w-full bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
              >
                <CalendarX2 className="h-3 w-3 mr-1" />
                Bloquear Solo Este Día
              </button>
              
              <button
                onClick={async () => {
                  if (!selectedDate) return;
                  const weekRange = getWeekRange(selectedDate);
                  const startDate = new Date(weekRange.startDate).toLocaleDateString('es-ES');
                  const endDate = new Date(weekRange.endDate).toLocaleDateString('es-ES');
                  const confirmed = window.confirm(`¿Estás seguro de que quieres bloquear 7 días consecutivos del ${startDate} al ${endDate}?`);
                  if (confirmed) {
                    const reason = prompt('Motivo del bloqueo de los 7 días:');
                    if (reason) {
                      await blockDateRange(weekRange.startDate, weekRange.endDate, reason);
                    }
                  }
                }}
                className="w-full bg-orange-600 text-white py-2 px-3 rounded-md hover:bg-orange-700 transition-colors text-sm flex items-center justify-center"
              >
                <CalendarRange className="h-3 w-3 mr-1" />
                Bloquear 7 Días Consecutivos
              </button>
              
              <button
                onClick={async () => {
                  if (!selectedDate) return;
                  const monthRange = getMonthRange(selectedDate);
                  const month = new Date(selectedDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                  const confirmed = window.confirm(`¿Estás seguro de que quieres bloquear todo el mes de ${month}?`);
                  if (confirmed) {
                    const reason = prompt('Motivo del bloqueo del mes:');
                    if (reason) {
                      await blockDateRange(monthRange.startDate, monthRange.endDate, reason);
                    }
                  }
                }}
                className="w-full bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center justify-center"
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Bloquear Mes Completo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-slate-200 text-sm">
              Haz clic en cualquier día para configurar horarios
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={getDateStyle(day)}
              disabled={!day.isCurrentMonth}
            >
              <div className="text-sm font-medium">{day.date.getDate()}</div>
              {day.hasSchedule && day.scheduleData && (
                <div className="text-xs mt-1 truncate">
                  {day.scheduleType === 'blocked' 
                    ? '🚫 Bloqueado' 
                    : `⏰ ${day.scheduleData.timeSlots.length} horarios`
                  }
                </div>
              )}
              {getScheduleIndicator(day)}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            <span>Horario Semanal</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
            <span>Horario Específico</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            <span>Bloqueado</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <QuickActionsPanel />
      
      {/* Schedule Editor Modal */}
      <ScheduleEditorModal
        isOpen={showEditorModal}
        onClose={() => {
          setShowEditorModal(false);
          setModalScheduleData(null);
        }}
        selectedDate={selectedDate || ''}
        existingSchedule={modalScheduleData}
        onSave={async (scheduleData) => {
          if (onSaveSchedule) {
            await onSaveSchedule(scheduleData);
          }
        }}
        onDelete={onDeleteSchedule}
      />
    </div>
  );
};

export default InteractiveScheduleCalendar;
