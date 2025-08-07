import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { citasService } from '../../services/citasService';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento?: string;
  edad?: number;
  eps?: string;
  tipoAfiliacion?: string;
}

interface Cita {
  id: number;
  fechaHora: string;
  duracion: number;
  estado: string;
  tipoConsulta: string;
  motivoConsulta: string;
  notasDoctor?: string;
  costo?: number;
}

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Paciente;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  paciente
}) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appointments = await citasService.obtenerCitasPorPaciente(paciente.id);
      setCitas(appointments.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()));
    } catch (err: any) {
      console.error('Error al obtener citas del paciente:', err);
      setError('Error al cargar el historial de citas');
    } finally {
      setLoading(false);
    }
  }, [paciente.id]);

  useEffect(() => {
    if (isOpen && paciente.id) {
      fetchPatientAppointments();
    }
  }, [isOpen, paciente.id, fetchPatientAppointments]);

  // Obtener color por estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      case 'en_curso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener estadísticas del paciente
  const getPatientStats = () => {
    const total = citas.length;
    const completadas = citas.filter(c => c.estado === 'completada').length;
    const canceladas = citas.filter(c => c.estado === 'cancelada').length;
    const pendientes = citas.filter(c => ['pendiente', 'confirmada'].includes(c.estado)).length;
    
    return { total, completadas, canceladas, pendientes };
  };

  if (!isOpen) return null;

  const stats = getPatientStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <p className="text-sm text-gray-600">{paciente.email}</p>
              {paciente.telefono && (
                <p className="text-sm text-gray-600">{paciente.telefono}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Información personal del paciente */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Edad</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paciente.edad ? `${paciente.edad} años` : 'No especificada'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paciente.fechaNacimiento 
                    ? format(new Date(paciente.fechaNacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })
                    : 'No especificada'
                  }
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Tipo de Afiliación</p>
                <p className="text-lg font-semibold text-gray-900">
                  <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                    paciente.tipoAfiliacion === 'EPS' 
                      ? 'bg-blue-100 text-blue-800'
                      : paciente.tipoAfiliacion === 'Particular'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {paciente.tipoAfiliacion || 'No especificada'}
                  </span>
                </p>
              </div>
              {paciente.eps && (
                <div className="bg-white p-3 rounded-lg md:col-span-3">
                  <p className="text-sm font-medium text-gray-500">EPS</p>
                  <p className="text-lg font-semibold text-gray-900">{paciente.eps}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas del paciente */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Citas</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completadas}</p>
                </div>
                <div className="bg-green-100 p-2 rounded">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendientes}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Canceladas</p>
                  <p className="text-2xl font-bold text-red-900">{stats.canceladas}</p>
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de citas */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Historial de Citas</h3>
              <button
                onClick={fetchPatientAppointments}
                disabled={loading}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando historial...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : citas.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">Este paciente no tiene citas registradas</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {citas.map(cita => (
                  <div key={cita.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {format(new Date(cita.fechaHora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                            {cita.estado}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Hora:</strong> {format(new Date(cita.fechaHora), 'HH:mm')} ({cita.duracion} min)</p>
                            <p><strong>Tipo:</strong> {cita.tipoConsulta || 'No especificado'}</p>
                            {cita.costo && (
                              <p><strong>Costo:</strong> ${cita.costo.toLocaleString()}</p>
                            )}
                          </div>
                          <div>
                            <p><strong>Motivo:</strong></p>
                            <p className="text-gray-700 mt-1">{cita.motivoConsulta}</p>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
