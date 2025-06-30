import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      // Caso especial para el usuario de ejemplo paciente@ejemplo.com
      if (user.email === 'paciente@ejemplo.com') {
        // Crear datos de ejemplo para el paciente
        setUserInfo({
          id: 999,
          firstName: 'Paciente',
          lastName: 'Ejemplo',
          email: 'paciente@ejemplo.com',
          documentType: 'CC',
          documentId: '1234567890',
          phone: '3001234567',
          address: 'Calle 123 #45-67',
          birthDate: '1990-01-01'
        });
        
        // Crear citas de ejemplo
        setAppointments([
          {
            id: 1,
            serviceType: 'Consulta Inicial',
            appointmentDateTime: new Date(Date.now() + 86400000).toISOString(), // mañana
            status: 'Confirmada',
            notes: 'Primera consulta para evaluación',
            doctorName: 'Dr. Juan Pérez'
          },
          {
            id: 2,
            serviceType: 'Control de Brackets',
            appointmentDateTime: new Date(Date.now() + 604800000).toISOString(), // en una semana
            status: 'Pendiente',
            notes: 'Ajuste mensual de brackets',
            doctorName: 'Dra. María Rodríguez'
          }
        ]);
        
        setLoading(false);
        return;
      }
      
      try {
        // Obtener información del usuario
        const userResponse = await fetch(`http://localhost:8080/api/patients/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserInfo(userData);
          
          // Obtener citas del usuario
          const appointmentsResponse = await fetch(`http://localhost:8080/api/appointments/patient/${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            setAppointments(appointmentsData);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header con información del usuario y botón de cerrar sesión */}
          <div className="bg-primary/10 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{user?.firstName || 'Usuario'} {user?.lastName || ''}</h2>
                <p className="text-gray-600">{user?.email || 'usuario@ejemplo.com'}</p>
              </div>
            </div>
            <button
              onClick={() => logout(navigate)}
              className="flex items-center text-gray-700 hover:text-red-600"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              <span>Cerrar sesión</span>
            </button>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${
                  activeTab === 'appointments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Mis Citas
              </button>
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : activeTab === 'profile' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {userInfo ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{userInfo.firstName} {userInfo.lastName}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-400 mr-2">#</span>
                          <span>{userInfo.documentType}: {userInfo.documentId}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-400 mr-2">@</span>
                          <span>{userInfo.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-400 mr-2">📱</span>
                          <span>{userInfo.phone}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-400 mr-2">🏠</span>
                          <span>{userInfo.address || 'No registrada'}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{userInfo.birthDate ? new Date(userInfo.birthDate).toLocaleDateString('es-ES') : 'No registrada'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontró información del perfil.</p>
                    <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Completar mi perfil
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {appointments.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Próximas citas</h3>
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{appointment.serviceType}</h4>
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>{formatDate(appointment.appointmentDateTime)}</span>
                              </div>
                              {appointment.doctorName && (
                                <div className="flex items-center mt-2 text-sm text-gray-600">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  <span>{appointment.doctorName}</span>
                                </div>
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              appointment.status === 'Confirmada' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3 text-sm text-gray-600">
                              <p className="font-medium">Notas:</p>
                              <p>{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes citas programadas.</p>
                    <a href="#contacto" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Agendar una cita
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 