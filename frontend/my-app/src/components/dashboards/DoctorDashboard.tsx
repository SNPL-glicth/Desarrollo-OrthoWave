import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserOffcanvas from './UserOffcanvas';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewPatientDetails = (patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  };

  const handleViewAppointments = () => {
    navigate('/citas');
  };

  const handleViewMedicalRecords = () => {
    navigate('/historias-clinicas');
  };

  // Mock data
  const estadisticas = {
    citasHoy: 8,
    citasPendientes: 25,
    pacientesActivos: 45,
    tratamientosActivos: 30
  };

  const citasProximas = [
    { paciente: 'Ana Martínez', hora: '10:00 AM', tipo: 'Control', estado: 'Confirmada' },
    { paciente: 'Pedro Sánchez', hora: '11:30 AM', tipo: 'Primera Vez', estado: 'Pendiente' },
    { paciente: 'Laura Gómez', hora: '2:00 PM', tipo: 'Revisión', estado: 'Confirmada' }
  ];

  const pacientesRecientes = [
    { nombre: 'Ana Martínez', edad: 28, ultimaCita: '2024-03-10', proximaCita: '2024-03-24' },
    { nombre: 'Pedro Sánchez', edad: 35, ultimaCita: '2024-03-12', proximaCita: '2024-03-26' },
    { nombre: 'Laura Gómez', edad: 42, ultimaCita: '2024-03-14', proximaCita: '2024-03-28' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowOffcanvas(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel Médico</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleViewAppointments}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ver Agenda
              </button>
              <button
                onClick={handleViewMedicalRecords}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Historias Clínicas
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Citas Hoy</dt>
                      <dd className="text-lg font-semibold text-gray-900">{estadisticas.citasHoy}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                        </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Citas Pendientes</dt>
                      <dd className="text-lg font-semibold text-gray-900">{estadisticas.citasPendientes}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pacientes Activos</dt>
                      <dd className="text-lg font-semibold text-gray-900">{estadisticas.pacientesActivos}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tratamientos Activos</dt>
                      <dd className="text-lg font-semibold text-gray-900">{estadisticas.tratamientosActivos}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Próximas Citas */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
                  <button
                    onClick={handleViewAppointments}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="space-y-4">
                  {citasProximas.map((cita, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                            {cita.paciente.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cita.paciente}</p>
                          <p className="text-sm text-gray-500">{cita.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{cita.hora}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cita.estado === 'Confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pacientes Recientes */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pacientes Recientes</h2>
                  <button
                    onClick={handleViewMedicalRecords}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="space-y-4">
                  {pacientesRecientes.map((paciente, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center">
                            {paciente.nombre.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{paciente.nombre}</p>
                          <p className="text-sm text-gray-500">{paciente.edad} años</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Última cita: {paciente.ultimaCita}</p>
                        <p className="text-sm font-medium text-primary">Próxima: {paciente.proximaCita}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserOffcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} user={user} />
    </div>
  );
};

export default DoctorDashboard;
