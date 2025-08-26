import api from './api';
import { 
  getCurrentColombiaDate, 
  isDateInPastColombia,
  isTimeInPastColombia,
  isDateTimeInPastColombia 
} from '../utils/timezoneUtils';

// Enums y tipos para el nuevo sistema flexible
export enum ScheduleType {
  SPECIFIC_DATE = 'specific_date',
  WEEKLY_RECURRING = 'weekly_recurring',
  MONTHLY_RECURRING = 'monthly_recurring',
  EXCEPTION = 'exception'
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label?: string;
}

export interface FlexibleSchedule {
  id?: number;
  scheduleType: ScheduleType;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  slotDuration: number;
  bufferTime: number;
  maxAppointments: number;
  notes?: string;
  reason?: string;
  priority: number;
}

export interface DoctorAvailabilityResponse {
  date: string;
  isAvailable: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
    isBooked: boolean;
    appointmentId?: number;
    duration?: number;
  }[];
  maxAppointments: number;
  currentAppointments: number;
  slotDuration: number;
  bufferTime: number;
  notes?: string;
  reason?: string;
}

// Tipos legacy (mantener compatibilidad)
export interface DoctorSchedule {
  doctorId: number;
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // "08:00"
  endTime: string; // "17:00"
  breakStartTime?: string; // "12:00"
  breakEndTime?: string; // "13:00"
  isActive: boolean;
}

export interface LegacyTimeSlot {
  time: string; // "08:00"
  isAvailable: boolean;
  isOccupied: boolean;
  appointmentId?: number;
  duration?: number;
}

export interface DoctorAvailability {
  doctorId: number;
  date: string; // "2025-01-08"
  slots: LegacyTimeSlot[];
}

class DoctorAvailabilityService {
  // Obtener horario base de un doctor (horarios de trabajo)
  async getDoctorSchedule(doctorId: number): Promise<DoctorSchedule[]> {
    try {
      const response = await api.get(`/doctors/${doctorId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      // Horario por defecto si no hay configuración
      return this.getDefaultSchedule(doctorId);
    }
  }

  // Obtener disponibilidad específica para una fecha
  async getDoctorAvailability(doctorId: number, date: string): Promise<DoctorAvailability> {
    try {
      const response = await api.get(`/doctors/${doctorId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      // Generar disponibilidad basada en horario por defecto
      return await this.generateAvailabilityFromSchedule(doctorId, date);
    }
  }

  // Obtener disponibilidad para múltiples fechas
  async getDoctorAvailabilityRange(
    doctorId: number, 
    startDate: string, 
    endDate: string
  ): Promise<DoctorAvailability[]> {
    try {
      const response = await api.get(`/doctors/${doctorId}/availability/range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor availability range:', error);
      return [];
    }
  }

  // Verificar si un slot específico está disponible
  async isSlotAvailable(
    doctorId: number, 
    date: string, 
    time: string, 
    duration: number = 60
  ): Promise<boolean> {
    try {
      const response = await api.get(`/doctors/${doctorId}/availability/check`, {
        params: { date, time, duration }
      });
      return response.data.available;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  // Obtener citas existentes para un doctor en una fecha
  async getDoctorAppointments(doctorId: number, date: string) {
    try {
      const response = await api.get(`/citas/doctor/${doctorId}/agenda/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return [];
    }
  }

  // Generar slots de tiempo estándar (cada 20 minutos)
  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:20`);
      slots.push(`${hour.toString().padStart(2, '0')}:40`);
    }
    return slots;
  }

  // Horario por defecto para doctores
  private getDefaultSchedule(doctorId: number): DoctorSchedule[] {
    const schedule: DoctorSchedule[] = [];
    // Lunes a Viernes: 8:00 AM - 5:00 PM con break 12:00-1:00
    for (let day = 1; day <= 5; day++) {
      schedule.push({
        doctorId,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
      });
    }
    return schedule;
  }

  // Generar disponibilidad basada en horario
  private async generateAvailabilityFromSchedule(
    doctorId: number, 
    date: string
  ): Promise<DoctorAvailability> {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    const schedule = await this.getDoctorSchedule(doctorId);
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);
    
    if (!daySchedule) {
      // No hay horario para este día
      return {
        doctorId,
        date,
        slots: []
      };
    }

    // Obtener citas existentes
    const existingAppointments = await this.getDoctorAppointments(doctorId, date);
    
    // Generar slots disponibles
    const allSlots = this.generateTimeSlots();
    const slots: LegacyTimeSlot[] = [];

    for (const time of allSlots) {
      const [hour, minute] = time.split(':').map(Number);
      const startHour = parseInt(daySchedule.startTime.split(':')[0]);
      const endHour = parseInt(daySchedule.endTime.split(':')[0]);
      
      // Verificar si está dentro del horario de trabajo
      const isWithinWorkingHours = hour >= startHour && hour < endHour;
      
      // Verificar si está en el break
      const isInBreak = daySchedule.breakStartTime && daySchedule.breakEndTime &&
        time >= daySchedule.breakStartTime && time < daySchedule.breakEndTime;
      
      // Verificar si hay cita existente
      const existingAppointment = existingAppointments.find((app: any) => {
        const appTime = new Date(app.fechaHora).toTimeString().substring(0, 5);
        return appTime === time;
      });

      if (isWithinWorkingHours && !isInBreak) {
        // Verificar si el slot está en el pasado usando zona horaria colombiana
        const isPastSlot = isDateTimeInPastColombia(dateObj, time);
        
        slots.push({
          time,
          isAvailable: !existingAppointment && !isPastSlot,
          isOccupied: !!existingAppointment,
          appointmentId: existingAppointment?.id,
          duration: existingAppointment?.duracion
        });
      }
    }

    return {
      doctorId,
      date,
      slots
    };
  }

  // Actualizar horario de un doctor
  async updateDoctorSchedule(doctorId: number, schedule: DoctorSchedule[]): Promise<void> {
    try {
      await api.put(`/doctors/${doctorId}/schedule`, { schedule });
    } catch (error) {
      console.error('Error updating doctor schedule:', error);
      throw error;
    }
  }

  // Bloquear slot específico
  async blockSlot(doctorId: number, date: string, time: string, reason: string): Promise<void> {
    try {
      await api.post(`/doctors/${doctorId}/availability/block`, {
        date,
        time,
        reason
      });
    } catch (error) {
      console.error('Error blocking slot:', error);
      throw error;
    }
  }

  // Desbloquear slot
  async unblockSlot(doctorId: number, date: string, time: string): Promise<void> {
    try {
      await api.delete(`/doctors/${doctorId}/availability/block`, {
        data: { date, time }
      });
    } catch (error) {
      console.error('Error unblocking slot:', error);
      throw error;
    }
  }

  // MÉTODOS PARA EL NUEVO SISTEMA FLEXIBLE

  // Obtener todos los horarios flexibles del doctor
  async getFlexibleSchedules(): Promise<FlexibleSchedule[]> {
    try {
      const response = await api.get('/doctor-availability/my-schedules');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching flexible schedules:', error);
      return [];
    }
  }

  // Crear un horario flexible
  async createFlexibleSchedule(schedule: Omit<FlexibleSchedule, 'id'>): Promise<FlexibleSchedule> {
    try {
      const response = await api.post('/doctor-availability/schedule', schedule);
      return response.data.data;
    } catch (error) {
      console.error('Error creating flexible schedule:', error);
      throw error;
    }
  }

  // Actualizar un horario flexible
  async updateFlexibleSchedule(schedule: FlexibleSchedule): Promise<FlexibleSchedule> {
    try {
      const response = await api.put('/doctor-availability/schedule', schedule);
      return response.data.data;
    } catch (error) {
      console.error('Error updating flexible schedule:', error);
      throw error;
    }
  }

  // Eliminar un horario flexible
  async deleteFlexibleSchedule(scheduleId: number): Promise<void> {
    try {
      await api.delete(`/doctor-availability/schedule/${scheduleId}`);
    } catch (error) {
      console.error('Error deleting flexible schedule:', error);
      throw error;
    }
  }

  // Obtener disponibilidad flexible para un rango de fechas
  async getFlexibleAvailability(
    startDate: string,
    endDate: string
  ): Promise<DoctorAvailabilityResponse[]> {
    try {
      const response = await api.get('/doctor-availability/availability', {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching flexible availability:', error);
      return [];
    }
  }

  // Obtener disponibilidad para una fecha específica
  async getFlexibleAvailabilityForDate(date: string): Promise<DoctorAvailabilityResponse> {
    try {
      const response = await api.get(`/doctor-availability/availability/${date}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching availability for date:', error);
      throw error;
    }
  }

  // Configurar horario semanal estándar
  async setStandardWeeklySchedule(
    timeSlots: TimeSlot[],
    options: {
      slotDuration?: number;
      bufferTime?: number;
      maxAppointments?: number;
    } = {}
  ): Promise<FlexibleSchedule[]> {
    try {
      const response = await api.post('/doctor-availability/weekly-standard', {
        timeSlots,
        slotDuration: options.slotDuration || 60,
        bufferTime: options.bufferTime || 0,
        maxAppointments: options.maxAppointments || 8
      });
      return response.data.data;
    } catch (error) {
      console.error('Error setting standard weekly schedule:', error);
      throw error;
    }
  }

  // Bloquear rango de fechas
  async blockDateRange(
    startDate: string,
    endDate: string,
    reason: string,
    notifyPatients: boolean = true
  ): Promise<FlexibleSchedule> {
    try {
      const response = await api.post('/doctor-availability/block-dates', {
        startDate,
        endDate,
        reason,
        notifyPatients
      });
      return response.data.data;
    } catch (error) {
      console.error('Error blocking date range:', error);
      throw error;
    }
  }

  // Configurar horario para fecha específica
  async setSpecificDateSchedule(
    date: string,
    timeSlots: TimeSlot[],
    options: {
      slotDuration?: number;
      bufferTime?: number;
      maxAppointments?: number;
      notes?: string;
    } = {}
  ): Promise<FlexibleSchedule> {
    try {
      const response = await api.post('/doctor-availability/specific-date', {
        date,
        timeSlots,
        slotDuration: options.slotDuration || 60,
        bufferTime: options.bufferTime || 0,
        maxAppointments: options.maxAppointments || 8,
        notes: options.notes
      });
      return response.data.data;
    } catch (error) {
      console.error('Error setting specific date schedule:', error);
      throw error;
    }
  }

  // Obtener plantillas de horarios
  async getScheduleTemplates(): Promise<any> {
    try {
      const response = await api.get('/doctor-availability/templates');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching schedule templates:', error);
      return {};
    }
  }

  // Operaciones en lote
  async bulkScheduleOperation(
    schedules: Omit<FlexibleSchedule, 'id'>[],
    overwriteExisting: boolean = false
  ): Promise<FlexibleSchedule[]> {
    try {
      const response = await api.post('/doctor-availability/bulk-operation', {
        schedules,
        overwriteExisting
      });
      return response.data.data;
    } catch (error) {
      console.error('Error in bulk schedule operation:', error);
      throw error;
    }
  }
}

export const doctorAvailabilityService = new DoctorAvailabilityService();
export default doctorAvailabilityService;
