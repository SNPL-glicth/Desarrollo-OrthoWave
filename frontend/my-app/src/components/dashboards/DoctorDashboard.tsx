import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPatientsByDoctor } from '../../services/patientService';
import OffcanvasDoctor from '../doctor/OffcanvasDoctor';
import PatientDetailsModal from '../doctor/PatientDetailsModal';
import NotificationBell from '../NotificationBell';
import AppointmentRequestsOffcanvas from '../doctor/AppointmentRequestsOffcanvas';

// Interfaz simple para los datos del paciente
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

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showNotificationsOffcanvas, setShowNotificationsOffcanvas] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header moderno y responsivo */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo OrthoWave - lado izquierdo */}
            <div className="flex items-center space-x-3">
              <img className="h-8 w-auto" src="/images/orthowave-logo.svg" alt="OrthoWave" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">OrthoWave</h1>
                <p className="text-xs text-gray-500">Sistema de Ortopedia</p>
              </div>
            </div>

            {/* Botones de acción - lado derecho */}
            <div className="flex items-center space-x-2 md:space-x-3">
              
              {/* Campana de notificaciones */}
              <NotificationBell onClick={() => {
                setShowNotificationsOffcanvas(true);
              }} />
              
              {/* Botón de calendario - oculto en móvil */}
              <button
                onClick={() => navigate('/dashboard/doctor')}
                className="hidden md:inline-flex items-center px-3 py-2 bg-gray-600/80 hover:bg-gray-500 border border-gray-400/50 text-sm font-medium rounded-xl text-white hover:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/20 backdrop-blur-sm"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">Mi Calendario</span>
                <span className="lg:hidden">Calendario</span>
              </button>
              
              {/* Menú móvil */}
              <div className="flex md:hidden items-center space-x-2">
                <button
                  onClick={() => navigate('/dashboard/doctor')}
                  className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all duration-200"
                  title="Calendario"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-sm font-medium rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm hover:shadow-md"
              >
                <svg className="h-4 w-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal con diseño moderno */}
      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{pacientes.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 3a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Pacientes optimizado */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-5 border-b border-gray-200/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Mis Pacientes</h2>
                  <p className="text-sm text-gray-500">Lista de pacientes con citas programadas</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 bg-primary-50 px-3 py-1 rounded-full">
                    {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => fetchPacientes()}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-800 text-white text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Actualizar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

              {/* Tabla de pacientes */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando pacientes...</p>
                </div>
              ) : pacientes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-primary-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-primary-700 mb-2">¡Bienvenido Dr. {user?.nombre}!</h4>
                    <p className="text-primary-600 mb-4 text-sm">Aún no tienes pacientes asignados en tu agenda.</p>
                    <div className="text-xs text-primary-600 space-y-1">
                      <p>• Los pacientes aparecerán cuando tengas citas programadas</p>
                      <p>• Una vez que reserven citas contigo, aparecerán aquí</p>
                    </div>
                  </div>
                </div>
              ) : (
<div className="overflow-x-auto responsive-table">
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
                              <div className="bg-primary-100 p-2 rounded-full mr-3">
                                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
      </main>
      
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
      
      {/* Offcanvas de solicitudes de citas */}
      <AppointmentRequestsOffcanvas
        isOpen={showNotificationsOffcanvas}
        onClose={() => setShowNotificationsOffcanvas(false)}
        onNavigateToCalendar={(date) => {
          // Navegar al calendario con la fecha específica
          navigate('/dashboard/doctor', { state: { selectedDate: date } });
        }}
      />
    </div>
  );
};

export default DoctorDashboard;
