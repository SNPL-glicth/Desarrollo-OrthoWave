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
import { getPatientsByDoctor } from '../../services/patientService';
import { 
  getCurrentColombiaDate, 
  isInPastColombiaTime,
  getColombiaTimeInfo
} from '../../utils/timezoneUtils';
import citasService from '../../services/citasService';
import { useAvailableSlotsForDoctor } from '../../hooks/useAvailableSlotsOptimized';
// Import PatientSearchInput component
import PatientSearchInput from './PatientSearchInput';

interface Patient {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

interface DoctorAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  selectedTime?: string; // Hora seleccionada en el calendario
  onAppointmentCreated?: (appointment: any) => void;
}

const DoctorAppointmentModal: React.FC<DoctorAppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onAppointmentCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados del formulario con calendario completo
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [calendarDate, setCalendarDate] = useState(getCurrentColombiaDate());
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date | null>(selectedDate || null);
  const [selectedSlot, setSelectedSlot] = useState<string>(selectedTime || '');
  const [duration, setDuration] = useState(60);
  const [consultationType, setConsultationType] = useState('control');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Estados para el sistema de pestañas
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Hook para obtener disponibilidad del doctor (usando el ID del doctor actual)
  const { availableSlots, loading: slotsLoading } = useAvailableSlotsForDoctor(
    selectedAppointmentDate || undefined,
    user?.id ? Number(user.id) : undefined
  );

  // Generar matriz de días optimizada con memoización mejorada
  const calendarData = useMemo(() => {
    const startMonth = startOfMonth(calendarDate);
    const endMonth = endOfMonth(calendarDate);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 }); // Comienza desde lunes
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

  // Cargar pacientes del doctor al abrir el modal
  useEffect(() => {
    if (isOpen && user) {
      loadPatients();
    }
  }, [isOpen, user]);

  // Establecer fecha y hora desde el calendario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        setSelectedAppointmentDate(selectedDate);
        setCalendarDate(selectedDate);
      }
      if (selectedTime) {
        setSelectedSlot(selectedTime);
      }
    }
  }, [isOpen, selectedDate, selectedTime]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏥 Cargando pacientes del doctor...');
      
      // Usar el servicio real de pacientes
      const patientsData = await getPatientsByDoctor();
      console.log('✅ Pacientes obtenidos:', patientsData);
      
      // Verificar si la respuesta es válida
      if (!patientsData || !Array.isArray(patientsData)) {
        console.warn('⚠️ Respuesta de pacientes no es un array:', patientsData);
        setPatients([]);
        setError('La respuesta del servidor no es válida.');
        return;
      }
      
      // Transformar los datos al formato esperado
      const formattedPatients = patientsData.map((patient: any) => ({
        id: patient.id || patient.pacienteId,
        nombre: patient.nombre || patient.name,
        apellido: patient.apellido || patient.lastName,
        email: patient.email,
        telefono: patient.telefono || patient.phone
      }));
      
      console.log('📋 Pacientes formateados:', formattedPatients);
      setPatients(formattedPatients);
      
      if (formattedPatients.length === 0) {
        setError('No tienes pacientes asignados aún.');
      }
    } catch (err: any) {
      console.error('❌ Error loading patients:', err);
      
      // Manejo de errores más específico
      if (err.response?.status === 404) {
        setPatients([]);
        setError('No tienes pacientes asignados aún.');
      } else if (err.response?.status === 401) {
        setError('No tienes autorización para ver los pacientes.');
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Por favor, intenta más tarde.');
      } else if (err.message?.includes('Network Error')) {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError(err.message || 'Error al cargar los pacientes.');
      }
      
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de slot
  const handleSlotClick = (slot: any) => {
    if (slot && !slot.isOccupied) {
      setSelectedSlot(slot.hora);
      setError(null);
    }
  };

  const validateForm = (): string | null => {
    if (!selectedPatient) {
      return 'Debe seleccionar un paciente';
    }
    if (!selectedAppointmentDate) {
      return 'Debe seleccionar una fecha';
    }
    if (!selectedSlot) {
      return 'Debe seleccionar una hora';
    }
    if (!reason.trim()) {
      return 'Debe indicar el motivo de la consulta';
    }
    
    // Validar que la fecha no sea en el pasado usando utilidades de timezone de Colombia
    if (isInPastColombiaTime(selectedAppointmentDate, selectedSlot)) {
      const timeInfo = getColombiaTimeInfo();
      return `No se puede agendar una cita en el pasado. Hora actual de Colombia: ${timeInfo.colombiaReadable}`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setError('Usuario no autenticado');
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 Iniciando creación de cita...');
      
      // Combinar fecha y hora usando la nueva estructura
      const fechaHora = `${selectedAppointmentDate!.toISOString().split('T')[0]}T${selectedSlot}:00`;

      const citaData = {
        pacienteId: selectedPatient!.id,
        doctorId: typeof user.id === 'string' ? parseInt(user.id) : user.id,
        fechaHora,
        duracion: duration,
        tipoConsulta: consultationType as 'primera_vez' | 'control' | 'seguimiento' | 'urgencia',
        motivoConsulta: reason,
        notasPaciente: notes || undefined
      };

      console.log('📋 Datos de la cita a crear:', {
        ...citaData,
        fechaHora: `${fechaHora} (Colombia UTC-5)`
      });

      const nuevaCita = await citasService.crearCita(citaData);
      console.log('✅ Cita creada exitosamente:', nuevaCita);
      
      // Formatear fecha y hora usando timezone de Colombia
      const fechaFormateada = format(selectedAppointmentDate!, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      const successMessage = `✅ Cita agendada exitosamente para el ${fechaFormateada} a las ${selectedSlot}`;
      
      setSuccess(successMessage);
      
      if (onAppointmentCreated) {
        onAppointmentCreated({
          ...nuevaCita,
          successMessage
        });
      }
      
      console.log('🎉 Proceso de creación completado');
      
      // Cerrar el modal después de un pequeño delay para mostrar el feedback
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2500);
      
    } catch (err: any) {
      console.error('❌ Error al crear cita:', err);
      
      // Manejo de errores más específico
      let errorMessage = 'Error desconocido al agendar la cita';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Datos de la cita inválidos';
      } else if (err.response?.status === 401) {
        errorMessage = 'No tienes autorización para crear citas';
      } else if (err.response?.status === 404) {
        errorMessage = 'Paciente o doctor no encontrado';
      } else if (err.response?.status === 409) {
        errorMessage = 'El horario seleccionado ya no está disponible';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Si el error es de disponibilidad, limpiar el slot seleccionado
      if (err.response?.status === 409 || err.message?.includes('disponible')) {
        setSelectedSlot('');
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar pasos
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Siempre se puede ir al paso 1
      case 2:
        return selectedPatient !== null; // Solo si hay paciente seleccionado
      case 3:
        return selectedPatient !== null && selectedAppointmentDate !== null; // Paciente y fecha
      default:
        return false;
    }
  };

  const goToStep = (step: number) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
      setError(null);
    }
  };

  const nextStep = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setCalendarDate(getCurrentColombiaDate());
    setSelectedAppointmentDate(null);
    setSelectedSlot('');
    setDuration(60);
    setConsultationType('control');
    setReason('');
    setNotes('');
    setError(null);
    setSuccess(null);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-gray-900/70 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl shadow-black/25 border border-gray-200/50 animate-in zoom-in-95 duration-300">
        {/* Header con gradiente elegante */}
        <div className="relative bg-gradient-to-r from-gray-600 via-gray-700 to-slate-800 p-4 text-white overflow-hidden">
          {/* Efectos de fondo decorativos */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 via-transparent to-slate-600/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-xl"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Agendar Nueva Cita</h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Indicador de pasos simplificado */}
        <div className="relative px-6 py-4 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 border-b border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = completedSteps.includes(step);
              const canAccess = canProceedToStep(step);
              
              return (
                <button
                  key={step}
                  onClick={() => goToStep(step)}
                  disabled={!canAccess}
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isActive 
                      ? 'text-gray-700' : 
                    isCompleted 
                      ? 'text-emerald-700' : 
                    canAccess 
                      ? 'text-gray-700 hover:text-gray-800' : 
                      'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step === 1 && 'Seleccionar Paciente'}
                  {step === 2 && 'Elegir Fecha'}
                  {step === 3 && 'Finalizar Detalles'}
                </button>
              );
            })}
          </div>
          
          {/* Barra de progreso */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gray-500 to-slate-600 transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${((currentStep - 1) / 2) * 100}%`
                }}
              ></div>
            </div>
            
            {/* Indicadores de posición en la barra */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-2">
              {[1, 2, 3].map((step) => {
                const isActive = currentStep === step;
                const isCompleted = completedSteps.includes(step) || currentStep > step;
                
                return (
                  <div 
                    key={step}
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-gray-600 border-gray-600 scale-125'
                        : isCompleted
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-gray-300'
                    }`}
                    style={{
                      transform: 'translateY(-1px)'
                    }}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mensajes */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-green-700 text-sm">{success}</div>
              </div>
            )}

            {/* PASO 1: Selección de Paciente */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-600 to-slate-700 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Seleccionar Paciente
                  </h3>
                </div>

                <div className="max-w-lg mx-auto">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Buscar Paciente
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <PatientSearchInput
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onPatientSelect={(patient) => {
                      setSelectedPatient(patient);
                      setError(null);
                    }}
                    loading={loading}
                  />
                  {patients.length === 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-amber-700 text-sm">No tienes pacientes asignados aún.</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="mt-6 max-w-lg mx-auto">
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-emerald-900 mb-3">Paciente Seleccionado</h4>
                          <div className="space-y-2 text-sm text-emerald-800">
                            <div className="flex">
                              <span className="font-medium w-16">Nombre:</span>
                              <span>{selectedPatient.nombre} {selectedPatient.apellido}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-16">Email:</span>
                              <span>{selectedPatient.email}</span>
                            </div>
                            {selectedPatient.telefono && (
                              <div className="flex">
                                <span className="font-medium w-16">Teléfono:</span>
                                <span>{selectedPatient.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!selectedPatient}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center font-medium shadow-md hover:shadow-lg"
                  >
                    <span className="mr-2">Continuar</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Selección de Fecha */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Elegir Fecha</h3>
                  <p className="text-gray-600">Selecciona la fecha para la cita con <strong>{selectedPatient?.nombre} {selectedPatient?.apellido}</strong></p>
                </div>

                {/* Calendario */}
                <div>
                  {/* Navegación del calendario */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <h2 className="text-lg font-semibold text-gray-900">
                      {calendarData.monthName}
                    </h2>
                    
                    <button
                      type="button"
                      onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {calendarData.days.map((dayData, index) => {
                      // Debug logging simplificado - solo primeros 7 días
                      if (index < 7) {
                        console.log(`📅 MODAL Calendar Day ${dayData.dayNumber}:`, {
                          date: format(dayData.date, 'yyyy-MM-dd'),
                          isPast: dayData.isPast,
                          isCurrentMonth: dayData.isCurrentMonth,
                          isToday: dayData.isToday,
                          isClickable: dayData.isClickable
                        });
                      }
                      
                      return (
                        <button
                          key={`${dayData.date.getFullYear()}-${dayData.date.getMonth()}-${dayData.date.getDate()}`}
                          type="button"
                          onClick={() => {
                            if (dayData.isClickable) {
                              setSelectedAppointmentDate(dayData.date);
                              setSelectedSlot('');
                              setError(null);
                            }
                          }}
                          disabled={!dayData.isClickable}
                          className={`
                            p-3 text-sm relative transition-colors rounded-lg
                            ${
                              dayData.isCurrentMonth 
                                ? dayData.isPast 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-900 hover:bg-gray-50'
                                : 'text-gray-300'
                            }
                            ${
                              dayData.isSelected 
                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                : ''
                            }
                            ${
                              dayData.isToday && !dayData.isSelected 
                                ? 'bg-gray-100 text-gray-600 font-semibold' 
                                : ''
                            }
                          `}
                        >
                          {dayData.dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedAppointmentDate && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Fecha Seleccionada:</h4>
                    <div className="text-sm text-green-800">
                      <p>{format(selectedAppointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!selectedAppointmentDate}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    Continuar
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Horario y Detalles */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Horario y Detalles</h3>
                  <p className="text-gray-600">Selecciona la hora y completa los detalles de la cita</p>
                </div>

                {/* Información de la cita hasta ahora */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Información de la Cita:</h4>
                  <div className="text-sm text-gray-800 space-y-1">
                    <p><strong>Paciente:</strong> {selectedPatient?.nombre} {selectedPatient?.apellido}</p>
                    <p><strong>Fecha:</strong> {selectedAppointmentDate && format(selectedAppointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                  </div>
                </div>

                {/* Horarios disponibles */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Seleccionar Horario:</h4>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <svg className="animate-spin h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-3 text-gray-600">Cargando horarios...</span>
                    </div>
                  ) : availableSlots && availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {availableSlots.map((slot: any, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          disabled={slot.isOccupied}
                          className={`
                            p-3 text-sm border rounded-lg transition-colors font-medium
                            ${
                              slot.isOccupied
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : selectedSlot === slot.hora
                                  ? 'bg-gray-600 text-white border-gray-600 shadow-md'
                                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-300'
                            }
                          `}
                        >
                          {slot.hora}
                          {slot.isOccupied && (
                            <div className="text-xs text-gray-400 mt-1">Ocupado</div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay horarios disponibles para esta fecha</p>
                    </div>
                  )}
                </div>

                {selectedSlot && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm font-medium text-green-900">Hora seleccionada: {selectedSlot}</div>
                  </div>
                )}

                {/* Detalles de la cita */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value={20}>20 minutos</option>
                      <option value={40}>40 minutos</option>
                      <option value={60}>60 minutos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Consulta
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="control">Control</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="primera_vez">Primera vez</option>
                      <option value="urgencia">Urgencia</option>
                    </select>
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la Consulta *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Describa el motivo de la consulta..."
                    required
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Notas adicionales para el paciente..."
                  />
                </div>

                {/* Resumen final */}
                {selectedPatient && selectedAppointmentDate && selectedSlot && reason.trim() && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-3">Resumen de la Cita:</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>Paciente:</strong> {selectedPatient.nombre} {selectedPatient.apellido}</p>
                      <p><strong>Fecha:</strong> {format(selectedAppointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                      <p><strong>Hora:</strong> {selectedSlot}</p>
                      <p><strong>Duración:</strong> {duration} minutos</p>
                      <p><strong>Tipo:</strong> {consultationType}</p>
                      <p><strong>Motivo:</strong> {reason}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedSlot || !reason.trim()}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? 'Agendando...' : 'Agendar Cita'}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentModal;
