import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DoctorAvailabilityCalendar from '../components/patient/DoctorAvailabilityCalendar';
import api from '../services/api';

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  telefono?: string;
  costo?: number;
  ubicacion?: string;
}

const SpecialistsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Lista de especialidades
  const specialties = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Neurología',
    'Pediatría',
    'Ginecología',
    'Traumatología',
    'Psiquiatría',
    'Oftalmología',
    'Otorrinolaringología'
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialty]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/perfil-medico/doctores-disponibles');
      const doctorsData = response.data || [];
      
      // Transformar los datos para que coincidan con la interfaz
      const formattedDoctors = doctorsData.map((doctor: any) => ({
        id: doctor.usuarioId || doctor.id,
        nombre: doctor.usuario?.nombre || doctor.nombre,
        apellido: doctor.usuario?.apellido || doctor.apellido,
        email: doctor.usuario?.email || doctor.email,
        especialidad: doctor.especialidad || 'Medicina General',
        telefono: doctor.usuario?.telefono || doctor.telefono,
        costo: 75000, // Valor por defecto
        ubicacion: 'Bogotá' // Valor por defecto
      }));

      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      // Datos de prueba en caso de error
      setDoctors([
        {
          id: 1,
          nombre: 'Doctor',
          apellido: 'Principal', 
          email: 'doctor@orthowave.com',
          especialidad: 'Medicina General',
          telefono: '+57 300 123 4567',
          costo: 75000,
          ubicacion: 'Bogotá'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        `${doctor.nombre} ${doctor.apellido} ${doctor.especialidad}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty && selectedSpecialty !== 'Todas las especialidades') {
      filtered = filtered.filter(doctor => 
        doctor.especialidad === selectedSpecialty
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleScheduleAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowCalendarModal(true);
  };

  const handleAppointmentRequested = (appointmentData: any) => {
    console.log('Cita creada exitosamente:', appointmentData);
    setShowCalendarModal(false);
    
    // Mostrar mensaje de éxito personalizado si hay un successMessage
    const message = appointmentData.successMessage || 
      '¡Cita solicitada exitosamente! El doctor recibirá tu solicitud y la revisará pronto. Recibirás una notificación cuando sea aprobada.';
    
    // Crear un modal de éxito más profesional
    const showSuccessModal = () => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]';
      modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-md mx-4 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">¡Cita Solicitada!</h3>
          </div>
          <p class="text-gray-600 mb-6">${message}</p>
          <div class="flex justify-end">
            <button 
              onclick="this.closest('.fixed').remove()" 
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        if (document.body.contains(modal)) {
          modal.remove();
        }
      }, 5000);
    };
    
    showSuccessModal();
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <img className="h-6 sm:h-8" src="/images/White logo - no background_page-0001.webp" alt="OrthoWave" />
            <h1 className="text-xl font-semibold text-gray-800">Especialistas Disponibles</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Volver al Dashboard
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Paciente Demo</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                P
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendar Nueva Cita</h2>
          <p className="text-gray-600">Selecciona un especialista para agendar tu cita</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por especialidad
              </label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contador de especialistas */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredDoctors.length} especialista{filteredDoctors.length !== 1 ? 's' : ''} encontrado{filteredDoctors.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={loadDoctors}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Lista de especialistas */}
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">👩‍⚕️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron especialistas</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
                      D
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctor.nombre} {doctor.apellido}
                      </h3>
                      <p className="text-blue-600 font-medium">{doctor.especialidad}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="inline-block w-4">✓</span>
                          <span className="ml-1">Verificado</span>
                        </div>
                        {doctor.costo && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="inline-block w-4">💰</span>
                            <span className="ml-1">${doctor.costo.toLocaleString()} por consulta</span>
                          </div>
                        )}
                        {doctor.ubicacion && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="inline-block w-4">📍</span>
                            <span className="ml-1">{doctor.ubicacion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        // Abrir modal de información del doctor
                        alert(`Información del Dr. ${doctor.nombre} ${doctor.apellido}\nEspecialidad: ${doctor.especialidad}\nEmail: ${doctor.email}`);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Ver Info
                    </button>
                    <button
                      onClick={() => handleScheduleAppointment(doctor)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      Agendar Cita
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de calendario del doctor */}
      {selectedDoctor && (
        <DoctorAvailabilityCalendar
          doctor={selectedDoctor}
          onRequestAppointment={handleAppointmentRequested}
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
  );
};

export default SpecialistsList;
