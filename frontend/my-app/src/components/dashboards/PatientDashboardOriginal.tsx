import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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
  rating?: number;
  experienciaAnios?: number;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

const SpecialistsView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Función para refrescar la lista de doctores
  const refreshDoctores = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/perfil-medico/doctores-disponibles');
      if (response.data && response.data.length > 0) {
        setDoctores(response.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error al refrescar doctores:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  // Filtrar doctores basado en búsqueda y especialidad
  const filteredDoctores = doctores.filter(doctor => {
    const matchesSearch = searchTerm === '' || 
      doctor.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === '' || doctor.especialidad === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty && doctor.aceptaNuevosPacientes;
  });

  // Obtener especialidades únicas
  const especialidadesUnicas = Array.from(new Set(doctores.map(doctor => doctor.especialidad)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando especialistas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.768 0L3.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar especialistas</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img className="h-8 w-auto" src="/images/White logo - no background_page-0001.webp" alt="OrtoWhave" />
              <h1 className="text-xl font-semibold text-gray-900">Especialistas Disponibles</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/patient')}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al Dashboard
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.nombre} {user?.apellido}</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900">Agendar Nueva Cita</h2>
              <p className="text-lg text-gray-600 mt-1">Selecciona un especialista para agendar tu cita</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshDoctores}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
              
              {doctores.length > 0 && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Especialistas</p>
                  <p className="text-2xl font-bold">{filteredDoctores.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar especialista
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, apellido o especialidad..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por especialidad
              </label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las especialidades</option>
                {especialidadesUnicas.map((especialidad) => (
                  <option key={especialidad} value={especialidad}>
                    {especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Specialists Grid */}
        {filteredDoctores.length === 0 ? (
          <div className="text-center py-16">
            {doctores.length === 0 ? (
              <div className="max-w-md mx-auto">
                <div className="bg-blue-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No hay especialistas disponibles</h3>
                <p className="text-gray-600 mb-6">Los especialistas aparecerán aquí cuando sean agregados por el administrador del sistema.</p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Contacta al administrador para que agregue especialistas al sistema.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No se encontraron especialistas</h3>
                <p className="text-gray-600 mb-6">Intenta ajustar tus filtros de búsqueda para encontrar especialistas.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctores.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Doctor Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {doctor.usuario?.nombre?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        Dr. {doctor.usuario?.nombre} {doctor.usuario?.apellido}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">{doctor.especialidad}</p>
                      <div className="flex items-center mt-1">
                        {doctor.verificadoColegio && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verificado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="space-y-3 mb-6">
                    {doctor.rating && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(doctor.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({doctor.rating})</span>
                      </div>
                    )}
                    
                    {doctor.experienciaAnios && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {doctor.experienciaAnios} años de experiencia
                      </div>
                    )}
                    
                    {doctor.tarifaConsulta && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        ${doctor.tarifaConsulta.toLocaleString()} por consulta
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {doctor.ciudad}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Agendar Cita
                    </button>
                    <button
                      onClick={() => {
                        // Mostrar información detallada del doctor
                        alert(`Información de Dr. ${doctor.usuario.nombre} ${doctor.usuario.apellido}\n\nEspecialidad: ${doctor.especialidad}\nEmail: ${doctor.usuario.email}\nTeléfono: ${doctor.usuario.telefono || 'No disponible'}`);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Ver Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SpecialistsView;
