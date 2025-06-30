import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserOffcanvas from './UserOffcanvas';

interface Cita {
  fecha: string;
  hora: string;
  doctor: string;
  tipo: string;
  estado?: string;
}

interface Tratamiento {
  nombre: string;
  progreso: number;
  fechaInicio: string;
  duracionEstimada: string;
}

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  // Datos de ejemplo para la interfaz
  const proximasCitas: Cita[] = [
    { fecha: '2024-03-15', hora: '14:30', doctor: 'Dr. Juan Pérez', tipo: 'Control' },
    { fecha: '2024-03-28', hora: '10:00', doctor: 'Dra. María García', tipo: 'Revisión' }
  ];

  const historialCitas: Cita[] = [
    { fecha: '2024-02-20', hora: '15:00', doctor: 'Dr. Juan Pérez', tipo: 'Control', estado: 'Completada' },
    { fecha: '2024-01-15', hora: '11:30', doctor: 'Dra. María García', tipo: 'Inicial', estado: 'Completada' }
  ];

  const tratamientos: Tratamiento[] = [
    { nombre: 'Ortodoncia Invisible', progreso: 60, fechaInicio: '2023-12-01', duracionEstimada: '18 meses' },
    { nombre: 'Limpieza Dental', progreso: 100, fechaInicio: '2024-02-01', duracionEstimada: '1 día' }
  ];

  const misDocumentos = [
    {
      nombre: 'Radiografía Panorámica',
      fecha: '2024-03-01',
      tipo: 'imagen',
      estado: 'aprobado'
    },
    {
      nombre: 'Análisis de Sangre',
      fecha: '2024-02-15',
      tipo: 'pdf',
      estado: 'pendiente'
    },
    {
      nombre: 'Historial Médico Anterior',
      fecha: '2024-01-20',
      tipo: 'pdf',
      estado: 'aprobado'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/perfil/editar');
  };

  const handleScheduleAppointment = () => {
    navigate('/citas/agendar');
  };

  const handleViewTreatmentDetails = (treatmentId: string) => {
    navigate(`/tratamientos/${treatmentId}`);
  };

  const handleViewPaymentHistory = () => {
    navigate('/pagos/historial');
  };

  const handleUploadDocument = () => {
    navigate('/documentos/subir');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">Portal del Paciente</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('inicio')}
                  className={
                    activeTab === 'inicio'
                      ? 'border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  }
                >
                  Inicio
                </button>
                <button
                  onClick={() => setActiveTab('citas')}
                  className={
                    activeTab === 'citas'
                      ? 'border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  }
                >
                  Mis Citas
                </button>
                <button
                  onClick={() => setActiveTab('tratamientos')}
                  className={
                    activeTab === 'tratamientos'
                      ? 'border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  }
                >
                  Mis Tratamientos
                </button>
                <button
                  onClick={() => setActiveTab('historiales')}
                  className={
                    activeTab === 'historiales'
                      ? 'border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  }
                >
                  Mi Historia Clínica
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4 cursor-pointer" onClick={() => setShowOffcanvas(true)}>
                {user?.nombre} {user?.apellido}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Información personal del paciente */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Mi Información Personal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Nombre:</span> {user?.nombre}
              </div>
              <div>
                <span className="font-semibold">Apellido:</span> {user?.apellido}
              </div>
              <div>
                <span className="font-semibold">Correo:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold">Teléfono:</span> {user?.telefono || 'No registrado'}
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold">Dirección:</span> {user?.direccion || 'No registrada'}
              </div>
            </div>
          </div>

          {activeTab === 'inicio' && (
            <div>
              <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
                  Bienvenido, {user?.nombre}
          </h2>
                <button
                  onClick={handleEditProfile}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Perfil
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Próxima Cita */}
                <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Próxima Cita</h3>
                      {proximasCitas[0] && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmada
                        </span>
                      )}
                    </div>
                    {proximasCitas[0] ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                          <span>{proximasCitas[0].fecha}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{proximasCitas[0].hora}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{proximasCitas[0].doctor}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{proximasCitas[0].tipo}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay citas programadas</p>
                    )}
                    <button
                      onClick={handleScheduleAppointment}
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agendar Nueva Cita
                    </button>
                  </div>
                </div>

                {/* Tratamiento Actual */}
                <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tratamiento Actual</h3>
                    {tratamientos[0] && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{tratamientos[0].nombre}</h4>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progreso</span>
                              <span>{tratamientos[0].progreso}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${tratamientos[0].progreso}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Inicio: {tratamientos[0].fechaInicio}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Duración: {tratamientos[0].duracionEstimada}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewTreatmentDetails('1')}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver Detalles
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagos y Facturas */}
                <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagos y Facturas</h3>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Próximo pago: 15/03/2024
                            </p>
                            <p className="mt-1 text-sm text-yellow-700">
                              Monto: $150.000
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleViewPaymentHistory}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Ver Historial de Pagos
                      </button>
                </div>
              </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Mis Citas</h2>
                <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                  Agendar Nueva Cita
                </button>
            </div>

              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Citas</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {proximasCitas.map((cita, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.fecha}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.hora}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.doctor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.tipo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-primary hover:text-primary-dark mr-3">Modificar</button>
                              <button className="text-red-600 hover:text-red-900">Cancelar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                        </div>

                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Citas</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historialCitas.map((cita, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.fecha}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.hora}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.doctor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.tipo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {cita.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tratamientos' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Tratamientos</h2>
              <div className="grid grid-cols-1 gap-6">
                {tratamientos.map((tratamiento, index) => (
                  <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{tratamiento.nombre}</h3>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary text-white">
                          {tratamiento.progreso}% Completado
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${tratamiento.progreso}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p>Fecha de inicio: {tratamiento.fechaInicio}</p>
                          <p>Duración estimada: {tratamiento.duracionEstimada}</p>
                        </div>
                        <div className="text-right">
                          <button className="text-primary hover:text-primary-dark font-medium">
                    Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'historiales' && (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900">Mi Historia Clínica</h2>
                      <button
                        onClick={handleUploadDocument}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Subir Documento
                      </button>
            </div>

                    <div className="mb-8">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <div className="flex">
                  <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              Los documentos subidos serán revisados por su doctor. Asegúrese de que los archivos sean claros y legibles.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {misDocumentos.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {doc.tipo === 'imagen' ? (
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{doc.nombre}</h4>
                              <p className="text-sm text-gray-500">Subido el {doc.fecha}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              doc.estado === 'aprobado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.estado === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                            </span>
                            <button className="text-gray-400 hover:text-gray-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="text-gray-400 hover:text-gray-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos Requeridos</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          <li className="flex items-center text-sm text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Radiografía Panorámica (actualizada)
                          </li>
                          <li className="flex items-center text-sm text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Análisis de Sangre (últimos 6 meses)
                          </li>
                          <li className="flex items-center text-sm text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Historial Médico Anterior
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserOffcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} user={user} />
    </div>
  );
};

export default PatientDashboard;
