import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlexibleScheduleManager from '../components/doctor/FlexibleScheduleManager';
import DoctorAvailabilityManager from '../components/doctor/DoctorAvailabilityManager';
import DoctorProfileEditor from '../components/doctor/DoctorProfileEditor';

// Interfaces y constantes para futuro uso
// interface DaySchedule {
//   day_of_week: string;
//   is_active: boolean;
//   start_time: string;
//   end_time: string;
//   break_start?: string;
//   break_end?: string;
// }

// const DAYS_OF_WEEK = [
//   { key: 'Monday', label: 'Lunes' },
//   { key: 'Tuesday', label: 'Martes' },
//   { key: 'Wednesday', label: 'Miércoles' },
//   { key: 'Thursday', label: 'Jueves' },
//   { key: 'Friday', label: 'Viernes' },
//   { key: 'Saturday', label: 'Sábado' },
//   { key: 'Sunday', label: 'Domingo' },
// ];

const DoctorSchedulePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLegacyMode, setShowLegacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'profile'>('schedule');

  // Verificar que el usuario sea un doctor
  useEffect(() => {
    if (!user || user.rol !== 'doctor') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">Cargando...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Título sin logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/doctor')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Gestión de Disponibilidad</h1>
            </div>
            
            {/* Botones de la derecha */}
            <div className="flex items-center space-x-4">
              {/* Información del doctor */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Dr. {user?.nombre} {user?.apellido}
                </span>
              </div>
              
              {/* Toggle para modo legacy */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Modo Simple</span>
                <button
                  onClick={() => setShowLegacyMode(!showLegacyMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showLegacyMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showLegacyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Botón volver al dashboard */}
              <button
                onClick={() => navigate('/dashboard/doctor')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                </svg>
                Dashboard
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

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gestionar Horarios
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Editar Perfil
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'schedule' ? (
          // Sección de Horarios
          showLegacyMode ? (
            <div className="p-4">
              <DoctorAvailabilityManager 
                doctorId={Number(user.id)}
                onSave={(availability) => {
                  console.log('Availability saved:', availability);
                }}
              />
            </div>
          ) : (
            <FlexibleScheduleManager 
              doctorId={Number(user.id)}
              onSave={(schedules) => {
                console.log('Flexible schedules saved:', schedules);
              }}
              onScheduleUpdate={() => {
                console.log('Schedule updated - calendar should refresh');
                // Aquí podríamos agregar lógica para actualizar el estado
                // o notificar a otros componentes que los horarios han cambiado
              }}
            />
          )
        ) : (
          // Sección de Editar Perfil
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <DoctorProfileEditor />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
