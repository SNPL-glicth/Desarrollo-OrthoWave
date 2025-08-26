import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit?: (event: CalendarEvent) => void;
  onCancel?: (event: CalendarEvent) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onCancel
}) => {
  if (!isOpen || !event) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      // Estados en inglés (tipos definidos)
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200', 
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'no_show': 'bg-gray-100 text-gray-800 border-gray-200',
      // Estados en español (para compatibilidad con backend)
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'aprobada': 'bg-blue-100 text-blue-800 border-blue-200',
      'confirmada': 'bg-green-100 text-green-800 border-green-200',
      'en_curso': 'bg-purple-100 text-purple-800 border-purple-200',
      'completada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'cancelada': 'bg-red-100 text-red-800 border-red-200',
      'no_asistio': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pendiente': 'Pendiente de Aprobación',
      'aprobada': 'Aprobada - Pendiente Confirmación',
      'confirmada': 'Confirmada',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Detalles de la Cita</h2>
              <p className="text-blue-100 text-sm">ID: {event.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
              {getStatusLabel(event.status)}
            </span>
            {event.type === 'appointment' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Cita Médica
              </span>
            )}
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-900">{event.title}</p>
              </div>
              {event.extendedProps?.email && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{event.extendedProps.email}</p>
                </div>
              )}
              {event.extendedProps?.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Teléfono</p>
                  <p className="text-gray-900">{event.extendedProps.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">ID Paciente</p>
                <p className="text-gray-900">{event.extendedProps?.patientId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Date & Time Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fecha y Hora
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Fecha</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(event.startTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Horario</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Duración</p>
                <p className="text-gray-900">
                  {Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60000)} minutos
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Tipo de Consulta</p>
                <p className="text-gray-900 capitalize">{event.extendedProps?.serviceType || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          {event.description && (
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Motivo de la Consulta
              </h3>
              <p className="text-gray-900 leading-relaxed">{event.description}</p>
            </div>
          )}

          {event.extendedProps?.notes && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notas Adicionales
              </h3>
              <p className="text-gray-900 leading-relaxed">{event.extendedProps.notes}</p>
            </div>
          )}

          {/* Debug Info - Only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">🔧 Debug Info (Dev Only)</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Start Time ISO:</strong> {event.startTime.toISOString()}</p>
                <p><strong>End Time ISO:</strong> {event.endTime.toISOString()}</p>
                <p><strong>Start Time Local:</strong> {event.startTime.toString()}</p>
                <p><strong>Start Time Colombia:</strong> {event.startTime.toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
                {event.extendedProps?.originalFechaHora && (
                  <p><strong>Original fechaHora:</strong> {event.extendedProps.originalFechaHora.toString()}</p>
                )}
                <p><strong>Timezone Offset:</strong> {event.startTime.getTimezoneOffset()} minutes</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-3">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}
            {onCancel && event.status !== 'cancelled' && event.status !== 'completed' && (
              <button
                onClick={() => onCancel(event)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar Cita
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
