import React, { useState, useEffect } from 'react';
import { useCitas } from '../../contexts/CitasContext';
import { citasService } from '../../services/citasService';

const MyAppointmentsWidget: React.FC = () => {
  const { state, fetchCitas } = useCitas();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCitas = async () => {
      try {
        setLoading(true);
        await fetchCitas();
      } catch (err: any) {
        setError(err.message || 'Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };

    loadCitas();
  }, [fetchCitas]);

  const upcomingCitas = state.citas
    .filter(cita => {
      const citaDate = new Date(cita.fechaHora);
      const now = new Date();
      return citaDate > now && ['pendiente', 'confirmada', 'aprobada'].includes(cita.estado);
    })
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, 3); // Mostrar solo las próximas 3 citas

  const recentCitas = state.citas
    .filter(cita => {
      const citaDate = new Date(cita.fechaHora);
      const now = new Date();
      return citaDate <= now || ['completada', 'cancelada'].includes(cita.estado);
    })
    .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
    .slice(0, 2); // Mostrar solo las últimas 2 citas

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Citas</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mis Citas</h3>
        <span className="text-sm text-gray-500">
          Total: {state.citas.length}
        </span>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {state.citas.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 14V11m-4 4h8m-8 0a2 2 0 00-2 2v2a2 2 0 002 2h8a2 2 0 002-2v-2a2 2 0 00-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No tienes citas programadas</p>
          <p className="text-gray-400 text-xs mt-1">
            Utiliza el botón "Agendar Cita Rápida" para programar una nueva cita
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Próximas citas */}
          {upcomingCitas.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Próximas Citas</h4>
              <div className="space-y-2">
                {upcomingCitas.map((cita) => (
                  <div key={cita.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          Dr. {cita.doctor?.nombre} {cita.doctor?.apellido}
                        </p>
                        <p className="text-xs text-green-700">
                          {citasService.formatearFechaHora(cita.fechaHora)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {cita.tipoConsulta?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${citasService.getEstadoColor(cita.estado)}`}>
                        {citasService.getEstadoTexto(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citas recientes */}
          {recentCitas.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Citas Recientes</h4>
              <div className="space-y-2">
                {recentCitas.map((cita) => (
                  <div key={cita.id} className="border border-gray-200 bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {cita.doctor?.nombre} {cita.doctor?.apellido}
                        </p>
                        <p className="text-xs text-gray-600">
                          {citasService.formatearFechaHora(cita.fechaHora)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cita.tipoConsulta?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${citasService.getEstadoColor(cita.estado)}`}>
                        {citasService.getEstadoTexto(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas rápidas */}
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-blue-600">
                  {upcomingCitas.length}
                </p>
                <p className="text-xs text-gray-600">Próximas</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">
                  {state.citas.filter(c => c.estado === 'completada').length}
                </p>
                <p className="text-xs text-gray-600">Completadas</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">
                  {state.citas.length}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsWidget;
