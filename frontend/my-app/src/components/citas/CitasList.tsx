import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import citasService, { Cita } from '../../services/citasService';

interface CitasListProps {
  tipo?: 'paciente' | 'doctor' | 'todas';
  usuarioId?: number;
  onCitaClick?: (cita: Cita) => void;
}

const CitasList: React.FC<CitasListProps> = ({ tipo = 'todas', usuarioId, onCitaClick }) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    cargarCitas();
  }, [tipo, usuarioId]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let citasData: Cita[] = [];
      
      if (tipo === 'paciente' && usuarioId) {
        citasData = await citasService.obtenerCitasPorPaciente(usuarioId);
      } else if (tipo === 'doctor' && usuarioId) {
        citasData = await citasService.obtenerCitasPorDoctor(usuarioId);
      } else {
        citasData = await citasService.obtenerMisCitas();
      }
      
      setCitas(citasData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarEstado = async (citaId: number, nuevoEstado: string) => {
    try {
      await citasService.actualizarEstadoCita(citaId, { estado: nuevoEstado as any });
      await cargarCitas(); // Recargar las citas
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  const handleEliminarCita = async (citaId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await citasService.eliminarCita(citaId);
        await cargarCitas(); // Recargar las citas
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar la cita');
      }
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtroEstado === 'todos') return true;
    return cita.estado === filtroEstado;
  });

  const puedeActualizarEstado = (cita: Cita, nuevoEstado: string) => {
    if (!user) return false;
    
    // Lógica de permisos según el rol del usuario
    const esAdmin = user.rol === 'admin';
    const esDoctor = user.rol === 'doctor' && cita.doctorId === (typeof user.id === 'string' ? parseInt(user.id) : user.id);
    const esPaciente = user.rol === 'paciente' && cita.pacienteId === (typeof user.id === 'string' ? parseInt(user.id) : user.id);
    
    switch (nuevoEstado) {
      case 'aprobada':
      case 'cancelada':
        return esAdmin;
      case 'confirmada':
        return esPaciente || esAdmin;
      case 'en_curso':
      case 'completada':
      case 'no_asistio':
        return esDoctor || esAdmin;
      default:
        return false;
    }
  };

  const puedeEliminar = (cita: Cita) => {
    if (!user) return false;
    
    const esAdmin = user.rol === 'admin';
    const esPaciente = user.rol === 'paciente' && cita.pacienteId === (typeof user.id === 'string' ? parseInt(user.id) : user.id);
    
    return esAdmin || (esPaciente && cita.estado === 'pendiente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {tipo === 'paciente' ? 'Citas del Paciente' : 
             tipo === 'doctor' ? 'Citas del Doctor' : 'Mis Citas'}
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="aprobada">Aprobada</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
            <button
              onClick={cargarCitas}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {citasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 9l-3 3m0 0l-3-3m3 3V10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroEstado === 'todos' ? 'No se encontraron citas' : `No hay citas con estado "${filtroEstado}"`}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                {tipo !== 'paciente' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                )}
                {tipo !== 'doctor' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {citasFiltradas.map((cita) => (
                <tr key={cita.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {citasService.formatearFecha(cita.fechaHora)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {citasService.formatearHora(cita.fechaHora)}
                    </div>
                  </td>
                  
                  {tipo !== 'paciente' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cita.paciente?.nombre} {cita.paciente?.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{cita.paciente?.email}</div>
                    </td>
                  )}
                  
                  {tipo !== 'doctor' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Dr. {cita.doctor?.nombre} {cita.doctor?.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{cita.doctor?.email}</div>
                    </td>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${citasService.getEstadoColor(cita.estado)}`}>
                      {citasService.getEstadoTexto(cita.estado)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cita.tipoConsulta}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cita.duracion} min
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {onCitaClick && (
                        <button
                          onClick={() => onCitaClick(cita)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </button>
                      )}
                      
                      {/* Botones de estado según permisos */}
                      {cita.estado === 'pendiente' && puedeActualizarEstado(cita, 'aprobada') && (
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'aprobada')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                      )}
                      
                      {cita.estado === 'aprobada' && puedeActualizarEstado(cita, 'confirmada') && (
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'confirmada')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Confirmar
                        </button>
                      )}
                      
                      {cita.estado === 'confirmada' && puedeActualizarEstado(cita, 'en_curso') && (
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'en_curso')}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Iniciar
                        </button>
                      )}
                      
                      {cita.estado === 'en_curso' && puedeActualizarEstado(cita, 'completada') && (
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'completada')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Completar
                        </button>
                      )}
                      
                      {puedeActualizarEstado(cita, 'cancelada') && cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'cancelada')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancelar
                        </button>
                      )}
                      
                      {puedeEliminar(cita) && (
                        <button
                          onClick={() => handleEliminarCita(cita.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CitasList;
