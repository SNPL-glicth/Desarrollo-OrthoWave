import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { citasService, CrearCitaDto } from '../../services/citasService';
import { getAllPatients } from '../../services/patientService';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, 
         isToday, isSameDay, isWeekend, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCurrentColombiaDate } from '../../utils/dateUtils';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

interface AppointmentSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente?: Paciente | null;
  onSuccess?: () => void;
  selectedDate?: Date | null;
}

// Horarios de trabajo con detalles de notificaciones
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:20`);
    slots.push(`${hour.toString().padStart(2, '0')}:40`);
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

const AppointmentSchedulerModal: React.FC<AppointmentSchedulerModalProps> = ({
  isOpen,
  onClose,
  paciente,
  onSuccess,
  selectedDate: propSelectedDate
}) => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(() => propSelectedDate || getCurrentColombiaDate());
  const [selectedDate, setSelectedDate] = useState<Date | null>(propSelectedDate || null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [view, setView] = useState<'week' | 'month' | 'day'>('day');
  const [formData, setFormData] = useState({
    tipoConsulta: 'primera_vez' as const,
    motivoConsulta: '',
    duracion: 60,
    notasDoctor: '',
    costo: 80000
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estado para selección de paciente cuando no se proporciona
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(paciente || null);
  const [availablePacientes, setAvailablePacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // Obtener citas existentes del doctor
  const fetchExistingAppointments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const appointments = await citasService.obtenerCitasPorDoctor(Number(user.id));
      setExistingAppointments(appointments);
    } catch (err) {
      console.error('Error al obtener citas existentes:', err);
    }
  }, [user?.id]);

  // Cargar todos los pacientes disponibles
  const fetchAvailablePacientes = useCallback(async () => {
    try {
      setLoadingPacientes(true);
      console.log('Fetching all patients...');
      const pacientes = await getAllPatients();
      console.log('Received patients:', pacientes);
      
      if (!pacientes || pacientes.length === 0) {
        console.log('No patients received from API');
        setAvailablePacientes([]);
        setFilteredPacientes([]);
        return;
      }
      
      // Transformar los datos para asegurar compatibilidad
      const transformedPacientes = pacientes.map((p: any) => ({
        id: p.id,
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        email: p.email || '',
        telefono: p.telefono || ''
      }));
      
      // Ordenar por ID descendente para mostrar los más recientes primero
      const sortedPacientes = transformedPacientes.sort((a: Paciente, b: Paciente) => b.id - a.id);
      setAvailablePacientes(sortedPacientes);
      // Mostrar todos los pacientes por defecto cuando se abre el dropdown
      setFilteredPacientes(sortedPacientes);
      console.log('Patients loaded successfully:', sortedPacientes.length);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
      setAvailablePacientes([]);
      setFilteredPacientes([]);
    } finally {
      setLoadingPacientes(false);
    }
  }, []);

  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  const normalizeText = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (acentos)
      .replace(/[^a-z0-9\s@.-]/g, ''); // Mantener solo letras, números, espacios, @ . -
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    console.log('Search term changed:', term);

    if (!term.trim()) {
      // Si no hay término de búsqueda, mostrar los últimos 10 pacientes registrados
      const recentPacientes = availablePacientes.slice(0, 10);
      setFilteredPacientes(recentPacientes);
      console.log('Showing recent patients:', recentPacientes.length);
      return;
    }

    const normalizedSearch = normalizeText(term);
    console.log('Normalized search:', normalizedSearch);

    // Filtrar pacientes por nombre, apellido o email
    const filtered = availablePacientes.filter(paciente => {
      const normalizedFullName = `${normalizeText(paciente.nombre)} ${normalizeText(paciente.apellido)}`;
      const normalizedEmail = normalizeText(paciente.email);
      
      return normalizedFullName.includes(normalizedSearch) || 
             normalizedEmail.includes(normalizedSearch);
    });

    console.log('Filtered patients:', filtered.length);

    // Si no hay coincidencias, mostrar los últimos 10 pacientes registrados
    if (filtered.length === 0) {
      const recentPacientes = availablePacientes.slice(0, 10);
      setFilteredPacientes(recentPacientes);
      console.log('No matches found, showing recent patients:', recentPacientes.length);
    } else {
      setFilteredPacientes(filtered);
    }
  }, [availablePacientes, normalizeText]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchExistingAppointments();
      // Solo cargar pacientes si no se proporcionó uno
      if (!paciente) {
        fetchAvailablePacientes();
      }
    }
  }, [isOpen, user?.id, fetchExistingAppointments, paciente, fetchAvailablePacientes]);

  // Actualizar el paciente seleccionado cuando cambie el prop
  useEffect(() => {
    setSelectedPaciente(paciente || null);
  }, [paciente]);

  // Actualizar la fecha seleccionada y el mes del calendario cuando cambie el prop
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
      setCurrentWeek(propSelectedDate); // Sync calendar month/week view with selected date
    }
  }, [propSelectedDate]);


  // Resetear formulario cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedPaciente(null);
      setSelectedDate(null);
      setSelectedTime('');
      setError(null);
      setSuccessMessage(null);
      setShowPatientDropdown(false);
      setFilteredPacientes([]);
      setFormData({
        tipoConsulta: 'primera_vez',
        motivoConsulta: '',
        duracion: 60,
        notasDoctor: '',
        costo: 80000
      });
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    };

    if (showPatientDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPatientDropdown]);

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
    setCurrentWeek(getCurrentColombiaDate());
    setSelectedDate(null);
    setSelectedTime('');
  };

  // Validar que el horario seleccionado sea válido (solo horas exactas o medias horas)
  const isValidTimeSlot = (time: string): boolean => {
    return TIME_SLOTS.includes(time);
  };

  // Crear cita
  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime || !user?.id) {
      setError('Por favor selecciona fecha y hora');
      return;
    }

    // Verificar que no se pueda agendar en fechas/horas pasadas usando hora de Colombia
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);
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

    if (!selectedPaciente) {
      setError('Por favor selecciona un paciente');
      return;
    }

    if (!isValidTimeSlot(selectedTime)) {
      setError('El horario seleccionado no es válido. Solo se permiten horas exactas o medias horas.');
      return;
    }

    if (!formData.motivoConsulta.trim()) {
      setError('Por favor ingresa el motivo de la consulta');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fechaHora = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      fechaHora.setHours(hours, minutes, 0, 0);

      const citaData: CrearCitaDto = {
        pacienteId: selectedPaciente.id,
        doctorId: Number(user.id),
        fechaHora: fechaHora.toISOString(),
        duracion: formData.duracion,
        tipoConsulta: formData.tipoConsulta,
        motivoConsulta: formData.motivoConsulta,
        costo: formData.costo
      };

      await citasService.crearCita(citaData);
      
      setSuccessMessage(`¡Cita agendada exitosamente para ${selectedPaciente.nombre} ${selectedPaciente.apellido}!`);
      
      // Actualizar citas existentes
      await fetchExistingAppointments();
      
      // Resetear formulario
      setSelectedDate(null);
      setSelectedTime('');
      if (!paciente) {
        setSelectedPaciente(null);
      }
      setFormData({
        tipoConsulta: 'primera_vez',
        motivoConsulta: '',
        duracion: 60,
        notasDoctor: '',
        costo: 80000
      });

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const weekDays = getWeekDays();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="p-6">
          {/* Navegación del calendario */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    view === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    view === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={view === 'week' ? goToPreviousWeek : goToPreviousMonth}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                {view === 'week' 
                  ? `${format(weekDays[0], 'd MMM', { locale: es })} - ${format(weekDays[6], 'd MMM yyyy', { locale: es })}`
                  : format(currentWeek, "MMMM yyyy", { locale: es })
                }
              </div>
              
              <button
                onClick={view === 'week' ? goToNextWeek : goToNextMonth}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={goToToday}
                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Hoy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg overflow-hidden">
                {view === 'day' ? (
                  /* Vista diaria estilo Google Calendar */
                  <div>
                    {/* Header del día seleccionado */}
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedDate ? (
                              <>
                                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                {isToday(selectedDate) && (
                                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Hoy
                                  </span>
                                )}
                              </>
                            ) : (
                              "Selecciona un día"
                            )}
                          </h3>
                          {selectedDate && !isDiaLaboral(selectedDate) && (
                            <p className="text-sm text-red-600 mt-1">
                              ⚠️ Día no laborable - No se pueden agendar citas
                            </p>
                          )}
                        </div>
                        {selectedDate && (
                          <button
                            onClick={() => {
                              setSelectedDate(new Date());
                              setCurrentWeek(new Date());
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ir a hoy
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selector de día si no hay día seleccionado */}
                    {!selectedDate && (
                      <div className="p-8 text-center">
                        <div className="max-w-md mx-auto">
                          <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Selecciona un día para agendar
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Usa los botones de navegación arriba para cambiar a vista semanal o mensual y seleccionar un día.
                          </p>
                          <button
                            onClick={() => {
                              setSelectedDate(new Date());
                              setCurrentWeek(new Date());
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                          >
                            Seleccionar hoy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Horarios del día */}
                    {selectedDate && (
                      <div className="max-h-96 overflow-y-auto">
                        <div className="divide-y divide-gray-100">
                          {TIME_SLOTS.map(time => {
                            const isLaboral = isDiaLaboral(selectedDate);
                            const isOccupied = isTimeSlotOccupied(selectedDate, time);
                            const isSelected = selectedTime === time;
                            
                            // Verificar si es un día pasado
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dayOnly = new Date(selectedDate);
                            dayOnly.setHours(0, 0, 0, 0);
                            const isPastDay = dayOnly < today;
                            
                            // Verificar si es una hora pasada del día actual
                            const now = new Date();
                            const [hours, minutes] = time.split(':').map(Number);
                            const timeDate = new Date(selectedDate);
                            timeDate.setHours(hours, minutes, 0, 0);
                            const isPastTime = isToday(selectedDate) && timeDate < now;
                            
                            const canSelect = isLaboral && !isOccupied && !isPastDay && !isPastTime;

                            return (
                              <div
                                key={time}
                                className={`flex items-center p-4 transition-all duration-200 ${
                                  isPastDay || isPastTime ? 'bg-gray-50 opacity-60' :
                                  !isLaboral ? 'bg-red-50' :
                                  isOccupied ? 'bg-gray-100' :
                                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' :
                                  canSelect ? 'hover:bg-blue-25 cursor-pointer' : 'cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (canSelect) {
                                    setSelectedTime(time);
                                    setError(null);
                                  }
                                }}
                              >
{/* Modal con campana de notificaciones */}
                        
                                <div className="w-20 flex-shrink-0">
                                  <div className={`text-sm font-medium ${
                                    isPastDay || isPastTime ? 'text-gray-400' :
                                    isSelected ? 'text-blue-700' : 'text-gray-900'
                                  }`}>
                                    {time}
                                  </div>
                                </div>

                                {/* Contenido del slot */}
                                <div className="flex-1 ml-4">
                                  {isPastDay || isPastTime ? (
                                    <div className="text-sm text-gray-400">
                                      <span className="inline-flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Hora pasada
                                      </span>
                                    </div>
                                  ) : !isLaboral ? (
                                    <div className="text-sm text-red-600">
                                      <span className="inline-flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                        </svg>
                                        No laborable
                                      </span>
                                    </div>
                                  ) : isOccupied ? (
                                    <div className="text-sm text-gray-600">
                                      <span className="inline-flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Cita ocupada
                                      </span>
                                    </div>
                                  ) : isSelected ? (
                                    <div className="text-sm text-blue-700 font-medium">
                                      <span className="inline-flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Horario seleccionado
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      <span className="inline-flex items-center hover:text-blue-600 transition-colors">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Disponible - Clic para seleccionar
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Indicador visual */}
                                <div className="w-3 h-3 rounded-full flex-shrink-0">
                                  {isPastDay || isPastTime ? (
                                    <div className="w-full h-full bg-gray-300 rounded-full"></div>
                                  ) : !isLaboral ? (
                                    <div className="w-full h-full bg-red-300 rounded-full"></div>
                                  ) : isOccupied ? (
                                    <div className="w-full h-full bg-gray-400 rounded-full"></div>
                                  ) : isSelected ? (
                                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                                  ) : (
                                    <div className="w-full h-full bg-green-400 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Vista semanal y mensual (mantenemos la implementación actual) */
                  <div>
                    {/* Header de días */}
                    <div className="grid grid-cols-7 bg-gray-50">
                      {weekDays.map(day => (
                        <div key={day.toString()} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                          <div className="text-sm font-medium text-gray-700">
                            {format(day, 'EEE', { locale: es })}
                          </div>
                          <div className={`text-lg font-bold cursor-pointer hover:text-blue-600 ${
                            isToday(day) ? 'text-blue-600' : 'text-gray-900'
                          } ${
                            !isDiaLaboral(day) ? 'text-red-500' : ''
                          } ${
                            selectedDate && isSameDay(day, selectedDate) ? 'bg-blue-100 rounded' : ''
                          }`}
                          onClick={() => {
                            setSelectedDate(day);
                            setView('day');
                            setSelectedTime('');
                          }}>
                            {format(day, 'd')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grid de horarios */}
                    <div className="max-h-96 overflow-y-auto">
                      {TIME_SLOTS.map(time => (
                        <div key={time} className="grid grid-cols-7 border-b border-gray-100 hover:bg-gray-50">
                          {weekDays.map(day => {
                            const isLaboral = isDiaLaboral(day);
                            const isOccupied = isTimeSlotOccupied(day, time);
                            const isSelected = selectedDate && isSameDay(day, selectedDate) && selectedTime === time;
                            
                            // Verificar si es un día pasado
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dayOnly = new Date(day);
                            dayOnly.setHours(0, 0, 0, 0);
                            const isPastDay = dayOnly < today;
                            
                            const canSelect = isLaboral && !isOccupied && !isPastDay;

                            return (
                              <div
                                key={`${day}-${time}`}
                                className={`p-2 text-center border-r border-gray-100 last:border-r-0 transition-colors ${
                                  isPastDay ? 'bg-gray-50 text-gray-300 cursor-not-allowed' :
                                  !isLaboral ? 'bg-red-50 text-red-400' :
                                  isOccupied ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                                  isSelected ? 'bg-blue-100 border-blue-500' :
                                  canSelect ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (canSelect) {
                                    setSelectedDate(day);
                                    setSelectedTime(time);
                                    setError(null);
                                  }
                                }}
                              >
                                <div className="text-xs">
                                  {time}
                                </div>
                                {isOccupied && (
                                  <div className="text-xs text-red-600 mt-1">
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
                )}
              </div>
            </div>

            {/* Formulario de cita */}
            <div className="space-y-4">
              {/* Búsqueda de paciente si no se proporciona */}
              {!paciente && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Paciente *
                  </label>
                  {loadingPacientes ? (
                    <div className="p-2 text-sm text-gray-500 flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando pacientes...
                    </div>
                  ) : (
                    <div className="relative patient-search-container" ref={patientSearchRef}>
                      <input
                        type="text"
                        value={selectedPaciente ? `${selectedPaciente.nombre} ${selectedPaciente.apellido}` : searchTerm}
                        onChange={(e) => {
                          if (selectedPaciente) {
                            setSelectedPaciente(null);
                          }
                          handleSearchChange(e.target.value);
                        }}
                        onFocus={() => {
                          setShowPatientDropdown(true);
                          console.log('Input focused, showing dropdown. Available patients:', availablePacientes.length, 'Filtered:', filteredPacientes.length);
                          
                          // Si no hay término de búsqueda, mostrar pacientes recientes
                          if (!searchTerm.trim() && availablePacientes.length > 0) {
                            const recentPacientes = availablePacientes.slice(0, 10);
                            setFilteredPacientes(recentPacientes);
                          }
                        }}
                        placeholder="Escribe el nombre, apellido o email del paciente..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      {/* Dropdown de pacientes */}
                      {showPatientDropdown && filteredPacientes.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredPacientes.map((pacienteItem) => (
                            <div
                              key={pacienteItem.id}
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setSelectedPaciente(pacienteItem);
                                setSearchTerm('');
                                setShowPatientDropdown(false);
                                console.log('Patient selected:', pacienteItem);
                              }}
                            >
                              <div className="font-medium text-gray-900">
                                {pacienteItem.nombre} {pacienteItem.apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pacienteItem.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pacienteItem.telefono}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Mensaje cuando no hay pacientes disponibles */}
                      {showPatientDropdown && filteredPacientes.length === 0 && availablePacientes.length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                          <div className="text-sm text-gray-500 text-center">
                            No hay pacientes registrados
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cita Seleccionada</h3>
                {selectedDate && selectedTime ? (
                  <div className="text-sm text-gray-700">
                    <p><strong>Fecha:</strong> {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</p>
                    <p><strong>Hora:</strong> {selectedTime}</p>
                    {selectedPaciente && (
                      <p><strong>Paciente:</strong> {selectedPaciente.nombre} {selectedPaciente.apellido}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Selecciona fecha y hora en el calendario</p>
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
                  placeholder="Describe el motivo de la consulta..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
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
                  Costo de la Consulta
                </label>
                <input
                  type="number"
                  value={formData.costo}
                  onChange={(e) => setFormData({ ...formData, costo: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Doctor (opcional)
                </label>
                <textarea
                  value={formData.notasDoctor}
                  onChange={(e) => setFormData({ ...formData, notasDoctor: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateAppointment}
                  disabled={loading || !selectedDate || !selectedTime || !formData.motivoConsulta.trim() || (!paciente && !selectedPaciente)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agendando...
                    </>
                  ) : (
                    'Agendar Cita'
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

export default AppointmentSchedulerModal;
