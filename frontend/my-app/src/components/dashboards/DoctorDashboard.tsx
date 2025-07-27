import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPatientsByDoctor } from '../../services/patientService';
import OffcanvasDoctor from '../doctor/OffcanvasDoctor';
import PatientDetailsModal from '../doctor/PatientDetailsModal';

// Interfaz simple para los datos del paciente
interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para cargar pacientes
  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Doctor Dashboard - Fetch pacientes iniciado');
      console.log('Usuario actual:', user);
      console.log('Rol del usuario:', user?.rol);
      
      const data = await getPatientsByDoctor();
      console.log('Datos recibidos del backend:', data);
      
      setPacientes(data || []); // Asegurarse de que pacientes sea siempre un array
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar pacientes:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      setError(err.response?.data?.message || 'Error al cargar la lista de pacientes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('Usuario existe, fetching pacientes...');
      fetchPacientes();
    } else {
      console.log('No hay usuario, no se puede cargar pacientes');
    }
  }, [user, fetchPacientes]);

  if (loading) {
    return <div className="p-8 text-center">Cargando pacientes...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar blanco superior */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <img src="/Whave.png" alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900">Mis Pacientes</h1>
            </div>
            
            {/* Botones de la derecha */}
            <div className="flex items-center space-x-4">
              {/* Información del doctor */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Dr. {user?.nombre} {user?.apellido}
                </span>
              </div>
              
              {/* Botón de perfil */}
              <button
                onClick={() => setShowOffcanvas(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </button>
              
              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Panel de Pacientes estilo AdminDashboard */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Mis Pacientes</h2>
                <button
                  onClick={() => fetchPacientes()}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  )}
                  Actualizar
                </button>
              </div>

              {/* Tabla de pacientes */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando pacientes...</p>
                </div>
              ) : pacientes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">¡Bienvenido Dr. {user?.nombre}!</h4>
                    <p className="text-blue-700 mb-4 text-sm">Aún no tienes pacientes asignados en tu agenda.</p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>• Los pacientes aparecerán cuando tengas citas programadas</p>
                      <p>• Una vez que reserven citas contigo, aparecerán aquí</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pacientes.slice(0, 10).map((paciente) => (
                        <tr key={paciente.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {paciente.nombre} {paciente.apellido}
                                </div>
                                <div className="text-sm text-gray-500">ID: #{paciente.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {paciente.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {paciente.telefono || 'No disponible'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedPaciente(paciente);
                                  setShowDetailsModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Más Detalles
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {pacientes.length > 10 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        Mostrando 10 de {pacientes.length} pacientes.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Offcanvas para mostrar información del doctor */}
      {user && (
        <OffcanvasDoctor 
          isOpen={showOffcanvas} 
          onClose={() => setShowOffcanvas(false)} 
          doctor={user as any}
        />
      )}
      
      {/* Modal de detalles del paciente */}
      {selectedPaciente && (
        <PatientDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPaciente(null);
          }}
          paciente={selectedPaciente}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
