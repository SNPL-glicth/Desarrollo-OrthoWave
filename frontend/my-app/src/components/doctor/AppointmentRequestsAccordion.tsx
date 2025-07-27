import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SolicitudCita {
  id: number;
  fechaHora: string;
  duracion: number;
  tipoConsulta: string;
  motivoConsulta: string;
  notasPaciente?: string;
  estado: 'solicitada' | 'aprobada' | 'rechazada';
  fechaSolicitud: string;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
}

interface AppointmentRequestsAccordionProps {
  doctorId: number;
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToCalendar?: (date: Date) => void;
}

const AppointmentRequestsAccordion: React.FC<AppointmentRequestsAccordionProps> = ({
  doctorId,
  isOpen,
  onToggle,
  onNavigateToCalendar
}) => {
  const [solicitudes, setSolicitudes] = useState<SolicitudCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      // Aquí se conectará al backend real usando el doctorId
      // const response = await api.get(`/doctors/${doctorId}/appointment-requests`);
      // setSolicitudes(response.data);
      
      // Por ahora simulamos solicitudes para el doctor específico
      const mockSolicitudes: SolicitudCita[] = [
        {
          id: 1,
          fechaHora: '2025-01-30T10:00:00',
          duracion: 60,
          tipoConsulta: 'primera_vez',
          motivoConsulta: 'Dolor en la rodilla derecha desde hace 2 semanas',
          notasPaciente: 'Prefiero cita por la mañana',
          estado: 'solicitada',
          fechaSolicitud: '2025-01-25T08:30:00',
          paciente: {
            id: 3,
            nombre: 'Ana María',
            apellido: 'González',
            email: 'ana.gonzalez@email.com',
            telefono: '+57 300 456 7890'
          }
        },
        {
          id: 2,
          fechaHora: '2025-01-28T14:30:00',
          duracion: 45,
          tipoConsulta: 'control',
          motivoConsulta: 'Control post-operatorio de fractura',
          estado: 'solicitada',
          fechaSolicitud: '2025-01-24T16:20:00',
          paciente: {
            id: 4,
            nombre: 'Carlos',
            apellido: 'Ramírez',
            email: 'carlos.ramirez@email.com',
            telefono: '+57 301 234 5678'
          }
        }
      ];
      setSolicitudes(mockSolicitudes);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchSolicitudes();
    }
  }, [isOpen, doctorId, fetchSolicitudes]);

  const handleApproveRequest = async (solicitudId: number) => {
    setProcessingId(solicitudId);
    try {
      // Aquí iría la llamada al backend para aprobar la solicitud
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      setSolicitudes(prev => 
        prev.map(sol => 
          sol.id === solicitudId 
            ? { ...sol, estado: 'aprobada' as const }
            : sol
        )
      );
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (solicitudId: number) => {
    setProcessingId(solicitudId);
    try {
      // Aquí iría la llamada al backend para rechazar la solicitud
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      setSolicitudes(prev => 
        prev.map(sol => 
          sol.id === solicitudId 
            ? { ...sol, estado: 'rechazada' as const }
            : sol
        )
      );
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'solicitada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoConsultaLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'primera_vez': 'Primera vez',
      'control': 'Control',
      'seguimiento': 'Seguimiento',
      'urgencia': 'Urgencia'
    };
    return tipos[tipo] || tipo;
  };

  const solicitudesPendientes = solicitudes.filter(sol => sol.estado === 'solicitada');

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Solicitudes de Citas
            </h3>
            <p className="text-xs text-gray-500">
              {solicitudesPendientes.length} solicitudes pendientes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {solicitudesPendientes.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {solicitudesPendientes.length}
            </span>
          )}
          <svg 
            className={`h-4 w-4 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Cargando solicitudes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No hay solicitudes de citas</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className={`border rounded-lg p-4 ${getEstadoColor(solicitud.estado)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {solicitud.paciente.nombre} {solicitud.paciente.apellido}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado).replace('border-', '')}`}>
                          {solicitud.estado}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <strong>Fecha solicitada:</strong>{' '}
                          {format(new Date(solicitud.fechaHora), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                        <p>
                          <strong>Tipo:</strong> {getTipoConsultaLabel(solicitud.tipoConsulta)}
                        </p>
                        <p>
                          <strong>Duración:</strong> {solicitud.duracion} minutos
                        </p>
                        <p>
                          <strong>Email:</strong> {solicitud.paciente.email}
                        </p>
                        {solicitud.paciente.telefono && (
                          <p>
                            <strong>Teléfono:</strong> {solicitud.paciente.telefono}
                          </p>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Motivo:</p>
                        <p className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                          {solicitud.motivoConsulta}
                        </p>
                      </div>

                      {solicitud.notasPaciente && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900 mb-1">Notas del paciente:</p>
                          <p className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                            {solicitud.notasPaciente}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-3">
                        Solicitada el {format(new Date(solicitud.fechaSolicitud), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 mt-4 pt-3 border-t border-gray-200">
                    {/* Botón Ver en Calendario - siempre visible */}
                    <button
                      onClick={() => {
                        if (onNavigateToCalendar) {
                          const solicitudDate = new Date(solicitud.fechaHora);
                          onNavigateToCalendar(solicitudDate);
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-2 px-3 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>📅 Ver en Calendario</span>
                    </button>
                    
                    {/* Botones de Aprobar/Rechazar - solo para solicitudes pendientes */}
                    {solicitud.estado === 'solicitada' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRequest(solicitud.id)}
                          disabled={processingId === solicitud.id}
                          className="flex-1 bg-green-600 text-white py-2 px-3 text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === solicitud.id ? 'Aprobando...' : '✅ Aprobar'}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(solicitud.id)}
                          disabled={processingId === solicitud.id}
                          className="flex-1 bg-red-600 text-white py-2 px-3 text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === solicitud.id ? 'Rechazando...' : '❌ Rechazar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentRequestsAccordion;
