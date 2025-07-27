import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, 
         isToday, isSameDay, isWeekend, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../services/api';

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
}

interface CitaExistente {
  id: number;
  fechaHora: string;
  duracion: number;
}

interface DoctorAvailabilityCalendarProps {
  doctor: Doctor;
  onRequestAppointment: (appointmentData: any) => void;
  onClose: () => void;
}

// Horarios de trabajo (8:00 AM - 5:00 PM en intervalos de 30 minutos)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Días festivos fijos en Colombia 
const diasFestivos = [
  '2025-01-01', // Año Nuevo
  '2025-01-06', // Reyes Magos
  '2025-05-01', // Día del Trabajo
  '2025-07-20', // Día de la Independencia
  '2025-08-07', // Batalla de Boyacá
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad
];

const DoctorAvailabilityCalendar: React.FC<DoctorAvailabilityCalendarProps> = ({
  doctor,
  onRequestAppointment,
  onClose
}) => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [view, setView] = useState<'week' | 'month'>('week');
  const [existingAppointments, setExistingAppointments] = useState<CitaExistente[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoConsulta: 'primera_vez' as const,
    motivoConsulta: '',
    duracion: 60,
    notasPaciente: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Obtener citas existentes del doctor
  const fetchExistingAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Simulamos citas existentes - después se conectará al backend real
      const mockAppointments: CitaExistente[] = [
        { id: 1, fechaHora: '2025-01-27T09:00:00', duracion: 60 },
        { id: 2, fechaHora: '2025-01-27T14:30:00', duracion: 45 },
        { id: 3, fechaHora: '2025-01-28T10:00:00', duracion: 60 },
        { id: 4, fechaHora: '2025-01-29T11:30:00', duracion: 30 },
      ];
      setExistingAppointments(mockAppointments);
    } catch (err) {
      console.error('Error al obtener citas existentes:', err);
    } finally {
      setLoading(false);
    }
  }, [doctor.id]);

  useEffect(() => {
    fetchExistingAppointments();
  }, [fetchExistingAppointments]);

  // Verificar si es día laboral
  const isDiaLaboral = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return !isWeekend(date) && !diasFestivos.includes(dateString);
  };

  // Verificar si un horario está ocupado
  const isTimeSlotOccupied = (date: Date, time: string): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return existingAppointments.some(appointment => {
      const appointmentDate = format(new Date(appointment.fechaHora), 'yyyy-MM-dd');
      const appointmentTime = format(new Date(appointment.fechaHora), 'HH:mm');
      return appointmentDate === dateString && appointmentTime === time;
    });
  };

  // Obtener días de la semana
  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes = 1
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  // Navegación de semanas
  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToPreviousMonth = () => setCurrentWeek(subMonths(currentWeek, 1));
  const goToNextMonth = () => setCurrentWeek(addMonths(currentWeek, 1));
  const goToToday = () => {
    setCurrentWeek(new Date());
    setSelectedDate(null);
    setSelectedTime('');
  };

  // Solicitar cita
  const handleRequestAppointment = async () => {
    if (!selectedDate || !selectedTime || !user?.id) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    if (!formData.motivoConsulta.trim()) {
      alert('Por favor ingresa el motivo de la consulta');
      return;
    }

    setSubmitting(true);

    try {
      const fechaHora = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      fechaHora.setHours(hours, minutes, 0, 0);

      const solicitudData = {
        doctorId: doctor.id,
        pacienteId: Number(user.id),
        fechaHora: fechaHora.toISOString(),
        duracion: formData.duracion,
        tipoConsulta: formData.tipoConsulta,
        motivoConsulta: formData.motivoConsulta,
        notasPaciente: formData.notasPaciente,
        estado: 'solicitada'
      };

      // Aquí iría la llamada al backend para crear la solicitud
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación

      onRequestAppointment(solicitudData);
      
      // Resetear formulario
      setSelectedDate(null);
      setSelectedTime('');
      setFormData({
        tipoConsulta: 'primera_vez',
        motivoConsulta: '',
        duracion: 60,
        notasPaciente: ''
      });

    } catch (err: any) {
      console.error('Error al solicitar cita:', err);
      alert('Error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const weekDays = getWeekDays();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 relative">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Agendar Cita - Dr. {doctor.nombre} {doctor.apellido}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                      🩺 {doctor.especialidad}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 mt-3">
                <div className="flex items-start space-x-2">
                  <svg className="h-4 w-4 text-white mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-white/90">
                    <strong>Instrucciones:</strong> Selecciona una fecha y hora disponible. Los horarios ocupados aparecen en gris y no se pueden seleccionar.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50">
          {/* Navegación del calendario */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === 'week'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📅 Semana
                </button>
                <button
                  onClick={() => setView('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === 'month'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📊 Mes
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={view === 'week' ? goToPreviousWeek : goToPreviousMonth}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-lg font-semibold text-gray-900 min-w-[250px] text-center">
                {view === 'week' 
                  ? `${format(weekDays[0], 'd MMM', { locale: es })} - ${format(weekDays[6], 'd MMM yyyy', { locale: es })}`
                  : format(currentWeek, "MMMM yyyy", { locale: es }).toUpperCase()
                }
              </div>
              
              <button
                onClick={view === 'week' ? goToNextWeek : goToNextMonth}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm"
              >
                ⭐ Hoy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario semanal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header de días */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-emerald-50 to-teal-50">
                  {weekDays.map(day => (
                    <div key={day.toString()} className="p-3 text-center border-r border-emerald-100 last:border-r-0">
                      <div className="text-sm font-medium text-gray-600">
                        {format(day, 'EEE', { locale: es })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday(day) ? 'text-emerald-600 bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'
                      } ${
                        !isDiaLaboral(day) ? 'text-red-500' : ''
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid de horarios */}
                <div className="max-h-96 overflow-y-auto">
                  {TIME_SLOTS.map(time => (
                    <div key={time} className="grid grid-cols-7 border-b border-gray-100">
                      {weekDays.map(day => {
                        const isLaboral = isDiaLaboral(day);
                        const isOccupied = isTimeSlotOccupied(day, time);
                        const isSelected = selectedDate && isSameDay(day, selectedDate) && selectedTime === time;
                        const canSelect = isLaboral && !isOccupied;

                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`p-2 text-center border-r border-gray-100 last:border-r-0 transition-colors ${
                              !isLaboral 
                                ? 'bg-red-50 text-red-400 cursor-not-allowed' :
                              isOccupied 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                              isSelected 
                                ? 'bg-green-100 border-green-500 cursor-pointer' :
                              'hover:bg-green-50 cursor-pointer'
                            }`}
                            onClick={() => {
                              if (canSelect) {
                                setSelectedDate(day);
                                setSelectedTime(time);
                              }
                            }}
                          >
                            <div className="text-xs font-medium">
                              {time}
                            </div>
                            {isOccupied && (
                              <div className="text-xs text-gray-600 mt-1">
                                Ocupado
                              </div>
                            )}
                            {!isLaboral && (
                              <div className="text-xs text-red-500 mt-1">
                                No laborable
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Leyenda */}
              <div className="mt-4 flex justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Ocupado</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border-2 border-green-500 rounded"></div>
                  <span>Seleccionado</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-50 rounded"></div>
                  <span>No laborable</span>
                </div>
              </div>
            </div>

            {/* Formulario de solicitud */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-emerald-900">Cita Seleccionada</h3>
                </div>
                {selectedDate && selectedTime ? (
                  <div className="text-sm text-emerald-800 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">📅 Fecha:</span> 
                      <span className="bg-white px-2 py-1 rounded">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">🕐 Hora:</span> 
                      <span className="bg-white px-2 py-1 rounded">{selectedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">👨‍⚕️ Doctor:</span> 
                      <span className="bg-white px-2 py-1 rounded">Dr. {doctor.nombre} {doctor.apellido}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <svg className="mx-auto h-8 w-8 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-emerald-600">Selecciona fecha y hora disponible en el calendario</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta
                </label>
                <select
                  value={formData.tipoConsulta}
                  onChange={(e) => setFormData({ ...formData, tipoConsulta: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="primera_vez">Primera vez</option>
                  <option value="control">Control</option>
                  <option value="seguimiento">Seguimiento</option>
                  <option value="urgencia">Urgencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la Consulta *
                </label>
                <textarea
                  value={formData.motivoConsulta}
                  onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe detalladamente el motivo de tu consulta..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración Estimada
                </label>
                <select
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales (opcional)
                </label>
                <textarea
                  value={formData.notasPaciente}
                  onChange={(e) => setFormData({ ...formData, notasPaciente: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Información adicional que consideres importante..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Nota importante:</p>
                    <p>Esta es una solicitud de cita. El doctor deberá aprobarla antes de ser confirmada. Recibirás una notificación con la respuesta.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleRequestAppointment}
                  disabled={submitting || !selectedDate || !selectedTime || !formData.motivoConsulta.trim()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando Solicitud...
                    </>
                  ) : (
                    'Solicitar Cita'
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityCalendar;
