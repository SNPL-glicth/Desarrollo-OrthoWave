import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { citasService } from '../../services/citasService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DoctorAppointmentsDebug: React.FC = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchCitas = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No hay usuario');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Obteniendo citas para doctor:', user.id);
      const citasData = await citasService.obtenerCitasPorDoctor(Number(user.id));
      console.log('📊 Citas obtenidas:', citasData);
      setCitas(citasData);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al obtener citas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.rol === 'doctor') {
      fetchCitas();
    }
  }, [user?.rol, fetchCitas]);

  // Filtrar citas por fecha seleccionada
  const citasDelDia = citas.filter(cita => {
    const citaDate = new Date(cita.fechaHora).toISOString().split('T')[0];
    return citaDate === selectedDate;
  });

  console.log('🔍 Debug Info:', {
    user: user,
    totalCitas: citas.length,
    citasDelDia: citasDelDia.length,
    selectedDate,
    loading,
    error
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Mis Citas (Debug)</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={fetchCitas}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Recargar'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <p><strong>Usuario:</strong> {user?.nombre} {user?.apellido} (ID: {user?.id})</p>
        <p><strong>Rol:</strong> {user?.rol}</p>
        <p><strong>Total citas:</strong> {citas.length}</p>
        <p><strong>Citas del día:</strong> {citasDelDia.length}</p>
        <p><strong>Fecha seleccionada:</strong> {selectedDate}</p>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando citas...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {citasDelDia.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  No tienes citas para {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })}
                </h3>
                <p className="text-blue-700">
                  Selecciona otra fecha para ver las citas programadas
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {citasDelDia.map((cita) => (
                <div
                  key={cita.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {cita.paciente?.nombre} {cita.paciente?.apellido}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {format(new Date(cita.fechaHora), "HH:mm", { locale: es })} - 
                        {format(new Date(new Date(cita.fechaHora).getTime() + cita.duracion * 60000), "HH:mm", { locale: es })}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tipo: {cita.tipoConsulta || 'Consulta general'}
                      </p>
                      {cita.motivoConsulta && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Motivo:</strong> {cita.motivoConsulta}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total de citas: {citas.length}</span>
          <span>Citas del día: {citasDelDia.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentsDebug;
