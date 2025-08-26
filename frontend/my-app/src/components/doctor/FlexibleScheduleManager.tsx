import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  X,
  CalendarDays,
  Settings,
  AlertCircle,
  CalendarX2
} from 'lucide-react';
import { toast } from 'react-toastify';
import InteractiveScheduleCalendar from './InteractiveScheduleCalendar';
import { scheduleUpdateService } from '../../services/scheduleUpdateService';
import { useAuth } from '../../context/AuthContext';

// Tipos y enums
export enum ScheduleType {
  SPECIFIC_DATE = 'specific_date',
  WEEKLY_RECURRING = 'weekly_recurring',
  MONTHLY_RECURRING = 'monthly_recurring',
  EXCEPTION = 'exception'
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label?: string;
}

export interface FlexibleSchedule {
  id?: number;
  scheduleType: ScheduleType;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  slotDuration: number;
  bufferTime: number;
  maxAppointments: number;
  notes?: string;
  reason?: string;
  priority: number;
}

interface FlexibleScheduleManagerProps {
  doctorId?: number;
  onSave?: (schedules: FlexibleSchedule[]) => void;
  onScheduleUpdate?: () => void; // Callback para notificar cambios al calendario principal
}

const FlexibleScheduleManager: React.FC<FlexibleScheduleManagerProps> = ({
  doctorId,
  onSave,
  onScheduleUpdate
}) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<FlexibleSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Lunes a Viernes por defecto
  const [showWorkingDaysConfig, setShowWorkingDaysConfig] = useState(false);

  const daysOfWeek = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Lunes', short: 'Lun' },
    { id: 2, name: 'Martes', short: 'Mar' },
    { id: 3, name: 'Miércoles', short: 'Mié' },
    { id: 4, name: 'Jueves', short: 'Jue' },
    { id: 5, name: 'Viernes', short: 'Vie' },
    { id: 6, name: 'Sábado', short: 'Sab' }
  ];

  // Plantillas predefinidas
  const scheduleTemplates = {
    standard: {
      name: 'Horario Estándar',
      description: 'Lunes a Viernes 8:00-12:00, 14:00-18:00',
      timeSlots: [
        { startTime: '08:00', endTime: '12:00', label: 'Mañana' },
        { startTime: '14:00', endTime: '18:00', label: 'Tarde' }
      ]
    },
    morning: {
      name: 'Solo Mañanas',
      description: 'Lunes a Viernes 7:00-13:00',
      timeSlots: [
        { startTime: '07:00', endTime: '13:00', label: 'Mañana' }
      ]
    },
    afternoon: {
      name: 'Solo Tardes',
      description: 'Lunes a Viernes 14:00-20:00',
      timeSlots: [
        { startTime: '14:00', endTime: '20:00', label: 'Tarde' }
      ]
    },
    extended: {
      name: 'Horario Extendido',
      description: 'Lunes a Sábado 7:00-19:00',
      timeSlots: [
        { startTime: '07:00', endTime: '12:00', label: 'Mañana' },
        { startTime: '14:00', endTime: '19:00', label: 'Tarde' }
      ]
    }
  };

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/doctor-availability/my-schedules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
        // Emitir evento de actualización para sincronizar con el calendario
        if (user?.id) {
          scheduleUpdateService.emitScheduleUpdate({
            type: 'schedule-updated',
            doctorId: Number(user.id),
            details: { action: 'schedules-loaded' }
          });
        }
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Error al cargar los horarios');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (doctorId) {
      loadSchedules();
    }
  }, [doctorId, loadSchedules]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveSchedule = async (schedule: FlexibleSchedule) => {
    try {
      const token = localStorage.getItem('token');
      const url = schedule.id 
        ? 'http://localhost:3000/doctor-availability/schedule'
        : 'http://localhost:3000/doctor-availability/schedule';
      
      const method = schedule.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schedule)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadSchedules(); // Recargar horarios
        return data.data;
      } else {
        throw new Error('Error al guardar horario');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Error al guardar el horario');
      throw error;
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/doctor-availability/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Horario eliminado exitosamente');
        loadSchedules();
        // Emitir evento de eliminación para sincronizar con el calendario
        if (user?.id) {
          scheduleUpdateService.emitScheduleDeleted(
            scheduleId,
            Number(user.id),
            { action: 'schedule-deleted' }
          );
        }
      } else {
        throw new Error('Error al eliminar horario');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Error al eliminar el horario');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applyTemplate = async (templateKey: keyof typeof scheduleTemplates) => {
    const template = scheduleTemplates[templateKey];
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/doctor-availability/weekly-standard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeSlots: template.timeSlots,
          slotDuration: 60,
          bufferTime: 0,
          maxAppointments: 8
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadSchedules();
        // Emitir evento de aplicación de plantilla para sincronizar con el calendario
        if (user?.id) {
          scheduleUpdateService.emitScheduleUpdate({
            type: 'schedule-updated',
            doctorId: Number(user.id),
            details: { action: 'template-applied' }
          });
        }
      } else {
        throw new Error('Error al aplicar plantilla');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Error al aplicar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const blockDates = async (startDate: string, endDate: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/doctor-availability/block-dates', {
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
        loadSchedules();
        // Emitir evento de bloqueo de fechas para sincronizar con el calendario
        if (user?.id) {
          scheduleUpdateService.emitScheduleUpdate({
            type: 'schedule-updated',
            doctorId: Number(user.id),
            details: { action: 'dates-blocked', startDate, endDate, reason }
          });
        }
      } else {
        throw new Error('Error al bloquear fechas');
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
      toast.error('Error al bloquear las fechas');
    }
  };

  const setSpecificDateSchedule = async (date: string, timeSlots: TimeSlot[], options: any = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/doctor-availability/specific-date', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          timeSlots,
          slotDuration: options.slotDuration || 60,
          bufferTime: options.bufferTime || 0,
          maxAppointments: options.maxAppointments || 8,
          notes: options.notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadSchedules();
        // Emitir evento de horario específico para sincronizar con el calendario
        if (user?.id) {
          scheduleUpdateService.emitScheduleUpdate({
            type: 'schedule-updated',
            doctorId: Number(user.id),
            details: { action: 'specific-date-set', date, timeSlots, options }
          });
        }
      } else {
        throw new Error('Error al configurar horario específico');
      }
    } catch (error) {
      console.error('Error setting specific date schedule:', error);
      toast.error('Error al configurar el horario específico');
    }
  };

  // Nueva función para configurar días laborales
  const setWorkingDaysSchedule = async (selectedDays: number[], timeSlots: TimeSlot[]) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Primero eliminar todos los horarios semanales existentes
      const weeklySchedules = schedules.filter(s => s.scheduleType === ScheduleType.WEEKLY_RECURRING);
      for (const schedule of weeklySchedules) {
        if (schedule.id) {
          await deleteSchedule(schedule.id);
        }
      }
      
      // Crear horarios para los días seleccionados
      for (const dayOfWeek of selectedDays) {
        const response = await fetch('http://localhost:3000/doctor-availability/weekly-schedule', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dayOfWeek,
            timeSlots,
            slotDuration: 60,
            bufferTime: 0,
            maxAppointments: 8
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error configurando horario para día ${dayOfWeek}`);
        }
      }
      
      // Bloquear permanentemente los días no seleccionados
      const blockedDays = [0, 1, 2, 3, 4, 5, 6].filter(day => !selectedDays.includes(day));
      for (const dayOfWeek of blockedDays) {
        const response = await fetch('http://localhost:3000/doctor-availability/block-weekly-day', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dayOfWeek,
            reason: `Día no laborable - Solo trabajo ${selectedDays.map(d => daysOfWeek[d].name).join(', ')}`
          })
        });
        
        if (!response.ok) {
          console.warn(`Error bloqueando día ${dayOfWeek}`);
        }
      }
      
      setWorkingDays(selectedDays);
      toast.success('Configuración de días laborales actualizada');
      loadSchedules();
      // Emitir evento de actualización de días laborales para sincronizar con el calendario
      if (user?.id) {
        scheduleUpdateService.emitScheduleUpdate({
          type: 'working-days-updated',
          doctorId: Number(user.id),
          details: { action: 'working-days-set', selectedDays, timeSlots }
        });
      }
      
    } catch (error) {
      console.error('Error setting working days:', error);
      toast.error('Error al configurar los días laborales');
    } finally {
      setSaving(false);
    }
  };

  // Componentes de UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const WeeklyScheduleTab = () => {
    const weeklySchedules = schedules.filter(s => s.scheduleType === ScheduleType.WEEKLY_RECURRING);

    return (
      <div className="space-y-6">
        {/* Horarios semanales configurados */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
            Horarios Semanales Configurados
          </h3>
          
          {weeklySchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay horarios semanales configurados</p>
              <p className="text-sm text-gray-400">Usa el botón "Configurar Días Laborales" para empezar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysOfWeek.map(day => {
                const daySchedule = weeklySchedules.find(s => s.dayOfWeek === day.id);
                return (
                  <div 
                    key={day.id} 
                    className={`p-4 rounded-lg border-2 ${
                      daySchedule 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{day.name}</h4>
                      {daySchedule && (
                        <button
                          onClick={() => deleteSchedule(daySchedule.id!)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {daySchedule ? (
                      <div className="space-y-1">
                        {daySchedule.timeSlots.map((slot, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {slot.startTime} - {slot.endTime}
                            {slot.label && <span className="ml-2 text-xs text-gray-500">({slot.label})</span>}
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-2">
                          Citas: {daySchedule.slotDuration}min | Máx: {daySchedule.maxAppointments}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Sin configurar</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const SpecificDateTab = () => {
    const [newDate, setNewDate] = useState(selectedDate);
    const [newTimeSlots, setNewTimeSlots] = useState<TimeSlot[]>([
      { startTime: '08:00', endTime: '12:00', label: 'Mañana' }
    ]);
    const [newNotes, setNewNotes] = useState('');

    const specificSchedules = schedules.filter(s => s.scheduleType === ScheduleType.SPECIFIC_DATE);

    const addTimeSlot = () => {
      setNewTimeSlots([...newTimeSlots, { startTime: '14:00', endTime: '18:00' }]);
    };

    const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
      const updated = [...newTimeSlots];
      updated[index][field] = value;
      setNewTimeSlots(updated);
    };

    const removeTimeSlot = (index: number) => {
      setNewTimeSlots(newTimeSlots.filter((_, i) => i !== index));
    };

    const handleSaveSpecificDate = async () => {
      if (newTimeSlots.length === 0) {
        toast.error('Debe agregar al menos un horario');
        return;
      }

      await setSpecificDateSchedule(newDate, newTimeSlots, { notes: newNotes });
      
      // Resetear formulario
      setNewTimeSlots([{ startTime: '08:00', endTime: '12:00', label: 'Mañana' }]);
      setNewNotes('');
    };

    return (
      <div className="space-y-6">
        {/* Formulario para nuevo horario específico */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 text-green-500 mr-2" />
            Configurar Horario Específico
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horarios de Atención
              </label>
              <div className="space-y-2">
                {newTimeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-500">hasta</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    {newTimeSlots.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addTimeSlot}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar horario</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: Horario especial por conferencia médica"
              />
            </div>

            <button
              onClick={handleSaveSpecificDate}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Horario Específico</span>
            </button>
          </div>
        </div>

        {/* Lista de horarios específicos configurados */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
            Horarios Específicos Configurados
          </h3>
          
          {specificSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay horarios específicos configurados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {specificSchedules.map(schedule => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {new Date(schedule.startDate!).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteSchedule(schedule.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    {schedule.timeSlots.map((slot, index) => (
                      <div key={index} className="text-sm text-gray-700 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.startTime} - {slot.endTime}
                        {slot.label && <span className="ml-2 text-xs text-gray-500">({slot.label})</span>}
                      </div>
                    ))}
                  </div>
                  
                  {schedule.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Notas:</span> {schedule.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const BlockDatesTab = () => {
    const [blockStartDate, setBlockStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [blockEndDate, setBlockEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [blockReason, setBlockReason] = useState('');

    const blockedSchedules = schedules.filter(s => s.scheduleType === ScheduleType.EXCEPTION);

    const handleBlockDates = async () => {
      if (!blockReason.trim()) {
        toast.error('Debe especificar un motivo para el bloqueo');
        return;
      }

      await blockDates(blockStartDate, blockEndDate, blockReason);
      
      // Resetear formulario
      setBlockReason('');
    };

    return (
      <div className="space-y-6">
        {/* Formulario para bloquear fechas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarX2 className="h-5 w-5 text-red-500 mr-2" />
            Bloquear Fechas
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={blockStartDate}
                  onChange={(e) => setBlockStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                  min={blockStartDate}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del bloqueo
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Ej: Vacaciones, Conferencia médica, Emergencia personal"
              />
            </div>

            <button
              onClick={handleBlockDates}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CalendarX2 className="h-4 w-4" />
              <span>Bloquear Fechas</span>
            </button>
          </div>
        </div>

        {/* Lista de fechas bloqueadas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            Fechas Bloqueadas
          </h3>
          
          {blockedSchedules.length === 0 ? (
            <div className="text-center py-8">
              <CalendarX2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay fechas bloqueadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedSchedules.map(schedule => (
                <div key={schedule.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CalendarX2 className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-gray-900">
                        {new Date(schedule.startDate!).toLocaleDateString('es-ES')}
                        {schedule.endDate && schedule.startDate !== schedule.endDate && (
                          <span> - {new Date(schedule.endDate).toLocaleDateString('es-ES')}</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteSchedule(schedule.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {schedule.reason && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Motivo:</span> {schedule.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleScheduleChange = (updatedSchedules: any[]) => {
    setSchedules(updatedSchedules);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gestión de Disponibilidad</h1>
                <p className="text-slate-200">Configura tus horarios de manera súper flexible con el calendario interactivo</p>
              </div>
            </div>
            <button
              onClick={() => setShowWorkingDaysConfig(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configurar Días Laborales</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Interactive Calendar */}
          <div className="lg:col-span-2">
            <InteractiveScheduleCalendar
              schedules={schedules}
              onDateSelect={handleDateSelect}
              onScheduleChange={handleScheduleChange}
              onSaveSchedule={async (scheduleData) => {
                try {
                  await setSpecificDateSchedule(
                    scheduleData.date,
                    scheduleData.timeSlots,
                    {
                      slotDuration: scheduleData.slotDuration,
                      bufferTime: scheduleData.bufferTime,
                      maxAppointments: scheduleData.maxAppointments,
                      notes: scheduleData.notes
                    }
                  );
                } catch (error) {
                  throw error;
                }
              }}
              onDeleteSchedule={async (scheduleId) => {
                try {
                  await deleteSchedule(scheduleId);
                } catch (error) {
                  throw error;
                }
              }}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Resumen de Horarios */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Horarios Semanales</span>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {schedules.filter(s => s.scheduleType === 'weekly_recurring').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Horarios Específicos</span>
                  </div>
                  <span className="text-sm font-bold text-blue-700">
                    {schedules.filter(s => s.scheduleType === 'specific_date').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Fechas Bloqueadas</span>
                  </div>
                  <span className="text-sm font-bold text-red-700">
                    {schedules.filter(s => s.scheduleType === 'exception').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Gestión de Restricciones */}
            {schedules.filter(s => s.scheduleType === 'exception').length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarX2 className="h-5 w-5 text-red-500 mr-2" />
                  Gestión de Restricciones
                </h3>
                
                <div className="space-y-3 mb-4">
                  {schedules.filter(s => s.scheduleType === 'exception').slice(0, 3).map(schedule => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2">
                        <CalendarX2 className="h-4 w-4 text-red-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(schedule.startDate!).toLocaleDateString('es-ES')}
                            {schedule.endDate && schedule.startDate !== schedule.endDate && (
                              <span> - {new Date(schedule.endDate).toLocaleDateString('es-ES')}</span>
                            )}
                          </span>
                          {schedule.reason && (
                            <p className="text-xs text-gray-600">{schedule.reason}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSchedule(schedule.id!)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Quitar restricción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {schedules.filter(s => s.scheduleType === 'exception').length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{schedules.filter(s => s.scheduleType === 'exception').length - 3} restricciones más
                    </p>
                  )}
                </div>
                
                <button
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `¿Estás seguro de que quieres eliminar TODAS las ${schedules.filter(s => s.scheduleType === 'exception').length} restricciones? Esta acción no se puede deshacer.`
                    );
                    if (confirmed) {
                      try {
                        setSaving(true);
                        const blockedSchedules = schedules.filter(s => s.scheduleType === 'exception');
                        for (const schedule of blockedSchedules) {
                          if (schedule.id) {
                            await deleteSchedule(schedule.id);
                          }
                        }
                        toast.success('Todas las restricciones han sido eliminadas');
                      } catch (error) {
                        toast.error('Error al eliminar las restricciones');
                      } finally {
                        setSaving(false);
                      }
                    }
                  }}
                  disabled={saving}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Quitar Todas las Restricciones</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>


        
        {/* Modal para configurar días laborales */}
        {showWorkingDaysConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-6 w-6 text-gray-600 mr-2" />
                  Configurar Días Laborales
                </h3>
                <button
                  onClick={() => setShowWorkingDaysConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona los días de la semana en los que trabajas. Los días no seleccionados 
                  se bloquearán automáticamente para que no se puedan agendar citas.
                </p>
                
                <div className="space-y-2">
                  {daysOfWeek.map(day => (
                    <label key={day.id} className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workingDays.includes(day.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkingDays([...workingDays, day.id]);
                          } else {
                            setWorkingDays(workingDays.filter(d => d !== day.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{day.name}</span>
                      {day.id === 0 || day.id === 6 ? (
                        <span className="ml-2 text-xs text-gray-500">(Fin de semana)</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Horario para los días seleccionados:
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Turno Mañana</label>
                    <div className="flex items-center space-x-2 bg-amber-50 p-2 rounded-md border border-amber-200">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <input
                        type="time"
                        defaultValue="08:00"
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1"
                        id="morning-start"
                      />
                      <span className="text-gray-500 text-xs">hasta</span>
                      <input
                        type="time"
                        defaultValue="12:00"
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1"
                        id="morning-end"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Turno Tarde</label>
                    <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-md border border-blue-200">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <input
                        type="time"
                        defaultValue="14:00"
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1"
                        id="afternoon-start"
                      />
                      <span className="text-gray-500 text-xs">hasta</span>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1"
                        id="afternoon-end"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-600">
                      💡 <strong>Consejo:</strong> Estos horarios se aplicarán a todos los días seleccionados. 
                      Los días no marcados se bloquearán automáticamente.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowWorkingDaysConfig(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (workingDays.length === 0) {
                      toast.error('Debe seleccionar al menos un día laborable');
                      return;
                    }
                    
                    const morningStartEl = document.getElementById('morning-start') as HTMLInputElement;
                    const morningEndEl = document.getElementById('morning-end') as HTMLInputElement;
                    const afternoonStartEl = document.getElementById('afternoon-start') as HTMLInputElement;
                    const afternoonEndEl = document.getElementById('afternoon-end') as HTMLInputElement;
                    
                    if (!morningStartEl?.value || !morningEndEl?.value || !afternoonStartEl?.value || !afternoonEndEl?.value) {
                      toast.error('Por favor complete todos los horarios');
                      return;
                    }
                    
                    // Validar que los horarios tengan sentido
                    if (morningStartEl.value >= morningEndEl.value) {
                      toast.error('La hora de inicio de la mañana debe ser anterior a la hora de fin');
                      return;
                    }
                    
                    if (afternoonStartEl.value >= afternoonEndEl.value) {
                      toast.error('La hora de inicio de la tarde debe ser anterior a la hora de fin');
                      return;
                    }
                    
                    if (morningEndEl.value > afternoonStartEl.value) {
                      toast.error('Debe haber un descanso entre el turno de mañana y tarde');
                      return;
                    }
                    
                    const timeSlots = [
                      { startTime: morningStartEl.value, endTime: morningEndEl.value, label: 'Mañana' },
                      { startTime: afternoonStartEl.value, endTime: afternoonEndEl.value, label: 'Tarde' }
                    ];
                    
                    console.log('Configurando días laborales:', {
                      workingDays,
                      timeSlots
                    });
                    
                    setWorkingDaysSchedule(workingDays, timeSlots);
                    setShowWorkingDaysConfig(false);
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Configurando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Aplicar Configuración
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlexibleScheduleManager;
