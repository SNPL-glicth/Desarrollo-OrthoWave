import api from './api';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  service: string;
  notes?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  time?: string;
  status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  service?: string;
  notes?: string;
}

export const appointmentService = {
  // Obtener todas las citas
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  // Obtener cita por ID
  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  },

  // Obtener citas de un paciente
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas del paciente:', error);
      throw error;
    }
  },

  // Obtener citas de un doctor
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas del doctor:', error);
      throw error;
    }
  },

  // Crear nueva cita
  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  // Actualizar cita
  async updateAppointment(id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  },

  // Cancelar cita
  async cancelAppointment(id: string): Promise<Appointment> {
    try {
      const response = await api.put(`/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  },

  // Confirmar cita
  async confirmAppointment(id: string): Promise<Appointment> {
    try {
      const response = await api.put(`/appointments/${id}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      throw error;
    }
  },

  // Completar cita
  async completeAppointment(id: string): Promise<Appointment> {
    try {
      const response = await api.put(`/appointments/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error al completar cita:', error);
      throw error;
    }
  },

  // Eliminar cita
  async deleteAppointment(id: string): Promise<void> {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  },

  // Obtener citas por fecha
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/appointments/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas por fecha:', error);
      throw error;
    }
  },

  // Obtener citas en un rango de fechas
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/appointments/range?start=${startDate}&end=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas por rango de fechas:', error);
      throw error;
    }
  },

  // Obtener horarios disponibles para un doctor en una fecha específica
  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    try {
      const response = await api.get(`/appointments/available-slots/${doctorId}/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  },

  // Buscar citas
  async searchAppointments(query: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/appointments/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar citas:', error);
      throw error;
    }
  }
};
