import React, { useState, useMemo } from 'react';
import { citasService, Cita } from '../../services/citasService.ts';
import { useAuth } from '../../context/AuthContext';
import usePollingCitas from '../../hooks/usePollingCitas.ts';

const PendingAppointments: React.FC = () => {
  const { user } = useAuth();
  const [processingCita, setProcessingCita] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Usar el hook de polling para obtener citas automáticamente
  const { citas, loading, error, lastUpdate, refresh } = usePollingCitas({
    interval: 15000, // 15 segundos para citas pendientes
    enabled: user?.rol === 'doctor',
    onError: (err) => console.error('Error en polling:', err)
  });

  // Filtrar solo citas pendientes y confirmadas
  const citasPendientes = useMemo(() => {
    return citas.filter(cita => 
      cita.estado === 'pendiente' || cita.estado === 'confirmada'
    );
  }, [citas]);

  // Ocultar feedback después de 3 segundos
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const actualizarEstadoCita = async (citaId: number, nuevoEstado: string, razon?: string) => {
    try {
      setProcessingCita(citaId);
      
      await citasService.actualizarEstadoCita(citaId, {
        estado: nuevoEstado as any,
        razonRechazo: razon
      });
      
      // Mostrar feedback inmediato
      const accionTexto = nuevoEstado === 'confirmada' ? 'confirmada' : 'cancelada';
      showFeedback('success', `Cita ${accionTexto} exitosamente`);
      
      // El hook de polling se encargará de actualizar automáticamente
      refresh();
    } catch (err: any) {
      console.error('Error al actualizar cita:', err);
      showFeedback('error', err.message || 'Error al actualizar la cita');
    } finally {
      setProcessingCita(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmada':
        return 'bg-blue-100 text-blue-800';
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'aprobada':
        return 'Aprobada';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Citas Pendientes</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Citas Pendientes</h2>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Citas Pendientes</h2>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="text-blue-600 hover:text-blue-800"
            title="Actualizar citas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {citasPendientes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 2h4M5 13v7a2 2 0 002 2h10a2 2 0 002-2v-7M5 13V6a2 2 0 012-2h10a2 2 0 012 2v7M5 13l7-7 7 7" />
            </svg>
          </div>
          <p className="text-gray-600">No hay citas pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {citasPendientes.map((cita) => (
            <div
              key={cita.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {cita.paciente?.nombre} {cita.paciente?.apellido}
                  </h3>
                  <p className="text-sm text-gray-600">{cita.paciente?.email}</p>
                  {cita.paciente?.telefono && (
                    <p className="text-sm text-gray-600">Tel: {cita.paciente.telefono}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                  {getEstadoTexto(cita.estado)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Fecha:</p>
                  <p className="text-gray-600">{formatearFecha(cita.fechaHora)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Hora:</p>
                  <p className="text-gray-600">{formatearHora(cita.fechaHora)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Tipo:</p>
                  <p className="text-gray-600 capitalize">{cita.tipoConsulta?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Duración:</p>
                  <p className="text-gray-600">{cita.duracion} minutos</p>
                </div>
              </div>

              {cita.motivoConsulta && (
                <div className="mb-3">
                  <p className="font-medium text-gray-700 text-sm">Motivo:</p>
                  <p className="text-gray-600 text-sm">{cita.motivoConsulta}</p>
                </div>
              )}

              {cita.notasPaciente && (
                <div className="mb-3">
                  <p className="font-medium text-gray-700 text-sm">Notas del paciente:</p>
                  <p className="text-gray-600 text-sm">{cita.notasPaciente}</p>
                </div>
              )}

              {cita.costo && (
                <div className="mb-3">
                  <p className="font-medium text-gray-700 text-sm">Costo:</p>
                  <p className="text-green-600 text-sm font-semibold">${cita.costo.toLocaleString()}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 pt-3 border-t">
                {cita.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => actualizarEstadoCita(cita.id, 'confirmada')}
                      disabled={processingCita === cita.id}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingCita === cita.id ? 'Procesando...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => actualizarEstadoCita(cita.id, 'cancelada', 'Cancelada por el doctor')}
                      disabled={processingCita === cita.id}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {processingCita === cita.id ? 'Procesando...' : 'Cancelar'}
                    </button>
                  </>
                )}
                {cita.estado === 'confirmada' && (
                  <>
                    <button
                      onClick={() => actualizarEstadoCita(cita.id, 'en_curso')}
                      disabled={processingCita === cita.id}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processingCita === cita.id ? 'Procesando...' : 'Iniciar Consulta'}
                    </button>
                    <button
                      onClick={() => actualizarEstadoCita(cita.id, 'cancelada', 'Cancelada por el doctor')}
                      disabled={processingCita === cita.id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Feedback de acciones */}
      {actionFeedback && (
        <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
          actionFeedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {actionFeedback.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {actionFeedback.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAppointments;
