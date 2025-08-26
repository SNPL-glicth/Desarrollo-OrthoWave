import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus, Save, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface TimeSlot {
  startTime: string;
  endTime: string;
  id?: number;
}

interface DayAvailability {
  dayOfWeek: number;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface DoctorAvailabilityManagerProps {
  doctorId?: number;
  onSave?: (availability: DayAvailability[]) => void;
}

const daysOfWeek = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sab' }
];

const DoctorAvailabilityManager: React.FC<DoctorAvailabilityManagerProps> = ({
  doctorId,
  onSave
}) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadDoctorAvailability = useCallback(async () => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/doctor-availability/my-availability`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedAvailability = daysOfWeek.map(day => {
          const dayData = data.find((d: any) => d.dayOfWeek === day.id);
          return {
            dayOfWeek: day.id,
            isActive: dayData?.isActive || false,
            timeSlots: dayData?.timeSlots || []
          };
        });
        setAvailability(formattedAvailability);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // Inicializar disponibilidad vacía
  useEffect(() => {
    const initialAvailability = daysOfWeek.map(day => ({
      dayOfWeek: day.id,
      isActive: false,
      timeSlots: []
    }));
    setAvailability(initialAvailability);
    
    if (doctorId) {
      loadDoctorAvailability();
    }
  }, [doctorId, loadDoctorAvailability]);

  const toggleDayActive = (dayOfWeek: number) => {
    setAvailability(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek 
        ? { ...day, isActive: !day.isActive, timeSlots: !day.isActive ? [] : day.timeSlots }
        : day
    ));
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: TimeSlot = {
      startTime: '09:00',
      endTime: '17:00'
    };

    setAvailability(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek 
        ? { ...day, timeSlots: [...day.timeSlots, newSlot] }
        : day
    ));
  };

  const updateTimeSlot = (dayOfWeek: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek 
        ? {
            ...day,
            timeSlots: day.timeSlots.map((slot, index) => 
              index === slotIndex ? { ...slot, [field]: value } : slot
            )
          }
        : day
    ));
  };

  const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    setAvailability(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek 
        ? { ...day, timeSlots: day.timeSlots.filter((_, index) => index !== slotIndex) }
        : day
    ));
  };

  const validateTimeSlots = (timeSlots: TimeSlot[]): boolean => {
    for (const slot of timeSlots) {
      if (slot.startTime >= slot.endTime) {
        toast.error('La hora de inicio debe ser anterior a la hora de fin');
        return false;
      }
    }

    // Verificar solapamientos
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (
          (slot1.startTime < slot2.endTime && slot1.endTime > slot2.startTime) ||
          (slot2.startTime < slot1.endTime && slot2.endTime > slot1.startTime)
        ) {
          toast.error('Los horarios no pueden solaparse');
          return false;
        }
      }
    }

    return true;
  };

  const saveAvailability = async () => {
    // Validar horarios
    for (const day of availability) {
      if (day.isActive && !validateTimeSlots(day.timeSlots)) {
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Guardar cada día por separado
      for (const day of availability) {
        if (day.isActive && day.timeSlots.length > 0) {
          // Activar el día
          await fetch(`http://localhost:3000/doctor-availability/toggle-day/${day.dayOfWeek}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: true })
          });

          // Crear rangos de tiempo
          for (const slot of day.timeSlots) {
            await fetch(`http://localhost:3000/doctor-availability/create-range`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                dayOfWeek: day.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime
              })
            });
          }
        } else {
          // Desactivar el día
          await fetch(`http://localhost:3000/doctor-availability/toggle-day/${day.dayOfWeek}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: false })
          });
        }
      }

      toast.success('Disponibilidad guardada exitosamente');
      if (onSave) {
        onSave(availability);
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Error al guardar la disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  const createQuickSchedule = (type: 'morning' | 'afternoon' | 'full') => {
    const schedules = {
      morning: [{ startTime: '08:00', endTime: '12:00' }],
      afternoon: [{ startTime: '14:00', endTime: '18:00' }],
      full: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '18:00' }
      ]
    };

    // Aplicar a días laborables (Lunes a Viernes)
    setAvailability(prev => prev.map(day => 
      day.dayOfWeek >= 1 && day.dayOfWeek <= 5
        ? { ...day, isActive: true, timeSlots: schedules[type] }
        : day
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Disponibilidad</h2>
        </div>
        <button
          onClick={saveAvailability}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>

      {/* Horarios rápidos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Configuración Rápida (Lunes a Viernes)</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => createQuickSchedule('morning')}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Mañana (8:00 - 12:00)
          </button>
          <button
            onClick={() => createQuickSchedule('afternoon')}
            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Tarde (14:00 - 18:00)
          </button>
          <button
            onClick={() => createQuickSchedule('full')}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Completo (8:00-12:00, 14:00-18:00)
          </button>
        </div>
      </div>

      {/* Configuración por días */}
      <div className="space-y-4">
        {daysOfWeek.map(day => {
          const dayAvailability = availability.find(a => a.dayOfWeek === day.id);
          if (!dayAvailability) return null;

          return (
            <div key={day.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleDayActive(day.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      dayAvailability.isActive
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {dayAvailability.isActive && <Check className="h-4 w-4" />}
                  </button>
                  <h3 className="text-lg font-semibold text-gray-700">{day.name}</h3>
                </div>
                
                {dayAvailability.isActive && (
                  <button
                    onClick={() => addTimeSlot(day.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Horario</span>
                  </button>
                )}
              </div>

              {dayAvailability.isActive && (
                <div className="space-y-2 ml-9">
                  {dayAvailability.timeSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay horarios configurados</p>
                  ) : (
                    dayAvailability.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(day.id, index, 'startTime', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <span className="text-gray-500">hasta</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(day.id, index, 'endTime', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => removeTimeSlot(day.id, index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Información importante:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Los horarios no pueden solaparse en el mismo día</li>
          <li>• La hora de inicio debe ser anterior a la hora de fin</li>
          <li>• Los cambios se aplicarán después de guardar</li>
          <li>• Los pacientes solo podrán agendar citas en los horarios configurados</li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorAvailabilityManager;
