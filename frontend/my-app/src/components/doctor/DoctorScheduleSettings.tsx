import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface DaySchedule {
  day_of_week: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
}

interface DoctorScheduleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
}

const DAYS_OF_WEEK = [
  { key: 'Monday', label: 'Lunes' },
  { key: 'Tuesday', label: 'Martes' },
  { key: 'Wednesday', label: 'Miércoles' },
  { key: 'Thursday', label: 'Jueves' },
  { key: 'Friday', label: 'Viernes' },
  { key: 'Saturday', label: 'Sábado' },
  { key: 'Sunday', label: 'Domingo' },
];

const DoctorScheduleSettings: React.FC<DoctorScheduleSettingsProps> = ({
  isOpen,
  onClose,
  doctorId
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map(day => ({
      day_of_week: day.key,
      is_active: false,
      start_time: '08:00',
      end_time: '18:00',
      break_start: '12:00',
      break_end: '13:00',
    }))
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar horarios existentes del doctor
  const loadSchedules = async () => {
    try {
      setLoading(true);
      // Aquí implementarías la llamada al API
      // const data = await doctorAvailabilityService.getAvailability(doctorId);
      // setSchedules(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar horarios
  const saveSchedules = async () => {
    try {
      setSaving(true);
      // Aquí implementarías la llamada al API
      // await doctorAvailabilityService.updateAvailability(doctorId, schedules);
      console.log('Guardando horarios:', schedules);
      alert('Horarios guardados exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      alert('Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  // Actualizar horario de un día específico
  const updateDaySchedule = (dayKey: string, field: keyof DaySchedule, value: any) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day_of_week === dayKey 
        ? { ...schedule, [field]: value }
        : schedule
    ));
  };

  // Aplicar horario a todos los días laborales
  const applyToWorkDays = () => {
    const workDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const templateSchedule = schedules.find(s => s.is_active);
    
    if (!templateSchedule) {
      alert('Primero configura al menos un día como plantilla');
      return;
    }

    setSchedules(prev => prev.map(schedule => 
      workDays.includes(schedule.day_of_week)
        ? { 
            ...schedule, 
            is_active: true,
            start_time: templateSchedule.start_time,
            end_time: templateSchedule.end_time,
            break_start: templateSchedule.break_start,
            break_end: templateSchedule.break_end,
          }
        : schedule
    ));
  };

  // Desactivar todos los días
  const deactivateAll = () => {
    setSchedules(prev => prev.map(schedule => ({ ...schedule, is_active: false })));
  };

  useEffect(() => {
    if (isOpen && doctorId) {
      loadSchedules();
    }
  }, [isOpen, doctorId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Configurar Horarios de Atención
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Define tus horarios semanales y días libres
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando horarios...</p>
              </div>
            ) : (
              <>
                {/* Botones de acción rápida */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    onClick={applyToWorkDays}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Aplicar a días laborales (L-V)
                  </button>
                  <button
                    onClick={deactivateAll}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Desactivar todos
                  </button>
                </div>

                {/* Configuración por día */}
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const schedule = schedules.find(s => s.day_of_week === day.key);
                    if (!schedule) return null;

                    return (
                      <div key={day.key} className={`border rounded-lg p-4 ${schedule.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">{day.label}</h3>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={schedule.is_active}
                              onChange={(e) => updateDaySchedule(day.key, 'is_active', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              {schedule.is_active ? 'Disponible' : 'Día libre'}
                            </span>
                          </label>
                        </div>

                        {schedule.is_active && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Hora de inicio */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hora inicio
                              </label>
                              <input
                                type="time"
                                value={schedule.start_time}
                                onChange={(e) => updateDaySchedule(day.key, 'start_time', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            {/* Hora de fin */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hora fin
                              </label>
                              <input
                                type="time"
                                value={schedule.end_time}
                                onChange={(e) => updateDaySchedule(day.key, 'end_time', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            {/* Inicio descanso */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descanso inicio
                              </label>
                              <input
                                type="time"
                                value={schedule.break_start || ''}
                                onChange={(e) => updateDaySchedule(day.key, 'break_start', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            {/* Fin descanso */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descanso fin
                              </label>
                              <input
                                type="time"
                                value={schedule.break_end || ''}
                                onChange={(e) => updateDaySchedule(day.key, 'break_end', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Información del día */}
                        {schedule.is_active && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-700">
                              <strong>Horario:</strong> {schedule.start_time} - {schedule.end_time}
                              {schedule.break_start && schedule.break_end && (
                                <span> (Descanso: {schedule.break_start} - {schedule.break_end})</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Consejos:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Los pacientes solo podrán agendar citas en los días y horarios que marques como disponibles</li>
                    <li>• El tiempo de descanso se bloqueará automáticamente para citas</li>
                    <li>• Puedes usar "Aplicar a días laborales" para configurar rápidamente L-V</li>
                    <li>• Los cambios se aplican inmediatamente a tu calendario</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={saveSchedules}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Horarios'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorScheduleSettings;
