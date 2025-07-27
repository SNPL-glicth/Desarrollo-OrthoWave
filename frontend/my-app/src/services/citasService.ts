import api from './api';

export interface Cita {
  id: number;
  pacienteId: number;
  doctorId: number;
  fechaHora: string;
  duracion: number;
  estado: 'pendiente' | 'confirmada' | 'aprobada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  tipoConsulta: 'primera_vez' | 'control' | 'seguimiento' | 'urgencia';
  motivoConsulta: string;
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
  motivoConsulta: string;
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

// Callbacks para notificaciones en tiempo real
type CitaCallback = (cita: Cita) => void;
type CitasCallback = (citas: Cita[]) => void;

class CitasServiceClass {
  private callbacks: {
    onCitaCreated: CitaCallback[];
    onCitaUpdated: CitaCallback[];
    onCitasChanged: CitasCallback[];
  } = {
    onCitaCreated: [],
    onCitaUpdated: [],
    onCitasChanged: []
  };

  // Suscribirse a eventos
  onCitaCreated(callback: CitaCallback) {
    this.callbacks.onCitaCreated.push(callback);
    return () => {
      this.callbacks.onCitaCreated = this.callbacks.onCitaCreated.filter(cb => cb !== callback);
    };
  }

  onCitaUpdated(callback: CitaCallback) {
    this.callbacks.onCitaUpdated.push(callback);
    return () => {
      this.callbacks.onCitaUpdated = this.callbacks.onCitaUpdated.filter(cb => cb !== callback);
    };
  }

  onCitasChanged(callback: CitasCallback) {
    this.callbacks.onCitasChanged.push(callback);
    return () => {
      this.callbacks.onCitasChanged = this.callbacks.onCitasChanged.filter(cb => cb !== callback);
    };
  }

  // Notificar cambios
  private notifyCreated(cita: Cita) {
    this.callbacks.onCitaCreated.forEach(callback => callback(cita));
  }

  private notifyUpdated(cita: Cita) {
    this.callbacks.onCitaUpdated.forEach(callback => callback(cita));
  }

  private notifyChanged(citas: Cita[]) {
    this.callbacks.onCitasChanged.forEach(callback => callback(citas));
  }

  // Crear una nueva cita con persistencia mejorada
  async crearCita(citaData: CrearCitaDto): Promise<Cita> {
    try {
      // Validar datos antes de enviar
      if (!citaData.pacienteId || !citaData.doctorId || !citaData.fechaHora) {
        throw new Error('Datos incompletos para crear la cita');
      }

      // Verificar disponibilidad antes de crear
      const disponibilidad = await this.buscarDisponibilidad({
        doctorId: citaData.doctorId,
        fecha: citaData.fechaHora.split('T')[0],
        duracion: citaData.duracion || 60
      });

      const horaSeleccionada = citaData.fechaHora.split('T')[1].substring(0, 5);
      if (!disponibilidad.includes(horaSeleccionada)) {
        throw new Error('El horario seleccionado ya no está disponible');
      }

      // Crear la cita
      const response = await api.post('/citas', {
        ...citaData,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString()
      });

      const nuevaCita = response.data;
      
      // Notificar creación
      this.notifyCreated(nuevaCita);
      
      return nuevaCita;
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al crear la cita');
    }
  }

  // Obtener citas por paciente
  async obtenerCitasPorPaciente(pacienteId: number, signal?: AbortSignal): Promise<Cita[]> {
    const response = await api.get(`/citas/paciente/${pacienteId}`, {
      signal
    });
    return response.data;
  }

  // Obtener citas por doctor
  async obtenerCitasPorDoctor(doctorId: number, signal?: AbortSignal): Promise<Cita[]> {
    const response = await api.get(`/citas/doctor/${doctorId}`, {
      signal
    });
    return response.data;
  }

  // Obtener mis citas (del usuario actual)
  async obtenerMisCitas(): Promise<Cita[]> {
    const response = await api.get('/citas/mis-citas');
    return response.data;
  }

  // Obtener cita por ID
  async obtenerCitaPorId(id: number): Promise<Cita> {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  }

  // Actualizar estado de cita con notificaciones
  async actualizarEstadoCita(id: number, estadoData: ActualizarEstadoCitaDto): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/estado`, {
        ...estadoData,
        fechaActualizacion: new Date().toISOString()
      });
      
      const citaActualizada = response.data;
      
      // Notificar actualización
      this.notifyUpdated(citaActualizada);
      
      return citaActualizada;
    } catch (error: any) {
      console.error('Error al actualizar cita:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la cita');
    }
  }

  // Método optimizado para recargar citas con polling y soporte para AbortSignal
  async recargarCitas(userId: number, userRole: string, signal?: AbortSignal): Promise<Cita[]> {
    try {
      let citas: Cita[] = [];
      
      // Verificar si la operación fue cancelada
      if (signal?.aborted) {
        throw new Error('Operation was aborted');
      }
      
      if (userRole === 'paciente') {
        citas = await this.obtenerCitasPorPaciente(userId, signal);
      } else if (userRole === 'doctor') {
        citas = await this.obtenerCitasPorDoctor(userId, signal);
      }
      
      // Verificar nuevamente si fue cancelada después de la petición
      if (signal?.aborted) {
        throw new Error('Operation was aborted');
      }
      
      // Asegurarse de que citas sea un array
      if (!Array.isArray(citas)) {
        console.warn('La respuesta no es un array, convirtiendo a array vacío');
        citas = [];
      }
      
      // Notificar cambios siempre, incluso si el array está vacío
      this.notifyChanged(citas);
      
      return citas;
    } catch (error: any) {
      // Si fue cancelada por AbortSignal, re-lanzar el error
      if (signal?.aborted || error.name === 'AbortError') {
        throw error;
      }
      
      console.error('Error al recargar citas:', error);
      
      // Si el endpoint no existe o hay error 404, devolver array vacío
      if (error.response?.status === 404) {
        console.log('Endpoint de citas no encontrado, devolviendo array vacío');
        return [];
      }
      
      // Para otros errores, también devolver array vacío en lugar de lanzar error
      // Esto evita el bucle infinito
      console.warn('Devolviendo array vacío por error en API');
      return [];
    }
  }

  // Eliminar cita
  async eliminarCita(id: number): Promise<void> {
    await api.delete(`/citas/${id}`);
  }

  // Buscar disponibilidad
  async buscarDisponibilidad(params: BuscarDisponibilidadDto): Promise<string[]> {
    const response = await api.get('/citas/disponibilidad', { params });
    return response.data;
  }

  // Obtener agenda de doctor
  async obtenerAgendaDoctor(doctorId: number, fecha: string): Promise<AgendaDoctorResponse> {
    const response = await api.get(`/citas/doctor/${doctorId}/agenda/${fecha}`);
    return response.data;
  }

  // Obtener citas pendientes de aprobación (solo admin)
  async obtenerCitasPendientesAprobacion(): Promise<Cita[]> {
    const response = await api.get('/citas/pendientes-aprobacion');
    return response.data;
  }

  // Métodos de utilidad
  getEstadoColor(estado: string): string {
    const colores: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-blue-100 text-blue-800',
      'aprobada': 'bg-green-100 text-green-800',
      'en_curso': 'bg-purple-100 text-purple-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'no_asistio': 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'aprobada': 'Aprobada',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return textos[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Instancia del servicio
export const citasService = new CitasServiceClass();

export default citasService;
