import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Plus,
  Trash2,
  Save,
  CalendarDays,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface TimeSlot {
  startTime: string;
  endTime: string;
  label?: string;
}

interface ScheduleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  existingSchedule?: {
    id?: number;
    timeSlots: TimeSlot[];
    notes?: string;
    type: 'weekly' | 'specific' | 'blocked';
  };
  onSave: (scheduleData: any) => void;
  onDelete?: (scheduleId: number) => void;
}

const ScheduleEditorModal: React.FC<ScheduleEditorModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingSchedule,
  onSave,
  onDelete
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { startTime: '08:00', endTime: '12:00', label: 'Mañana' }
  ]);
  const [notes, setNotes] = useState('');
  const [slotDuration, setSlotDuration] = useState(60);
  const [bufferTime, setBufferTime] = useState(0);
  const [maxAppointments, setMaxAppointments] = useState(8);
  const [loading, setSaving] = useState(false);

  // Initialize form with existing schedule data
  useEffect(() => {
    if (existingSchedule && isOpen) {
      setTimeSlots(existingSchedule.timeSlots.length > 0 
        ? existingSchedule.timeSlots 
        : [{ startTime: '08:00', endTime: '12:00', label: 'Mañana' }]
      );
      setNotes(existingSchedule.notes || '');
    } else if (isOpen) {
      // Reset form for new schedule
      setTimeSlots([{ startTime: '08:00', endTime: '12:00', label: 'Mañana' }]);
      setNotes('');
    }
  }, [existingSchedule, isOpen]);

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '14:00', endTime: '18:00', label: 'Tarde' }]);
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime' | 'label', value: string) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const validateTimeSlots = (): boolean => {
    for (const slot of timeSlots) {
      if (slot.startTime >= slot.endTime) {
        toast.error('La hora de inicio debe ser anterior a la hora de fin');
        return false;
      }
    }

    // Check for overlapping slots
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

  const handleSave = async () => {
    if (!validateTimeSlots()) return;

    setSaving(true);
    try {
      const scheduleData = {
        date: selectedDate,
        timeSlots,
        slotDuration,
        bufferTime,
        maxAppointments,
        notes: notes.trim(),
        id: existingSchedule?.id
      };

      await onSave(scheduleData);
      toast.success('Horario guardado exitosamente');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el horario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSchedule?.id) return;

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este horario?');
    if (!confirmed) return;

    setSaving(true);
    try {
      if (onDelete) {
        await onDelete(existingSchedule.id);
        toast.success('Horario eliminado exitosamente');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el horario');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {existingSchedule ? 'Editar Horario' : 'Nuevo Horario Específico'}
                </h2>
                <p className="text-blue-100 text-sm capitalize">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Horarios de Atención
              </label>
              <div className="space-y-3">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Inicio</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fin</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-1 col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Etiqueta (opcional)</label>
                        <input
                          type="text"
                          value={slot.label || ''}
                          onChange={(e) => updateTimeSlot(index, 'label', e.target.value)}
                          placeholder="Ej: Mañana, Tarde"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {timeSlots.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addTimeSlot}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar horario</span>
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración de citas (min)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer entre citas (min)
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>0 minutos</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de citas
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxAppointments}
                  onChange={(e) => setMaxAppointments(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Horario especial por conferencia médica, atención prioritaria, etc."
              />
            </div>

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Los horarios específicos tienen prioridad sobre los horarios semanales</li>
                    <li>• Los cambios se aplican inmediatamente</li>
                    <li>• Los pacientes verán la nueva disponibilidad al instante</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div>
            {existingSchedule?.id && onDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading || timeSlots.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <Save className="h-4 w-4" />
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditorModal;
