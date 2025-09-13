import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointmentRequests } from '../../hooks/useAppointmentRequests';
import { SolicitudCita } from '../../services/appointmentRequestsService';

interface AppointmentRequestsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCalendar?: (date: Date) => void;
}

const AppointmentRequestsOffcanvas: React.FC<AppointmentRequestsOffcanvasProps> = ({
  isOpen,
  onClose,
  onNavigateToCalendar
}) => {
  const {
    solicitudes,
    contadorPendientes,
    loading,
    error,
    cargarSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
  } = useAppointmentRequests();

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  const handleApprove = async (solicitud: SolicitudCita) => {
    setProcessingId(solicitud.id);
    try {
      await aprobarSolicitud(solicitud.id);
      // Mostrar notificación de éxito (puedes agregar un toast aquí)
    } catch (error) {
      console.error('Error al aprobar:', error);
      // Mostrar notificación de error
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (solicitud: SolicitudCita) => {
    setProcessingId(solicitud.id);
    try {
      await rechazarSolicitud(solicitud.id, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al rechazar:', error);
      // Mostrar notificación de error
    } finally {
      setProcessingId(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
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

  return (
    <>
      {/* Overlay moderno con blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
          style={{ zIndex: 9998 }}
          onClick={onClose}
        />
      )}

      {/* Offcanvas rediseñado - Responsivo */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-white/95 backdrop-blur-lg shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Header moderno con tema OrtoWhave */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-600/50 to-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Solicitudes de Citas
              </h2>
              <p className="text-sm text-gray-500">
                {contadorPendientes} pendientes • {solicitudes.length} total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content con diseño moderno */}
        <div 
          className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {loading && solicitudes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300/20 border-t-gray-600"></div>
                <div className="absolute inset-0 rounded-full bg-gray-600/10 animate-pulse"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Cargando solicitudes...</p>
              <p className="text-sm text-gray-400 mt-1">Un momento por favor</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar solicitudes</h3>
              <p className="text-sm text-gray-600 mb-1">{error}</p>
              <p className="text-xs text-gray-400 mb-6">Verifica tu conexión y que el backend esté funcionando</p>
              <button
                onClick={cargarSolicitudes}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hay solicitudes
              </h3>
              <p className="text-gray-500 mb-6">
                No tienes solicitudes de citas en este momento.
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  📝 Las nuevas solicitudes aparecerán aquí automáticamente
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className={`p-6 ${getEstadoColor(solicitud.estado)} border-l-4`}
                >
                  {/* Header de la solicitud */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {solicitud.paciente.nombre} {solicitud.paciente.apellido}
                      </h4>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        getEstadoColor(solicitud.estado).replace('border-', '').replace('bg-', 'bg-').replace('text-', 'text-')
                      }`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Información de la solicitud */}
                  <div className="space-y-2 text-sm mb-4">
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

                  {/* Motivo de la consulta */}
                  <div className="mb-4">
                    <p className="font-medium text-gray-900 mb-1">Motivo:</p>
                    <p className="text-sm text-gray-700 bg-white bg-opacity-50 p-3 rounded-md">
                      {solicitud.motivoConsulta}
                    </p>
                  </div>

                  {/* Notas del paciente */}
                  {solicitud.notasPaciente && (
                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-1">Notas del paciente:</p>
                      <p className="text-sm text-gray-700 bg-white bg-opacity-50 p-3 rounded-md">
                        {solicitud.notasPaciente}
                      </p>
                    </div>
                  )}

                  {/* Razón de rechazo */}
                  {solicitud.estado === 'rechazada' && solicitud.razonRechazo && (
                    <div className="mb-4">
                      <p className="font-medium text-red-900 mb-1">Razón del rechazo:</p>
                      <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
                        {solicitud.razonRechazo}
                      </p>
                    </div>
                  )}

                  {/* Fecha de solicitud */}
                  <p className="text-xs text-gray-500 mb-4">
                    Solicitada el {format(new Date(solicitud.fechaCreacion), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </p>

                  {/* Acciones */}
                  <div className="space-y-2">
                    {/* Botón Ver en Calendario */}
                    <button
                      onClick={() => {
                        if (onNavigateToCalendar) {
                          const solicitudDate = new Date(solicitud.fechaHora);
                          onNavigateToCalendar(solicitudDate);
                          onClose();
                        }
                      }}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ver en Calendario</span>
                    </button>
                    
                    {/* Botones de Aprobar/Rechazar - solo para solicitudes pendientes */}
                    {solicitud.estado === 'pendiente' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(solicitud)}
                          disabled={processingId === solicitud.id}
                          className="flex-1 bg-green-600 text-white py-2 px-4 text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processingId === solicitud.id ? 'Aprobando...' : '✅ Aprobar'}
                        </button>
                        <button
                          onClick={() => setShowRejectModal(solicitud.id)}
                          disabled={processingId === solicitud.id}
                          className="flex-1 bg-red-600 text-white py-2 px-4 text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botón de actualizar */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={cargarSolicitudes}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmación de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Solicitud
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas rechazar esta solicitud? Opcionalmente puedes proporcionar una razón.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Razón del rechazo (opcional)"
              className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const solicitud = solicitudes.find(s => s.id === showRejectModal);
                  if (solicitud) {
                    handleReject(solicitud);
                  }
                }}
                disabled={processingId === showRejectModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingId === showRejectModal ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentRequestsOffcanvas;
