import React, { useState, useMemo } from 'react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday, 
  isSameDay, 
  isBefore, 
  startOfDay,
  addMonths,
  subMonths,
  isSameMonth,
  isAfter
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useDoctorAvailability } from '../../hooks/useDoctorAvailability';
import { useAuth } from '../../context/AuthContext';
import { getCurrentColombiaDate } from '../../utils/dateUtils';

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
}

interface ScalableDoctorCalendarProps {
  doctor: Doctor;
  onRequestAppointment: (appointmentData: any) => void;
  onClose: () => void;
}

const ScalableDoctorCalendar: React.FC<ScalableDoctorCalendarProps> = ({
  doctor,
  onRequestAppointment,
  onClose
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getCurrentColombiaDate());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningData, setWarningData] = useState<any>(null);
  
  // Formulario de solicitud
  const [formData, setFormData] = useState({
    tipoConsulta: 'primera_vez' as const,
    motivoConsulta: '',
    duracion: 60,
    notasPaciente: ''
  });

  // Hook escalable para obtener disponibilidad del doctor específico
  const {
    schedule,
    isLoading,
    error,
    refreshAvailability
  } = useDoctorAvailability({
    doctorId: doctor.id,
    selectedDate,
    refreshInterval: 30000 // Refresh cada 30 segundos
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const monthDays = useMemo(() => {
    const startMonth = startOfMonth(selectedDate);
    const endMonth = endOfMonth(selectedDate);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 }); // Comienza desde lunes
    const endDate = endOfWeek(endMonth, { weekStartsOn: 1 });

    const days = [];
    for (let day = startDate; !isAfter(day, endDate); day = addDays(day, 1)) {
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const weekDayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Colores para estados de slots
  const getSlotColor = (slot: any) => {
    if (slot.isOccupied) {
      switch (slot.estado) {
        case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'aprobada': return 'bg-green-100 text-green-800 border-green-300';
        case 'confirmada': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'bg-gray-100 text-gray-600 border-gray-300';
      }
    }
    return selectedTime === slot.time 
      ? 'bg-blue-500 text-white border-blue-600 shadow-md'
      : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300';
  };

  // Manejar selección de slot
  const handleSlotClick = (slot: any) => {
    console.log('🎯 Slot clickeado:', slot);
    
    if (slot.isAvailable && !slot.isOccupied) {
      setSelectedTime(slot.time);
      setShowForm(true);
      console.log('✅ Slot seleccionado:', slot.time);
    } else {
      console.log('❌ Slot no disponible:', {
        time: slot.time,
        isAvailable: slot.isAvailable,
        isOccupied: slot.isOccupied,
        estado: slot.estado
      });
      
      if (slot.isOccupied) {
        let mensaje = `El horario ${slot.time} ya está ocupado`;
        if (slot.estado) {
          mensaje += ` (${slot.estado})`;
        }
        alert(mensaje);
      } else {
        alert(`El horario ${slot.time} no está disponible`);
      }
    }
  };

  // Función para mostrar modal de advertencia de antelación
  const showAdvanceTimeWarning = (data: any) => {
    setWarningData(data);
    setShowWarningModal(true);
  };

  // Enviar solicitud de cita
  const handleSubmitRequest = async () => {
    // Validaciones básicas
    if (!selectedTime || !formData.motivoConsulta.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!user?.id || !doctor?.id) {
      alert('Error de autenticación. Por favor, recarga la página e intenta de nuevo.');
      return;
    }

    // Validación: evitar agendar en fechas/horas pasadas y verificar antelación mínima
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(hours, minutes, 0, 0);
      const nowColombia = getCurrentColombiaDate();
      
      // Antelación mínima de 1 hora
      const minimumAdvanceTime = new Date(nowColombia.getTime() + (60 * 60 * 1000)); // +1 hora
      
      if (selectedDateTime <= nowColombia) {
        const currentTimeStr = nowColombia.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Bogota'
        });
        const currentDateStr = nowColombia.toLocaleDateString('es-CO', {
          timeZone: 'America/Bogota'
        });
        
        // Mostrar modal bonito en lugar de alert
        showAdvanceTimeWarning({
          type: 'past',
          selectedTime: selectedTime,
          selectedDate: selectedDate,
          currentTime: currentTimeStr,
          currentDate: currentDateStr,
          minimumTime: null
        });
        return;
      }
      
      if (selectedDateTime <= minimumAdvanceTime) {
        const minimumTimeStr = minimumAdvanceTime.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Bogota'
        });
        const currentTimeStr = nowColombia.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Bogota'
        });
        
        // Mostrar modal bonito para antelación mínima
        showAdvanceTimeWarning({
          type: 'advance',
          selectedTime: selectedTime,
          selectedDate: selectedDate,
          currentTime: currentTimeStr,
          minimumTime: minimumTimeStr
        });
        return;
      }

      setSubmitting(true);
      
      // Crear fecha correcta en zona horaria de Colombia
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      
      // Formatear como ISO string con timezone de Colombia (UTC-5)
      const fechaHoraISO = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000-05:00`;
      
      console.log('📅 Fecha seleccionada:', format(selectedDate, 'yyyy-MM-dd'));
      console.log('⏰ Hora seleccionada:', selectedTime);
      console.log('🌍 Fecha/Hora ISO Colombia:', fechaHoraISO);
      console.log('🔄 Verificación:', new Date(fechaHoraISO).toLocaleString('es-CO', { timeZone: 'America/Bogota' }));

      const solicitudData = {
        doctorId: doctor.id,
        pacienteId: Number(user?.id),
        fechaHora: fechaHoraISO,
        duracion: formData.duracion || 60,
        tipoConsulta: formData.tipoConsulta || 'primera_vez',
        motivoConsulta: formData.motivoConsulta.trim(),
        notasPaciente: formData.notasPaciente?.trim() || ''
      };

      console.log('🚀 Enviando solicitud de cita:', solicitudData);

      await onRequestAppointment(solicitudData);
      
      console.log('✅ Solicitud de cita enviada exitosamente');
      
      // Resetear formulario
      setSelectedTime('');
      setShowForm(false);
      setFormData({
        tipoConsulta: 'primera_vez',
        motivoConsulta: '',
        duracion: 60,
        notasPaciente: ''
      });
      
      // Refrescar la disponibilidad para mostrar el cambio
      setTimeout(() => {
        try {
          refreshAvailability();
        } catch (refreshError) {
          console.warn('Error al refrescar disponibilidad:', refreshError);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Error al solicitar cita:', error);
      
      // Mejorar el manejo de errores específicos
      let errorMessage = 'Error al enviar la solicitud. Inténtalo de nuevo.';
      
      if (error?.response?.status === 409) {
        errorMessage = 'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde o contacta al soporte.';
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-auto">
        
        {/* Header del Doctor */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">
                  {doctor.nombre.charAt(0)}{doctor.apellido.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Dr. {doctor.nombre} {doctor.apellido}
                </h2>
                <p className="text-blue-100 text-sm">{doctor.especialidad}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshAvailability}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Actualizar disponibilidad"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[calc(95vh-120px)]">
          
          {/* Calendario */}
          <div className="flex-1 p-6">
            
            {/* Navegación mensual */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedDate(prev => subMonths(prev, 1))}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold text-center mb-4">
                {format(selectedDate, "MMMM yyyy", { locale: es })}
              </h3>
              
              <button
                onClick={() => setSelectedDate(prev => addMonths(prev, 1))}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid del calendario */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {eachDayOfInterval({
                start: startOfWeek(startOfMonth(selectedDate)),
                end: endOfWeek(endOfMonth(selectedDate))
              }).map((day) => {
                const isPastDay = isBefore(day, startOfDay(getCurrentColombiaDate()));
                const isCurrentMonth = isSameMonth(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isPastDay && setSelectedDate(day)}
                    disabled={isPastDay}
                    className={`h-12 text-center rounded-lg border transition-colors ${
                      isSameDay(day, selectedDate)
                        ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                        : isToday(day)
                        ? 'bg-green-50 border-green-300 text-green-800 ring-2 ring-green-200'
                        : isPastDay
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : !isCurrentMonth
                        ? 'text-gray-400 border-gray-200 hover:bg-gray-50'
                        : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">
                      {format(day, 'd')}
                    </div>
                    {isToday(day) && (
                      <div className="text-xs mt-1 font-medium">
                        Hoy
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slots de tiempo */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 mb-3">
                Horarios disponibles - {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </h4>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando disponibilidad...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error: {error}</p>
                  <button
                    onClick={refreshAvailability}
                    className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : schedule.timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay horarios configurados para este día</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {schedule.timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.isOccupied}
                      className={`p-3 text-sm font-medium rounded-lg border transition-all ${
                        getSlotColor(slot)
                      } ${slot.isOccupied ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div>{slot.time}</div>
                      {slot.isOccupied && (
                        <div className="text-xs mt-1 opacity-75">
                          {slot.estado}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 mt-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Pendiente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Aprobada</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Confirmada</span>
              </div>
            </div>
          </div>

          {/* Panel de solicitud */}
          {showForm && (
            <div className="w-full lg:w-96 border-l border-gray-200 p-6 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-4">Solicitar Cita</h4>
              
              {/* Resumen de selección */}
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="text-sm text-blue-800">
                  <div><strong>Fecha:</strong> {format(selectedDate, "d 'de' MMMM", { locale: es })}</div>
                  <div><strong>Hora:</strong> {selectedTime}</div>
                  <div><strong>Doctor:</strong> Dr. {doctor.nombre} {doctor.apellido}</div>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Consulta
                  </label>
                  <select
                    value={formData.tipoConsulta}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoConsulta: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="primera_vez">Primera vez</option>
                    <option value="control">Control</option>
                    <option value="seguimiento">Seguimiento</option>
                    <option value="urgencia">Urgencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de la Consulta *
                  </label>
                  <textarea
                    value={formData.motivoConsulta}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivoConsulta: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe el motivo de tu consulta..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración Estimada
                  </label>
                  <select
                    value={formData.duracion}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracion: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={20}>20 minutos</option>
                    <option value={40}>40 minutos</option>
                    <option value={60}>60 minutos</option>
                    <option value={80}>80 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notasPaciente}
                    onChange={(e) => setFormData(prev => ({ ...prev, notasPaciente: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Información adicional..."
                  />
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={submitting || !formData.motivoConsulta.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Enviando...' : 'Solicitar Cita'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedTime('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de advertencia de antelación */}
        {showWarningModal && warningData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {warningData.type === 'past' ? 'Horario en el pasado' : 'Antelación mínima requerida'}
                  </h3>
                </div>
              </div>
              
              <div className="mt-2">
                {warningData.type === 'past' ? (
                  <p className="text-sm text-gray-500">
                    No puedes agendar una cita en una fecha y hora que ya ha pasado.
                    <br/><br/>
                    <strong>Hora actual:</strong> {warningData.currentDate} {warningData.currentTime}
                    <br/>
                    <strong>Hora seleccionada:</strong> {format(warningData.selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })} {warningData.selectedTime}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Para agendar una cita, debes hacerlo con al menos 1 hora de antelación.
                    <br/><br/>
                    <strong>Hora actual:</strong> {warningData.currentTime}
                    <br/>
                    <strong>Hora mínima permitida:</strong> {warningData.minimumTime}
                    <br/>
                    <strong>Hora seleccionada:</strong> {warningData.selectedTime}
                  </p>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningData(null);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScalableDoctorCalendar;
