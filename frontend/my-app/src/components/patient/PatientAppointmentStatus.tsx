import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppointmentConfirmationModal from './AppointmentConfirmationModal';
import NotificationBell from '../notifications/NotificationBell';
import ProductReservationStatus from './ProductReservationStatus';

// Component para el User Account Modal (sin botón "mis pacientes")
interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut: () => void;
  onNavigateToHome?: () => void;
}

const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onNavigateToHome
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-16 right-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Current user section */}
        <div className="p-6 text-center">
          {/* User avatar */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* User info */}
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            ¡Hola, {currentUser.name}!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {currentUser.email}
          </p>
          
          {/* Navigate to home button */}
          {onNavigateToHome && (
            <button
              onClick={onNavigateToHome}
              className="w-full mb-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Ver Productos para Reservar
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-4">
              <button className="hover:text-gray-700 transition-colors">
                Política de Privacidad
              </button>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">
                Términos del Servicio
              </button>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={onSignOut}
            className="w-full mt-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

interface AppointmentWithStatus {
  id: number;
  fechaHora: string;
  tipoConsulta: string;
  estado: 'pendiente' | 'aprobada' | 'confirmada' | 'cancelada' | 'completada';
  motivoConsulta: string;
  notas?: string;
  doctor: {
    id: number;
    nombre: string;
    apellido: string;
    especialidad?: string;
    perfilMedico?: {
      especialidad?: string;
    };
  };
}

const PatientAppointmentStatus: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<any>(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/citas/paciente/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las citas');
      }

      const data = await response.json();
      
      // Filtrar solo citas que están en estado 'pendiente' (pendiente de aprobación) o 'aprobada' (pendiente de confirmación)
      const pendingAppointments = data.filter((apt: AppointmentWithStatus) => 
        apt.estado === 'pendiente' || apt.estado === 'aprobada'
      );
      
      setAppointments(pendingAppointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar citas pendientes y aprobadas
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleConfirmAppointment = async (appointmentId: number) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    const appointmentData = {
      startTime: appointment.fechaHora,
      specialist: {
        name: `${appointment.doctor.nombre} ${appointment.doctor.apellido}`,
        specialty: appointment.doctor.perfilMedico?.especialidad || appointment.doctor.especialidad || 'Especialista'
      }
    };

    // Establecer los datos y abrir el modal directamente
    setAppointmentToConfirm({ 
      citaId: appointmentId, 
      ...appointmentData 
    });
    setIsModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (!appointmentToConfirm) return;

    try {
      setConfirmationLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/citas/${appointmentToConfirm.citaId}/estado`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'confirmada' }),
      });

      if (!response.ok) {
        throw new Error('Error al confirmar la cita');
      }

      // Recargar las citas para reflejar el cambio
      await loadAppointments();
      
      setIsModalOpen(false);
      setAppointmentToConfirm(null);
      
    } catch (error) {
      console.error('Error confirmando cita:', error);
      setError('Error al confirmar la cita');
    } finally {
      setConfirmationLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setAppointmentToConfirm(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const getStatusInfo = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return {
          label: 'Pendiente de aprobación',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳',
          description: 'Tu solicitud está siendo revisada por el doctor'
        };
      case 'aprobada':
        return {
          label: 'Pendiente de confirmación',
          color: 'bg-orange-100 text-orange-800',
          icon: '⏰',
          description: 'El doctor ha aprobado tu cita. Confirma tu asistencia'
        };
      default:
        return {
          label: 'Estado desconocido',
          color: 'bg-gray-100 text-gray-800',
          icon: '❓',
          description: ''
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img className="h-6 sm:h-8" src="/images/White logo - no background_page-0001.webp" alt="OrthoWave" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">Estados de Citas</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard/patient')}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Volver al Dashboard</span>
                <span className="sm:hidden">Volver</span>
              </button>
              
              {/* Campana de notificaciones */}
              <NotificationBell />
              
              {/* Botón de perfil */}
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Cargando estados de citas...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img className="h-6 sm:h-8" src="/images/White logo - no background_page-0001.webp" alt="OrthoWave" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">Estados de Citas</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard/patient')}
              className="flex items-center px-3 py-2 text-sm font-medium text-primary hover:text-primary-dark bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Volver al Dashboard</span>
              <span className="sm:hidden">Volver</span>
            </button>
            
            {/* Campana de notificaciones */}
            <NotificationBell />
            
            {/* Botón de perfil */}
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium hover:bg-primary-dark transition-colors text-sm sm:text-base"
              >
                {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments List */}
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas pendientes</h3>
                <p className="text-gray-500 mb-4">
                  Todas tus citas están confirmadas o no tienes solicitudes pendientes.
                </p>
                <button
                  onClick={() => navigate('/dashboard/patient/agendar')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                  Agendar nueva cita
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Aquí puedes ver el estado de tus citas y realizar las acciones necesarias.
                </p>
                
                {appointments.map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.estado);
                  
                  return (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Fecha y hora */}
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-2xl">{statusInfo.icon}</div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {format(new Date(appointment.fechaHora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(appointment.fechaHora), "HH:mm", { locale: es })} hrs
                              </p>
                            </div>
                          </div>

                          {/* Doctor y tipo de consulta */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900">
                              Dr. {appointment.doctor.nombre} {appointment.doctor.apellido}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.doctor.perfilMedico?.especialidad || appointment.doctor.especialidad || 'Especialista'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.tipoConsulta} • {appointment.motivoConsulta}
                            </p>
                          </div>

                          {/* Estado */}
                          <div className="flex items-center space-x-3 mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <p className="text-sm text-gray-600">{statusInfo.description}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-6">
                          {appointment.estado === 'aprobada' && (
                            <button
                              onClick={() => handleConfirmAppointment(appointment.id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              Confirmar asistencia
                            </button>
                          )}
                          
                          {appointment.estado === 'pendiente' && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-2">Esperando respuesta del doctor</p>
                              <button
                                onClick={() => {/* TODO: Implementar cancelación */}}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Cancelar solicitud
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notas adicionales */}
                      {appointment.notas && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notas:</span> {appointment.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Sección de Productos Reservados */}
        <div className="mt-6">
          <ProductReservationStatus />
        </div>
      </div>

      {/* Modal de confirmación */}
      <AppointmentConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        appointmentData={appointmentToConfirm}
        loading={confirmationLoading}
      />
      
      {/* User Account Modal */}
      <UserAccountModal
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        currentUser={{
          name: user?.nombre || user?.email || 'Usuario',
          email: user?.email || '',
          avatar: undefined,
        }}
        onSignOut={handleLogout}
        onNavigateToHome={() => {
          setIsUserMenuOpen(false);
          navigate('/');
        }}
      />
    </div>
  );
};

export default PatientAppointmentStatus;
