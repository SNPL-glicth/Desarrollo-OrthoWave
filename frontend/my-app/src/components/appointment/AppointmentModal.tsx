import React, { useState, useEffect, useCallback } from 'react';
import { citasService, CrearCitaDto } from '../../services/citasService';
import { useAuth } from '../../context/AuthContext';

interface Doctor {
  id: number;
  usuario: {
    nombre: string;
    apellido: string;
  };
  especialidad: string;
  tarifaConsulta: number;
  duracionConsultaDefault: number;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  onSuccess?: (cita: any) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSuccess
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    tipoConsulta: 'primera_vez' as const,
    motivoConsulta: '',
    notasPaciente: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const buscarHorariosDisponibles = useCallback(async () => {
    try {
      setLoadingHorarios(true);
      const horarios = await citasService.buscarDisponibilidad({
        doctorId: doctor.id,
        fecha: formData.fecha,
        duracion: doctor.duracionConsultaDefault || 60
      });
      setHorariosDisponibles(horarios);
    } catch (err: any) {
      console.error('Error al buscar horarios:', err);
      setHorariosDisponibles([]);
    } finally {
      setLoadingHorarios(false);
    }
  }, [doctor.id, formData.fecha, doctor.duracionConsultaDefault]);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fecha: '',
        hora: '',
        tipoConsulta: 'primera_vez',
        motivoConsulta: '',
        notasPaciente: ''
      });
      setError(null);
      setHorariosDisponibles([]);
    }
  }, [isOpen]);

  // Buscar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    if (formData.fecha && doctor.id) {
      buscarHorariosDisponibles();
    }
  }, [formData.fecha, doctor.id, buscarHorariosDisponibles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setError('Usuario no autenticado');
      return;
    }

    if (!formData.fecha || !formData.hora) {
      setError('Fecha y hora son requeridas');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combinar fecha y hora
      const fechaHora = `${formData.fecha}T${formData.hora}:00`;

      const citaData: CrearCitaDto = {
        pacienteId: typeof user.id === 'string' ? parseInt(user.id) : user.id,
        doctorId: doctor.id,
        fechaHora,
        duracion: doctor.duracionConsultaDefault || 60,
        tipoConsulta: formData.tipoConsulta,
        motivoConsulta: formData.motivoConsulta || '',
        notasPaciente: formData.notasPaciente || undefined,
        costo: doctor.tarifaConsulta
      };

      const nuevaCita = await citasService.crearCita(citaData);
      
      // Mostrar feedback de éxito antes de cerrar
      const fechaFormateada = new Date(nuevaCita.fechaHora).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const horaFormateada = new Date(nuevaCita.fechaHora).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      if (onSuccess) {
        onSuccess({
          ...nuevaCita,
          successMessage: `Cita agendada exitosamente para el ${fechaFormateada} a las ${horaFormateada}`
        });
      }
      
      // Cerrar el modal después de un pequeño delay para mostrar el feedback
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err: any) {
      console.error('Error al crear cita:', err);
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const getFechaMinima = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Obtener fecha máxima (3 meses adelante)
  const getFechaMaxima = () => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 3);
    return fecha.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Agendar Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del doctor */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">
            Dr. {doctor.usuario.nombre} {doctor.usuario.apellido}
          </h3>
          <p className="text-sm text-blue-700">{doctor.especialidad}</p>
          <p className="text-sm text-blue-600">
            Costo: ${doctor.tarifaConsulta?.toLocaleString()} - Duración: {doctor.duracionConsultaDefault} min
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              min={getFechaMinima()}
              max={getFechaMaxima()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            {loadingHorarios ? (
              <div className="text-center py-2">
                <span className="text-sm text-gray-500">Buscando horarios disponibles...</span>
              </div>
            ) : horariosDisponibles.length > 0 ? (
              <select
                name="hora"
                value={formData.hora}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccione una hora</option>
                {horariosDisponibles.map((horario) => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
            ) : formData.fecha ? (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  No hay horarios disponibles para esta fecha
                </p>
              </div>
            ) : (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-500">
                  Seleccione una fecha para ver horarios disponibles
                </p>
              </div>
            )}
          </div>

          {/* Tipo de consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de consulta
            </label>
            <select
              name="tipoConsulta"
              value={formData.tipoConsulta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primera_vez">Primera vez</option>
              <option value="control">Control</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="urgencia">Urgencia</option>
            </select>
          </div>

          {/* Motivo de consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de consulta
            </label>
            <textarea
              name="motivoConsulta"
              value={formData.motivoConsulta}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describa brevemente el motivo de su consulta..."
            />
          </div>

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              name="notasPaciente"
              value={formData.notasPaciente}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Información adicional que considere importante..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.fecha || !formData.hora}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Agendando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
