import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { getPatientsByDoctor } from '../../services/patientService';
import { 
  getCurrentColombiaDate,
  isDateInPastColombia,
  isDateTimeInPastColombia,
  getCurrentColombiaTime,
  getColombiaTimeInfo
} from '../../utils/timezoneUtils';
import citasService from '../../services/citasService';
import PatientSearchInput from './PatientSearchInput';
import UnifiedCalendar from '../calendar/UnifiedCalendar';
import { IndependentSlot } from '../../hooks/useIndependentSlots';

interface Patient {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

interface ImprovedAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  selectedTime?: string; // Hora seleccionada en el calendario
  onAppointmentCreated?: (appointment: any) => void;
}

const ImprovedAppointmentModal: React.FC<ImprovedAppointmentModalProps> = ({
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

  // Form states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(selectedDate || undefined);
  const [selectedSlot, setSelectedSlot] = useState<IndependentSlot | null>(null);
  const [duration, setDuration] = useState(60);
  const [consultationType, setConsultationType] = useState('control');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Steps management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load patients when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadPatients();
    }
  }, [isOpen, user]);

  // Set initial date and time if provided
  useEffect(() => {
    if (isOpen) {
      // Validate the incoming selectedDate
      const todayColombia = getCurrentColombiaDate();
      let initialDate = selectedDate;

      if (initialDate && isDateInPastColombia(initialDate)) {
        console.warn('Initial date is in the past, defaulting to today.');
        initialDate = todayColombia;
      }

      setSelectedCalendarDate(initialDate || todayColombia);

      if (selectedTime) {
        // Logic to handle pre-selected time can be added here if needed
      }
    }
  }, [isOpen, selectedDate, selectedTime]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await getPatientsByDoctor();
      
      const formattedPatients = patientsData.map((patient: any) => ({
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.email,
        telefono: patient.telefono
      }));
      
      setPatients(formattedPatients);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      
      if (err.response?.status === 404 || err.message?.includes('No patients found')) {
        setPatients([]);
        setError('No tienes pacientes asignados aún.');
      } else {
        // Fallback to mock data for development
        const mockPatients: Patient[] = [
          { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@email.com', telefono: '123456789' },
          { id: 2, nombre: 'María', apellido: 'García', email: 'maria@email.com', telefono: '987654321' },
          { id: 3, nombre: 'Carlos', apellido: 'López', email: 'carlos@email.com', telefono: '456789123' }
        ];
        setPatients(mockPatients);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle calendar slot selection
  const handleSlotSelect = useCallback((slot: IndependentSlot) => {
    setSelectedSlot(slot);
    setError(null);
    console.log('Slot selected:', slot);
  }, []);

  // Handle calendar date selection (for month view)
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedCalendarDate(date);
    setError(null);
    console.log('Date selected:', date);
  }, []);

  // Validate form
  const validateForm = (): string | null => {
    if (!selectedPatient) {
      return 'Debe seleccionar un paciente';
    }
    if (!selectedSlot) {
      return 'Debe seleccionar una fecha y hora';
    }
    if (!reason.trim()) {
      return 'Debe indicar el motivo de la consulta';
    }
    
    return null;
  };

  // Submit appointment
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

    try {
      // Create appointment data
      const appointmentDateTime = new Date(`${selectedSlot!.date}T${selectedSlot!.time}:00`);

      const citaData = {
        pacienteId: selectedPatient!.id,
        doctorId: typeof user.id === 'string' ? parseInt(user.id) : user.id,
        fechaHora: appointmentDateTime.toISOString(),
        duracion: duration,
        tipoConsulta: consultationType as 'primera_vez' | 'control' | 'seguimiento' | 'urgencia',
        motivoConsulta: reason,
        notasPaciente: notes || undefined
      };

      console.log('Creating appointment:', citaData);

      const nuevaCita = await citasService.crearCita(citaData);
      
      // Success feedback
      const fechaFormateada = new Date(nuevaCita.fechaHora).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const horaFormateada = new Date(nuevaCita.fechaHora).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const successMessage = `Cita agendada exitosamente para el ${fechaFormateada} a las ${horaFormateada}`;
      setSuccess(successMessage);
      
      if (onAppointmentCreated) {
        onAppointmentCreated({
          ...nuevaCita,
          successMessage
        });
      }
      
      // Reset form
      resetForm();
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Step navigation functions
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return selectedPatient !== null;
      case 3:
        return selectedPatient !== null && selectedSlot !== null;
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
    setSelectedCalendarDate(undefined);
    setSelectedSlot(null);
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
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl shadow-black/25 border border-gray-200/50 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-4 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
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
                <p className="text-blue-100 text-sm">Sistema de slots independientes</p>
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

        {/* Step indicator */}
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
                      ? 'text-blue-700' : 
                    isCompleted 
                      ? 'text-emerald-700' : 
                    canAccess 
                      ? 'text-gray-700 hover:text-blue-600' : 
                      'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step === 1 && 'Seleccionar Paciente'}
                  {step === 2 && 'Elegir Fecha y Hora'}
                  {step === 3 && 'Finalizar Detalles'}
                </button>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${((currentStep - 1) / 2) * 100}%`
                }}
              ></div>
            </div>
            
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-2">
              {[1, 2, 3].map((step) => {
                const isActive = currentStep === step;
                const isCompleted = completedSteps.includes(step) || currentStep > step;
                
                return (
                  <div 
                    key={step}
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 scale-125'
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Messages */}
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

            {/* STEP 1: Patient Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Seleccionar Paciente</h3>
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
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center font-medium shadow-md hover:shadow-lg"
                  >
                    <span className="mr-2">Continuar</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Date and Time Selection with Unified Calendar */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Elegir Fecha y Hora</h3>
                  <p className="text-gray-600">Selecciona la fecha y hora para la cita con <strong>{selectedPatient?.nombre} {selectedPatient?.apellido}</strong></p>
                </div>

                {/* Unified Calendar Component */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <UnifiedCalendar
                    doctorId={user?.id ? Number(user.id) : 0}
                    onSlotSelect={handleSlotSelect}
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedCalendarDate}
                    selectedSlot={selectedSlot}
                    initialView="week"
                  />
                </div>

                {selectedSlot && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Horario Seleccionado:</h4>
                    <div className="text-sm text-green-800">
                      <p><strong>Fecha:</strong> {format(new Date(selectedSlot.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                      <p><strong>Hora:</strong> {selectedSlot.displayTime}</p>
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
                    disabled={!selectedSlot}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    Continuar
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Final Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Finalizar Detalles</h3>
                  <p className="text-gray-600">Completa los detalles de la cita</p>
                </div>

                {/* Appointment summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen de la Cita:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Paciente:</strong> {selectedPatient?.nombre} {selectedPatient?.apellido}</p>
                    <p><strong>Fecha:</strong> {selectedSlot && format(new Date(selectedSlot.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    <p><strong>Hora:</strong> {selectedSlot?.displayTime}</p>
                  </div>
                </div>

                {/* Form details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="control">Control</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="primera_vez">Primera vez</option>
                      <option value="urgencia">Urgencia</option>
                    </select>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la Consulta *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describa el motivo de la consulta..."
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notas adicionales para el paciente..."
                  />
                </div>

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
                    disabled={loading || !reason.trim()}
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

export default ImprovedAppointmentModal;
