import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentModal from '../appointment/AppointmentModal.tsx';

// Interfaz para los datos del doctor
interface Doctor {
  id: number;
  usuarioId: number;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  especialidad: string;
  subespecialidades: string[];
  numeroRegistroMedico: string;
  universidadEgreso: string;
  añoGraduacion: number;
  biografia: string;
  aceptaNuevosPacientes: boolean;
  tarifaConsulta: number;
  duracionConsultaDefault: number;
  telefonoConsultorio: string;
  direccionConsultorio: string;
  ciudad: string;
  diasAtencion: string[];
  horaInicio: string;
  horaFin: string;
  verificadoColegio: boolean;
}

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchDoctores = async () => {
      try {
        setLoading(true);
        console.log('Patient Dashboard - Fetch doctores iniciado');
        console.log('Usuario actual:', user);
        console.log('Rol del usuario:', user?.rol);
        
        const response = await api.get('/perfil-medico/doctores-disponibles');
        console.log('Datos recibidos del backend:', response.data);
        
        setDoctores(response.data || []); // Asegurarse de que doctores sea siempre un array
        setError(null);
      } catch (err: any) {
        console.error('Error al cargar doctores:', err);
        console.error('Response data:', err.response?.data);
        console.error('Response status:', err.response?.status);
        
        setError(err.response?.data?.message || 'Error al cargar los doctores.');
      } finally {
        setLoading(false);
      }
    };

    console.log('Iniciando fetch de doctores...');
    fetchDoctores();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Cargando doctores...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img className="h-8 w-auto" src="/images/White logo - no background_page-0001.webp" alt="Logo" />
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Dashboard Paciente</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.nombre} {user?.apellido}</span>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Doctores Disponibles</h1>
              <p className="text-lg text-gray-600">Hola, {user?.nombre}. Aquí tienes una lista de nuestros especialistas.</p>
            </div>
            {doctores.length > 0 && (
              <div className="text-right">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Total de especialistas</p>
                  <p className="text-2xl font-bold">{doctores.length}</p>
                </div>
              </div>
            )}
          </div>
      
      {doctores.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
          <div className="max-w-md mx-auto">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">¡Hola {user?.nombre}!</h3>
              <p className="text-green-700 mb-4">Bienvenido a tu panel de paciente.</p>
              <div className="text-sm text-green-600 space-y-2">
                <p>• Los doctores disponibles aparecerán aquí cuando estén registrados en el sistema</p>
                <p>• Podrás ver sus especialidades y horarios de atención</p>
                <p>• Desde aquí podrás agendar citas con los especialistas</p>
              </div>
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Tu Información</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rol:</strong> {user?.rol}</p>
                <p><strong>Estado:</strong> Sesión activa</p>
              </div>
            </div>
            <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Si crees que debería haber doctores disponibles, 
                contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctores.map((doctor) => (
            <div key={doctor.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Header del doctor */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Dr. {doctor.usuario?.nombre} {doctor.usuario?.apellido}</h2>
                    <p className="text-blue-100 text-sm">{doctor.especialidad}</p>
                  </div>
                  {doctor.verificadoColegio && (
                    <div className="bg-green-500 p-2 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido del doctor */}
              <div className="p-6">
                {/* Subespecialidades */}
                {doctor.subespecialidades && doctor.subespecialidades.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Subespecialidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.subespecialidades.map((sub, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biografía */}
                {doctor.biografia && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{doctor.biografia}</p>
                  </div>
                )}

                {/* Información de contacto */}
                <div className="space-y-2 mb-4">
                  {doctor.direccionConsultorio && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {doctor.direccionConsultorio}
                    </div>
                  )}
                  
                  {doctor.telefonoConsultorio && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {doctor.telefonoConsultorio}
                    </div>
                  )}
                </div>

                {/* Horarios */}
                {doctor.horaInicio && doctor.horaFin && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Horarios de atención:</p>
                    <p className="text-sm text-gray-600">
                      {doctor.horaInicio} - {doctor.horaFin}
                    </p>
                    {doctor.diasAtencion && doctor.diasAtencion.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {doctor.diasAtencion.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1)).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {doctor.tarifaConsulta && (
                    <div>
                      <p className="font-medium text-gray-700">Tarifa:</p>
                      <p className="text-green-600 font-semibold">
                        ${doctor.tarifaConsulta?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {doctor.duracionConsultaDefault && (
                    <div>
                      <p className="font-medium text-gray-700">Duración:</p>
                      <p className="text-gray-600">{doctor.duracionConsultaDefault} min</p>
                    </div>
                  )}
                </div>

                {/* Universidad y año */}
                {(doctor.universidadEgreso || doctor.añoGraduacion) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    {doctor.universidadEgreso && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Universidad:</span> {doctor.universidadEgreso}
                      </p>
                    )}
                    {doctor.añoGraduacion && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Graduación:</span> {doctor.añoGraduacion}
                      </p>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setModalOpen(true);
                    }}
                    disabled={!doctor.aceptaNuevosPacientes}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agendar Cita
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm">
                    Ver Perfil
                  </button>
                </div>

                {/* Estado de disponibilidad */}
                <div className="mt-3 flex items-center justify-center">
                  {doctor.aceptaNuevosPacientes ? (
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Acepta nuevos pacientes
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      No acepta nuevos pacientes
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>

      {/* Modal para agendar cita */}
      {selectedDoctor && (
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
          onSuccess={(cita) => {
            setSuccessMessage(`Cita agendada exitosamente para el ${new Date(cita.fechaHora).toLocaleDateString()}`);
            setModalOpen(false);
            setSelectedDoctor(null);
            
            // Ocultar mensaje de éxito después de 5 segundos
            setTimeout(() => {
              setSuccessMessage(null);
            }, 5000);
          }}
        />
      )}

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
