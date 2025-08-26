import React, { useState, useEffect, useMemo } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  addMonths,
  subMonths,
  isSameMonth,
  isAfter
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrentColombiaDate } from '../../utils/timezoneUtils';
import axios from 'axios';

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad?: string;
  perfilMedico?: {
    especialidad?: string;
    descripcion?: string;
    experiencia?: number;
  };
}

interface StepIndicatorProps {
  currentStep: number;
  steps: { number: number; title: string; }[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={step.number}>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step.number 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step.number}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {step.title}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-4 ${
            currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const AvailableAppointments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Estados del calendario
  const [calendarDate, setCalendarDate] = useState(getCurrentColombiaDate());
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // Estados del formulario
  const [consultationType, setConsultationType] = useState('Consulta General');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [duration] = useState(60);

  const steps = [
    { number: 1, title: 'Seleccionar Doctor' },
    { number: 2, title: 'Elegir Fecha' },
    { number: 3, title: 'Finalizar Detalles' }
  ];

  // Generar calendario
  const calendarData = useMemo(() => {
    const startMonth = startOfMonth(calendarDate);
    const endMonth = endOfMonth(calendarDate);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 });
    const endDate = endOfWeek(endMonth, { weekStartsOn: 1 });
    const today = getCurrentColombiaDate();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const days = [];
    for (let day = startDate; !isAfter(day, endDate); day = addDays(day, 1)) {
      const dayDateOnly = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const isCurrentMonth = isSameMonth(day, calendarDate);
      const isPast = dayDateOnly < todayDateOnly;
      const isToday = dayDateOnly.getTime() === todayDateOnly.getTime();
      const isSelected = selectedAppointmentDate && isSameDay(day, selectedAppointmentDate);
      
      days.push({
        date: day,
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        isClickable: !isPast && isCurrentMonth,
        dayNumber: format(day, 'd')
      });
    }
    
    return {
      days,
      monthName: format(calendarDate, 'MMMM yyyy', { locale: es }),
      today,
      todayDateOnly
    };
  }, [calendarDate, selectedAppointmentDate]);

  // Cargar doctores disponibles
  useEffect(() => {
    loadDoctors();
  }, []);

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDoctor && selectedAppointmentDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedAppointmentDate]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/users/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Doctores obtenidos:', response.data);
      setDoctors(response.data);
    } catch (err: any) {
      console.error('Error loading doctors:', err);
      setError('Error al cargar la lista de doctores.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedAppointmentDate) return;

    try {
      setLoading(true);
      const dateStr = format(selectedAppointmentDate, 'yyyy-MM-dd');
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3001/citas/buscar-disponibilidad',
        {
          doctorId: selectedDoctor.id,
          fecha: dateStr,
          duracion: duration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAvailableSlots(response.data);
    } catch (err: any) {
      console.error('Error loading available slots:', err);
      setError('Error al cargar horarios disponibles.');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2);
    setError(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedAppointmentDate(date);
    setSelectedSlot('');
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedAppointmentDate || !selectedSlot) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const dateTimeISO = `${format(selectedAppointmentDate, 'yyyy-MM-dd')}T${selectedSlot}:00`;
      
      const appointmentData = {
        doctorId: selectedDoctor.id,
        pacienteId: user?.id,
        fechaHora: dateTimeISO,
        servicio: consultationType,
        duracion: duration,
        motivo: reason,
        notas: notes
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/citas',
        appointmentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('¡Cita agendada exitosamente! El doctor revisará tu solicitud.');
      
      // Redirigir al dashboard después de un momento
      setTimeout(() => {
        navigate('/dashboard/patient');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Error al agendar la cita.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard/patient');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-t-lg">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Agendar Nueva Cita</h1>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-lg">
          <div className="p-6">
            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} steps={steps} />

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Doctor Selection */}
            {currentStep === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Seleccionar Doctor</h2>
                  <p className="text-gray-600">Elige el especialista con quien deseas agendar tu cita</p>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando doctores...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold group-hover:bg-blue-700 transition-colors">
                            {doctor.nombre.charAt(0)}{doctor.apellido.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              Dr. {doctor.nombre} {doctor.apellido}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {doctor.perfilMedico?.especialidad || doctor.especialidad || 'Medicina General'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date and Time Selection */}
            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Elegir Fecha</h2>
                  <p className="text-gray-600">
                    Dr. {selectedDoctor?.nombre} {selectedDoctor?.apellido}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {calendarData.monthName}
                      </h3>
                      <button
                        onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                        <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                      {calendarData.days.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => day.isClickable && handleDateSelect(day.date)}
                          disabled={!day.isClickable}
                          className={`h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${
                            !day.isCurrentMonth
                              ? 'text-gray-300 cursor-not-allowed'
                              : day.isPast
                              ? 'text-gray-400 cursor-not-allowed'
                              : day.isSelected
                              ? 'bg-blue-600 text-white font-semibold'
                              : day.isToday
                              ? 'bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200'
                              : 'text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {day.dayNumber}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Slots */}
                  {selectedAppointmentDate && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Horarios disponibles - {format(selectedAppointmentDate, "EEEE, d 'de' MMMM", { locale: es })}
                      </h4>
                      
                      {loading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Cargando horarios...</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay horarios disponibles para esta fecha</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => handleSlotSelect(slot)}
                              className={`p-2 text-sm rounded border transition-colors ${
                                selectedSlot === slot
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Final Details */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Finalizar Detalles</h2>
                  <p className="text-gray-600">Completa la información de tu cita</p>
                </div>

                {/* Resumen */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Resumen de la cita</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Doctor:</strong> Dr. {selectedDoctor?.nombre} {selectedDoctor?.apellido}</p>
                    <p><strong>Fecha:</strong> {selectedAppointmentDate && format(selectedAppointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    <p><strong>Hora:</strong> {selectedSlot}</p>
                    <p><strong>Duración:</strong> {duration} minutos</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de consulta
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Consulta General">Consulta General</option>
                      <option value="Control">Control</option>
                      <option value="Urgencia">Urgencia</option>
                      <option value="Segunda Opinión">Segunda Opinión</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la consulta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe brevemente el motivo de tu consulta..."
                      rows={3}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Cualquier información adicional que consideres relevante..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg">
            <button
              onClick={goBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </button>
            
            {currentStep === 3 && (
              <button
                onClick={handleSubmit}
                disabled={loading || !reason.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? 'Agendando...' : 'Confirmar Cita'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableAppointments;
