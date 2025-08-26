import api from './api';

export interface SolicitudCita {
  id: number;
  fechaHora: string;
  duracion: number;
  tipoConsulta: string;
  motivoConsulta: string;
  notasPaciente?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaCreacion: string;
  razonRechazo?: string;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  doctor: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

class AppointmentRequestsService {
  // Obtener solicitudes pendientes para un doctor específico
  async getSolicitudesPendientesDoctor(doctorId: number): Promise<SolicitudCita[]> {
    try {
      const response = await api.get(`/citas/doctor/${doctorId}/solicitudes-pendientes`);
      const data = response.data;
      
      // Asegurarse de que sea un array
      if (!Array.isArray(data)) {
        console.warn('La respuesta no es un array:', data);
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error('Error al obtener solicitudes pendientes:', error);
      
      // Si es 404, probablemente significa que no hay endpoint o no hay solicitudes
      if (error.response?.status === 404) {
        console.log('Endpoint no encontrado, retornando array vacío');
        return [];
      }
      
      throw error;
    }
  }

  // Obtener mis solicitudes pendientes (para doctor autenticado)
  async getMisSolicitudesPendientes(): Promise<SolicitudCita[]> {
    try {
      const response = await api.get('/citas/mis-solicitudes-pendientes');
      const data = response.data;
      
      // Asegurarse de que sea un array
      if (!Array.isArray(data)) {
        console.warn('La respuesta no es un array:', data);
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error('Error al obtener mis solicitudes pendientes:', error);
      
      // Si es 404, probablemente significa que no hay endpoint o no hay solicitudes
      if (error.response?.status === 404) {
        console.log('Endpoint no encontrado, retornando array vacío');
        return [];
      }
      
      throw error;
    }
  }

  // Aprobar una solicitud de cita
  async aprobarSolicitud(citaId: number): Promise<SolicitudCita> {
    try {
      const response = await api.patch(`/citas/${citaId}/aprobar`);
      return response.data;
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      throw error;
    }
  }

  // Rechazar una solicitud de cita
  async rechazarSolicitud(citaId: number, razonRechazo?: string): Promise<SolicitudCita> {
    try {
      const response = await api.patch(`/citas/${citaId}/rechazar`, {
        razonRechazo: razonRechazo || 'Sin razón especificada'
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw error;
    }
  }

  // Contar solicitudes pendientes para un doctor
  async contarSolicitudesPendientes(doctorId?: number): Promise<number> {
    try {
      let solicitudes: SolicitudCita[];
      
      if (doctorId) {
        solicitudes = await this.getSolicitudesPendientesDoctor(doctorId);
      } else {
        solicitudes = await this.getMisSolicitudesPendientes();
      }
      
      return solicitudes.length;
    } catch (error) {
      console.error('Error al contar solicitudes pendientes:', error);
      return 0;
    }
  }

  // Obtener conteo directo de solicitudes pendientes (optimizado)
  async getConteoSolicitudesPendientes(): Promise<number> {
    try {
      const response = await api.get('/citas/mi-conteo-solicitudes-pendientes');
      return response.data.count || 0;
    } catch (error: any) {
      console.error('Error al obtener conteo de solicitudes pendientes:', error);
      
      const status = error.response?.status;
      
      // Si es 404, probablemente significa que no hay endpoint implementado
      if (status === 404) {
        console.log('Endpoint de conteo no encontrado, retornando 0');
        return 0;
      }
      
      // Si es 400 o 403, probablemente el usuario no es doctor
      if (status === 400 || status === 403) {
        console.log('Usuario no autorizado para ver conteo de solicitudes (no es doctor), retornando 0');
        return 0;
      }
      
      // Si es 401, problemas de autenticación
      if (status === 401) {
        console.log('Usuario no autenticado, retornando 0');
        return 0;
      }
      
      return 0;
    }
  }
}

export const appointmentRequestsService = new AppointmentRequestsService();
export default appointmentRequestsService;
