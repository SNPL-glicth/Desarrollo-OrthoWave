import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import citasService, { CrearCitaDto } from '../../services/citasService';
import { getPatientsByDoctor } from '../../services/patientService';
import api from '../../services/api';
import { getCurrentColombiaDate } from '../../utils/dateUtils';

interface AgendarCitaProps {
  doctorId?: number;
  pacienteId?: number;
  onCitaCreada?: () => void;
  onCerrar?: () => void;
}

interface Doctor {
  id: number;
  usuarioId: number;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  especialidad: string;
  duracionConsultaDefault: number;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

const AgendarCita: React.FC<AgendarCitaProps> = ({ 
  doctorId, 
  pacienteId, 
  onCitaCreada, 
  onCerrar 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CrearCitaDto>({
    pacienteId: pacienteId || 0,
    doctorId: doctorId || 0,
    fechaHora: '',
    duracion: 60,
    tipoConsulta: 'primera_vez',
    motivoConsulta: '',
    notasPaciente: '',
    costo: 0
  });

  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  useEffect(() => {
    cargarDoctores();
    if (user?.rol === 'doctor') {
      cargarPacientes();
    }
  }, [user]);

  useEffect(() => {
    if (formData.doctorId && formData.fechaHora) {
      const fecha = formData.fechaHora.split('T')[0];
      buscarDisponibilidad(formData.doctorId, fecha);
    }
  }, [formData.doctorId, formData.fechaHora]);

  const cargarDoctores = async () => {
    try {
      const response = await api.get('/perfil-medico/doctores-disponibles');
      setDoctores(response.data);
    } catch (err) {
      console.error('Error al cargar doctores:', err);
    }
  };

  const cargarPacientes = async () => {
    try {
      const data = await getPatientsByDoctor();
      setPacientes(data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    }
  };

  const buscarDisponibilidad = async (doctorId: number, fecha: string) => {
    try {
      setLoadingDisponibilidad(true);
      const horarios = await citasService.buscarDisponibilidad({
        doctorId,
        fecha,
        duracion: formData.duracion
      });
      setHorariosDisponibles(horarios);
    } catch (err) {
      console.error('Error al buscar disponibilidad:', err);
      setHorariosDisponibles([]);
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  const handleInputChange = (field: keyof CrearCitaDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDoctorChange = (doctorId: number) => {
    const doctor = doctores.find(d => d.usuarioId === doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId,
      duracion: doctor?.duracionConsultaDefault || 60
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pacienteId || !formData.doctorId || !formData.fechaHora) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await citasService.crearCita(formData);
      
      if (onCitaCreada) {
        onCitaCreada();
      }
      
      if (onCerrar) {
        onCerrar();
      }
      
      // Limpiar formulario
      setFormData({
        pacienteId: pacienteId || 0,
        doctorId: doctorId || 0,
        fechaHora: '',
        duracion: 60,
        tipoConsulta: 'primera_vez',
        motivoConsulta: '',
        notasPaciente: '',
        costo: 0
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const obtenerFechaMinima = () => {
    const hoy = getCurrentColombiaDate();
    return hoy.toISOString().split('T')[0];
  };

  const obtenerFechaMaxima = () => {
    const hoy = getCurrentColombiaDate();
    const fechaMaxima = new Date(hoy);
    fechaMaxima.setMonth(hoy.getMonth() + 3); // 3 meses adelante
    return fechaMaxima.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agendar Nueva Cita</h2>
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección de Doctor */}
          {!doctorId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => handleDoctorChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar doctor</option>
                {doctores.map((doctor) => (
                  <option key={doctor.id} value={doctor.usuarioId}>
                    Dr. {doctor.usuario.nombre} {doctor.usuario.apellido} - {doctor.especialidad}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selección de Paciente */}
          {!pacienteId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              {user?.rol === 'paciente' ? (
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {user.nombre} {user.apellido}
                </div>
              ) : (
                <select
                  value={formData.pacienteId}
                  onChange={(e) => handleInputChange('pacienteId', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre} {paciente.apellido}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.fechaHora.split('T')[0]}
              onChange={(e) => handleInputChange('fechaHora', e.target.value + 'T00:00')}
              min={obtenerFechaMinima()}
              max={obtenerFechaMaxima()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora *
            </label>
            {loadingDisponibilidad ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Buscando disponibilidad...</span>
              </div>
            ) : (
              <select
                value={formData.fechaHora.split('T')[1]?.substring(0, 5) || ''}
                onChange={(e) => {
                  const fecha = formData.fechaHora.split('T')[0];
                  handleInputChange('fechaHora', `${fecha}T${e.target.value}:00`);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar hora</option>
                {horariosDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos)
            </label>
            <select
              value={formData.duracion}
              onChange={(e) => handleInputChange('duracion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
              <option value={120}>120 minutos</option>
            </select>
          </div>

          {/* Tipo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta
            </label>
            <select
              value={formData.tipoConsulta}
              onChange={(e) => handleInputChange('tipoConsulta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="primera_vez">Primera vez</option>
              <option value="control">Control</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="urgencia">Urgencia</option>
            </select>
          </div>
        </div>

        {/* Motivo de Consulta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de Consulta
          </label>
          <textarea
            value={formData.motivoConsulta}
            onChange={(e) => handleInputChange('motivoConsulta', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe brevemente el motivo de la consulta..."
          />
        </div>

        {/* Notas del Paciente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={formData.notasPaciente}
            onChange={(e) => handleInputChange('notasPaciente', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Información adicional que consideres importante..."
          />
        </div>

        {/* Costo */}
        {user?.rol !== 'paciente' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo (COP)
            </label>
            <input
              type="number"
              value={formData.costo}
              onChange={(e) => handleInputChange('costo', parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || loadingDisponibilidad}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                Agendando...
              </>
            ) : (
              'Agendar Cita'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgendarCita;
