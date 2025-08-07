import React, { useState } from 'react';
import { useCitas } from '../../contexts/CitasContext';
import { useAuth } from '../../context/AuthContext';
import { useAvailableSlotsForDoctor } from '../../hooks/useAvailableSlotsOptimized';
import { getCurrentColombiaDate } from '../../utils/dateUtils';

interface PatientAppointmentSchedulerProps {
  doctorId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatientAppointmentScheduler: React.FC<PatientAppointmentSchedulerProps> = ({
  doctorId,
  onSuccess,
  onCancel
}) => {
  const { state, createCita } = useCitas();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultationType, setConsultationType] = useState('');
  const [consultationReason, setConsultationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(doctorId || null);

  const { availableSlots, loading: slotsLoading } = useAvailableSlotsForDoctor(
    selectedDate || undefined,
    selectedDoctorId || undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedDoctorId || !selectedSlot || !consultationType || !consultationReason) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    // Validación adicional: evitar agendar en fechas/horas pasadas usando hora de Colombia
    const selectedDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${selectedSlot}:00`);
    const nowColombia = getCurrentColombiaDate();
    
    if (selectedDateTime <= nowColombia) {
      const currentTimeStr = nowColombia.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Bogota'
      });
      const currentDateStr = nowColombia.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota'
      });
      setError(`No se puede agendar una cita en el pasado. Hora actual de Colombia: ${currentDateStr} ${currentTimeStr}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        pacienteId: Number(user.id),
        doctorId: selectedDoctorId,
        fechaHora: `${selectedDate.toISOString().split('T')[0]}T${selectedSlot}:00`,
        tipoConsulta: consultationType,
        motivoConsulta: consultationReason,
        duracion: 60 // 60 minutos por defecto
      };

      await createCita(appointmentData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Generar días de la semana actual usando hora de Colombia
  const generateWeekDays = () => {
    const today = getCurrentColombiaDate();
    const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, etc.
    const startOfWeek = new Date(today);
    
    // Ajustar para que lunes sea el primer día (1 = lunes)
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  const today = getCurrentColombiaDate();
  const maxDate = getCurrentColombiaDate();
  maxDate.setMonth(today.getMonth() + 3); // Máximo 3 meses en el futuro

  const selectedDoctor = state.doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Agendar Nueva Cita</h2>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de doctor si no se especifica */}
        {!doctorId && (
          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Doctor
            </label>
            <select
              id="doctor"
              value={selectedDoctorId || ''}
              onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione un doctor</option>
              {state.doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.nombre} {doctor.apellido} - {doctor.especialidad}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mostrar información del doctor seleccionado */}
        {selectedDoctor && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Dr. {selectedDoctor.nombre} {selectedDoctor.apellido}
            </h3>
            <p className="text-blue-700 text-sm">
              Especialidad: {selectedDoctor.especialidad}
            </p>
          </div>
        )}

        {/* Selección de fecha con vista de calendario */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de la cita
          </label>
          <div className="space-y-4">
            {/* Input de fecha principal */}
            <input
              type="date"
              id="date"
              min={formatDate(today)}
              max={formatDate(maxDate)}
              value={selectedDate ? formatDate(selectedDate) : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            {/* Vista rápida de días disponibles */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Días disponibles esta semana</h4>
              <div className="grid grid-cols-7 gap-1">
                {generateWeekDays().map((day, index) => {
                  const isToday = day.toDateString() === today.toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                  const isPast = day < today;
                  const isFuture = day > maxDate;
                  const isDisabled = isPast || isFuture;
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && setSelectedDate(day)}
                      disabled={isDisabled}
                      className={`
                        p-2 text-xs rounded-md transition-colors
                        ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : isToday
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : isDisabled
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                        }
                      `}
                    >
                      <div className="font-medium">
                        {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                      </div>
                      <div className="text-xs mt-1">
                        {day.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Horarios disponibles */}
        {selectedDate && selectedDoctorId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horarios disponibles
            </label>
            {slotsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando horarios...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.hora}
                    type="button"
                    onClick={() => setSelectedSlot(slot.hora)}
                    className={`p-2 text-sm rounded-md border ${
                      selectedSlot === slot.hora
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {slot.hora}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay horarios disponibles para esta fecha
              </p>
            )}
          </div>
        )}

        {/* Tipo de consulta */}
        <div>
          <label htmlFor="consultationType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de consulta
          </label>
          <select
            id="consultationType"
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione el tipo de consulta</option>
            <option value="consulta_general">Consulta General</option>
            <option value="control">Control</option>
            <option value="urgencia">Urgencia</option>
            <option value="primera_vez">Primera Vez</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
        </div>

        {/* Motivo de la consulta */}
        <div>
          <label htmlFor="consultationReason" className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la consulta
          </label>
          <textarea
            id="consultationReason"
            value={consultationReason}
            onChange={(e) => setConsultationReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe brevemente el motivo de tu consulta..."
            required
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedDoctorId || !selectedSlot || !consultationType || !consultationReason}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Agendando...' : 'Agendar Cita'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientAppointmentScheduler;
