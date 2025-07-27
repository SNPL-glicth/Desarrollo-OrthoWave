import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentModal from '../appointment/AppointmentModal';
import UserInfoOffcanvas from '../patient/UserInfoOffcanvas';
import PatientAppointmentScheduler from '../patient/PatientAppointmentScheduler';
import MyAppointmentsWidget from '../patient/MyAppointmentsWidget';
import PatientAppointmentManager from '../patient/PatientAppointmentManager';

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
  // Propiedades opcionales adicionales
  rating?: number;
  experienciaAnios?: number;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para citas
interface Cita {
  id: number;
  fecha: string;
  hora: string;
  doctor: string;
  estado: 'Confirmada' | 'Completada' | 'Cancelada' | 'Pendiente';
  consultorio?: string;
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
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [selectedDoctorForOffcanvas, setSelectedDoctorForOffcanvas] = useState<Doctor | null>(null);
  const [showQuickScheduler, setShowQuickScheduler] = useState(false);
  
  // Datos de ejemplo para citas
  const [proximaCita] = useState<Cita>({
    id: 1,
    fecha: '28 de junio de 2025',
    hora: '10:00 AM',
    doctor: 'Dr. García',
    estado: 'Confirmada',
    consultorio: 'Consultorio'
  });
  
  const [historialCitas] = useState<Cita[]>([
    {
      id: 2,
      fecha: '14 de junio de 2025',
      hora: '',
      doctor: 'Dr. García',
      estado: 'Completada'
    },
    {
      id: 3,
      fecha: '30 de mayo de 2025',
      hora: '',
      doctor: 'Dr. García',
      estado: 'Cancelada'
    }
  ]);

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

        // Si hay doctores disponibles, mostrar todos
        let doctoresToShow: Doctor[] = [];
        
        if (response.data && response.data.length > 0) {
          // Usar todos los doctores disponibles
          doctoresToShow = response.data;
        } else {
          // Si no hay doctores, crear uno de prueba
          doctoresToShow = [{
            id: 1,
            usuarioId: 1,
            usuario: {
              nombre: 'Juan Carlos',
              apellido: 'Pérez',
              email: 'doctor@ortowhave.com',
              telefono: '+57 300 123 4567'
            },
            especialidad: 'Ortopedia y Traumatología',
            subespecialidades: ['Cirugía de rodilla', 'Medicina deportiva'],
            numeroRegistroMedico: 'RM-12345',
            universidadEgreso: 'Universidad Nacional de Colombia',
            añoGraduacion: 2010,
            biografia: 'Especialista en ortopedia con más de 10 años de experiencia en cirugía de rodilla y medicina deportiva.',
            aceptaNuevosPacientes: true,
            tarifaConsulta: 150000,
            duracionConsultaDefault: 60,
            telefonoConsultorio: '+57 1 234 5678',
            direccionConsultorio: 'Calle 123 #45-67, Bogotá',
            ciudad: 'Bogotá',
            diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            horaInicio: '08:00',
            horaFin: '17:00',
            verificadoColegio: true,
            rating: 4.8,
            experienciaAnios: 13,
            profileImage: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
        }
        
        setDoctores(doctoresToShow);
        
        console.log('Doctores a mostrar:', doctoresToShow);
        console.log('Todos los doctores disponibles:', response.data);
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
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Agendar Cita</h1>
              <div className="ml-8 flex items-center space-x-6">
                <button
                  onClick={() => setShowQuickScheduler(!showQuickScheduler)}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendario
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/patient')}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                ← Volver al Dashboard
              </button>
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
              <h1 className="text-3xl font-bold text-gray-800">Agendar Nueva Cita</h1>
              <p className="text-lg text-gray-600">Hola, {user?.nombre}. Selecciona un especialista para agendar tu cita.</p>
            </div>
            <div className="flex items-center space-x-4">
              {doctores.length > 0 && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Especialistas disponibles</p>
                  <p className="text-2xl font-bold">{doctores.length}</p>
                </div>
              )}
            </div>
          </div>
      
      {/* Sección de agendamiento rápido */}
      {showQuickScheduler && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Agendar Cita - Vista Calendario</h3>
              <button
                onClick={() => setShowQuickScheduler(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PatientAppointmentScheduler
              onSuccess={() => {
                setSuccessMessage('¡Cita agendada exitosamente!');
                setShowQuickScheduler(false);
                setTimeout(() => {
                  setSuccessMessage(null);
                }, 5000);
              }}
              onCancel={() => setShowQuickScheduler(false)}
            />
          </div>
        </div>
      )}
      
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
        <div className="space-y-6">
          {/* Sección de gestión de citas */}
          <PatientAppointmentManager onUpdate={() => {
            console.log('Citas actualizadas');
          }} />
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Widget de Mis Citas - Columna lateral */}
            <div className="xl:col-span-1">
              <MyAppointmentsWidget />
            </div>
            
            {/* Grid de doctores - Columnas principales */}
            <div className="xl:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {doctores.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👩‍⚕️</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Dr. {doctor.usuario?.nombre} {doctor.usuario?.apellido}
                      </h3>
                      <p className="text-gray-600">{doctor.especialidad}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {doctor.usuario?.email}
                    </p>
                    {doctor.usuario?.telefono && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Teléfono:</span> {doctor.usuario.telefono}
                      </p>
                    )}
                    {doctor.numeroRegistroMedico && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Registro Médico:</span> {doctor.numeroRegistroMedico}
                      </p>
                    )}
                    {doctor.universidadEgreso && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Universidad:</span> {doctor.universidadEgreso}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDoctorForOffcanvas(doctor);
                        setOffcanvasOpen(true);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      Ver Información
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setModalOpen(true);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Agendar Cita
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
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

      {/* Offcanvas para ver información del doctor */}
      {selectedDoctorForOffcanvas && (
        <UserInfoOffcanvas
          show={offcanvasOpen}
          onHide={() => {
            setOffcanvasOpen(false);
            setSelectedDoctorForOffcanvas(null);
          }}
          user={{
            id: selectedDoctorForOffcanvas.id.toString(),
            firstName: selectedDoctorForOffcanvas.usuario?.nombre || '',
            lastName: selectedDoctorForOffcanvas.usuario?.apellido || '',
            email: selectedDoctorForOffcanvas.usuario?.email || '',
            phone: selectedDoctorForOffcanvas.usuario?.telefono || '',
            role: 'doctor',
            specialization: selectedDoctorForOffcanvas.especialidad,
            rating: selectedDoctorForOffcanvas.rating || 0,
            experience: selectedDoctorForOffcanvas.experienciaAnios?.toString() || 'No especificado',
            profileImage: selectedDoctorForOffcanvas.profileImage || '',
            createdAt: selectedDoctorForOffcanvas.createdAt || new Date().toISOString(),
            updatedAt: selectedDoctorForOffcanvas.updatedAt || new Date().toISOString()
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
