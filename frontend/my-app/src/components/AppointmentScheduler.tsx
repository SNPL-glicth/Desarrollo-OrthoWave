import React, { useState } from 'react';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useAppointments } from '../hooks/useAppointments';
import { authService } from '../services/auth.service';

interface AppointmentSchedulerProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultationType, setConsultationType] = useState('');
  const [consultationReason, setConsultationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { availableSlots, doctors, specialties, loading: slotsLoading } = useAvailableSlots(selectedDate || undefined, selectedDoctorId || undefined);
  const { createAppointment } = useAppointments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedDoctorId || !selectedSlot || !consultationType || !consultationReason) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const appointmentData = {
        pacienteId: user.id,
        doctorId: selectedDoctorId,
        fechaHora: `${selectedDate.toISOString().split('T')[0]}T${selectedSlot}:00`,
        tipoConsulta: consultationType,
        motivoConsulta: consultationReason,
        duracion: 60 // 60 minutos por defecto
      };

      await createAppointment(appointmentData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3); // Máximo 3 meses en el futuro

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Agendar Nueva Cita</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de fecha */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de la cita
              </label>
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
            </div>

            {/* Selección de doctor */}
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                Doctor
              </label>
              <select
                id="doctor"
                value={selectedDoctorId || ''}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccione un doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.nombre} {doctor.apellido} - {doctor.especialidad}
                  </option>
                ))}
              </select>
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
                  <p className="text-gray-500 text-sm">No hay horarios disponibles para esta fecha</p>
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
