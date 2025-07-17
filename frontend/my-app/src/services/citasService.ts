import api from './api';

export interface Cita {
  id: number;
  pacienteId: number;
  doctorId: number;
  fechaHora: string;
  duracion: number;
  estado: 'pendiente' | 'confirmada' | 'aprobada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  tipoConsulta: 'primera_vez' | 'control' | 'seguimiento' | 'urgencia';
  motivoConsulta?: string;
  notasDoctor?: string;
  notasPaciente?: string;
  costo?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  aprobadaPor?: number;
  fechaAprobacion?: string;
  razonRechazo?: string;
  paciente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  doctor?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
}

export interface CrearCitaDto {
  pacienteId: number;
  doctorId: number;
  fechaHora: string;
  duracion?: number;
  tipoConsulta?: 'primera_vez' | 'control' | 'seguimiento' | 'urgencia';
  motivoConsulta?: string;
  notasPaciente?: string;
  costo?: number;
}

export interface ActualizarEstadoCitaDto {
  estado: 'pendiente' | 'confirmada' | 'aprobada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  notasDoctor?: string;
  razonRechazo?: string;
}

export interface BuscarDisponibilidadDto {
  doctorId: number;
  fecha: string;
  duracion?: number;
}

export interface DisponibilidadResponse {
  horariosDisponibles: string[];
}

export interface AgendaDoctorResponse {
  fecha: string;
  citas: Cita[];
  horariosDisponibles: string[];
}

// Servicio de citas médicas
export const citasService = {
  // Crear una nueva cita
  async crearCita(citaData: CrearCitaDto): Promise<Cita> {
    const response = await api.post('/citas', citaData);
    return response.data;
  },

  // Obtener citas por paciente
  async obtenerCitasPorPaciente(pacienteId: number): Promise<Cita[]> {
    const response = await api.get(`/citas/paciente/${pacienteId}`);
    return response.data;
  },

  // Obtener citas por doctor
  async obtenerCitasPorDoctor(doctorId: number): Promise<Cita[]> {
    const response = await api.get(`/citas/doctor/${doctorId}`);
    return response.data;
  },

  // Obtener mis citas (del usuario actual)
  async obtenerMisCitas(): Promise<Cita[]> {
    const response = await api.get('/citas/mis-citas');
    return response.data;
  },

  // Obtener cita por ID
  async obtenerCitaPorId(id: number): Promise<Cita> {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  },

  // Actualizar estado de cita
  async actualizarEstadoCita(id: number, estadoData: ActualizarEstadoCitaDto): Promise<Cita> {
    const response = await api.patch(`/citas/${id}/estado`, estadoData);
    return response.data;
  },

  // Eliminar cita
  async eliminarCita(id: number): Promise<void> {
    await api.delete(`/citas/${id}`);
  },

  // Buscar disponibilidad
  async buscarDisponibilidad(params: BuscarDisponibilidadDto): Promise<string[]> {
    const response = await api.get('/citas/disponibilidad', { params });
    return response.data;
  },

  // Obtener agenda de doctor
  async obtenerAgendaDoctor(doctorId: number, fecha: string): Promise<AgendaDoctorResponse> {
    const response = await api.get(`/citas/doctor/${doctorId}/agenda/${fecha}`);
    return response.data;
  },

  // Obtener citas pendientes de aprobación (solo admin)
  async obtenerCitasPendientesAprobacion(): Promise<Cita[]> {
    const response = await api.get('/citas/pendientes-aprobacion');
    return response.data;
  },

  // Métodos de utilidad
  getEstadoColor(estado: string): string {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-blue-100 text-blue-800',
      'aprobada': 'bg-green-100 text-green-800',
      'en_curso': 'bg-purple-100 text-purple-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'no_asistio': 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  },

  getEstadoTexto(estado: string): string {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'aprobada': 'Aprobada',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return textos[estado] || estado;
  },

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default citasService;
