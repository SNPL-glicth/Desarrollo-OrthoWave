import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { citasService, Cita } from '../../services/citasService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientAppointmentManagerProps {
  onUpdate?: () => void;
}

const PatientAppointmentManager: React.FC<PatientAppointmentManagerProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchMyAppointments();
    }
  }, [user?.id]);

  const fetchMyAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const appointments = await citasService.obtenerMisCitas();
      // Ordenar por fecha, próximas primero
      const sortedAppointments = appointments.sort((a, b) => 
        new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      );
      setCitas(sortedAppointments);
    } catch (err: any) {
      console.error('Error al obtener citas:', err);
      setError('Error al cargar tus citas');
    } finally {
      setLoading(false);
    }
  };

  // Obtener color por estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_curso':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando tus citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Mis Citas</h3>
        <button
          onClick={fetchMyAppointments}
          disabled={loading}
          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {citas.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">No tienes citas programadas</p>
          <p className="text-sm text-gray-500 mt-1">Las citas que agendes aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {citas.map(cita => (
            <div key={cita.id} className={`border rounded-lg p-4 ${getEstadoColor(cita.estado)}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {format(new Date(cita.fechaHora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado).replace('border-', '')}`}>
                      {cita.estado}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p><strong>Hora:</strong> {format(new Date(cita.fechaHora), 'HH:mm')} ({cita.duracion} min)</p>
                      <p><strong>Doctor:</strong> {cita.doctor?.nombre} {cita.doctor?.apellido}</p>
                      <p><strong>Tipo:</strong> {cita.tipoConsulta || 'No especificado'}</p>
                      {cita.costo && (
                        <p><strong>Costo:</strong> ${cita.costo.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <p><strong>Motivo:</strong></p>
                      <p className="text-gray-700 mt-1">{cita.motivoConsulta}</p>
                      {cita.notasPaciente && (
                        <div className="mt-2">
                          <p><strong>Mis notas:</strong></p>
                          <p className="text-gray-700">{cita.notasPaciente}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {cita.notasDoctor && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Notas del Doctor:</p>
                      <p className="text-sm text-blue-700">{cita.notasDoctor}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Información de contacto del doctor para modificaciones */}
              {['pendiente', 'confirmada'].includes(cita.estado) && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <p><strong>Nota:</strong> Para modificar o cancelar esta cita, contacta directamente a tu doctor.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentManager;
