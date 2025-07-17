import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPatientsByDoctor } from '../../services/patientService.ts';
import PendingAppointments from '../appointment/PendingAppointments.tsx';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchPacientes = async () => {
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
    };

    if (user) {
      console.log('Usuario existe, fetching pacientes...');
      fetchPacientes();
    } else {
      console.log('No hay usuario, no se puede cargar pacientes');
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Cargando pacientes...</div>;
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
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Dashboard Doctor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dr. {user?.nombre} {user?.apellido}</span>
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Doctor</h1>
          <p className="mb-6 text-lg text-gray-600">Bienvenido, Dr. {user?.nombre} {user?.apellido}.</p>
          
          {/* Grid para citas pendientes y pacientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Citas Pendientes */}
            <div className="space-y-6">
              <PendingAppointments />
            </div>
            
            {/* Columna derecha - Mis Pacientes */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Pacientes</h2>
                
                {pacientes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">¡Bienvenido Dr. {user?.nombre}!</h3>
                      <p className="text-blue-700 mb-4">Aún no tienes pacientes asignados en tu agenda.</p>
                      <div className="text-sm text-blue-600 space-y-2">
                        <p>• Los pacientes aparecerán aquí cuando tengas citas programadas</p>
                        <p>• Una vez que los pacientes reserven citas contigo, aparecerán en esta lista</p>
                      </div>
                    </div>
                    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Información del Sistema</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Usuario:</strong> {user?.nombre} {user?.apellido}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Rol:</strong> {user?.rol}</p>
                        <p><strong>Estado:</strong> Sesión activa</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pacientes.map((paciente) => (
                      <div key={paciente.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">{paciente.nombre} {paciente.apellido}</p>
                            <p className="text-sm text-gray-600">{paciente.email}</p>
                          </div>
                          <p className="text-sm text-gray-700">Tel: {paciente.telefono || 'No disponible'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
