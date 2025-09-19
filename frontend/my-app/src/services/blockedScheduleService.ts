import { CalendarEvent } from '../types/calendar';
import { API_CONFIG } from '../config/api.js';

export interface BlockedSchedule {
  id: number;
  scheduleType: 'exception' | 'specific_date' | 'weekly_recurring';
  startDate: string;
  endDate?: string;
  dayOfWeek?: number;
  isAvailable: boolean;
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  reason?: string;
  notes?: string;
}

class BlockedScheduleService {
  private baseUrl = `${API_CONFIG.BASE_URL}/doctor-availability`;

  /**
   * Obtener todos los horarios bloqueados del doctor actual
   */
  async getBlockedSchedules(): Promise<BlockedSchedule[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/my-schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener horarios bloqueados');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching blocked schedules:', error);
      return [];
    }
  }

  /**
   * Convertir horarios bloqueados a eventos de calendario
   */
  convertToCalendarEvents(blockedSchedules: BlockedSchedule[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    blockedSchedules.forEach(schedule => {
      if (schedule.scheduleType === 'exception') {
        // Fechas específicamente bloqueadas
        const startDate = new Date(schedule.startDate);
        const endDate = schedule.endDate ? new Date(schedule.endDate) : startDate;

        // Si es un rango de fechas, crear eventos para cada día
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          events.push({
            id: `blocked-${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
            title: `🚫 ${schedule.reason || 'Fecha Bloqueada'}`,
            startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0),
            endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59),
            type: 'blocked',
            status: 'blocked',
            description: schedule.reason || 'Fecha bloqueada por el doctor',
            backgroundColor: '#dc2626', // Rojo
            textColor: '#ffffff',
            borderColor: '#b91c1c',
            extendedProps: {
              scheduleId: schedule.id,
              scheduleType: schedule.scheduleType,
              reason: schedule.reason,
              isBlockedDate: true,
              isAllDay: true
            }
          });

          // Avanzar al siguiente día
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (schedule.scheduleType === 'specific_date' && !schedule.isAvailable) {
        // Fechas específicas sin disponibilidad
        const date = new Date(schedule.startDate);
        
        if (schedule.timeSlots && schedule.timeSlots.length > 0) {
          // Crear eventos para slots específicos bloqueados
          schedule.timeSlots.forEach((slot, index) => {
            const [startHour, startMinute] = slot.startTime.split(':').map(Number);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);

            const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute);
            const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute);

            events.push({
              id: `blocked-slot-${schedule.id}-${index}`,
              title: `🚫 Sin disponibilidad - ${slot.label || 'Horario bloqueado'}`,
              startTime,
              endTime,
              type: 'blocked',
              status: 'blocked',
              description: schedule.notes || 'Horario específico bloqueado',
              backgroundColor: '#dc2626',
              textColor: '#ffffff',
              borderColor: '#b91c1c',
              extendedProps: {
                scheduleId: schedule.id,
                scheduleType: schedule.scheduleType,
                reason: schedule.notes,
                isBlockedSlot: true,
                timeSlot: slot
              }
            });
          });
        } else {
          // Día completo sin disponibilidad
          events.push({
            id: `blocked-day-${schedule.id}`,
            title: `🚫 Sin disponibilidad`,
            startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
            type: 'blocked',
            status: 'blocked',
            description: schedule.notes || 'Día sin disponibilidad',
            backgroundColor: '#dc2626',
            textColor: '#ffffff',
            borderColor: '#b91c1c',
            extendedProps: {
              scheduleId: schedule.id,
              scheduleType: schedule.scheduleType,
              reason: schedule.notes,
              isBlockedDate: true,
              isAllDay: true
            }
          });
        }
      }
    });

    return events;
  }

  /**
   * Verificar si una fecha/hora específica está bloqueada
   */
  isTimeSlotBlocked(date: Date, startTime: string, endTime: string, blockedSchedules: BlockedSchedule[]): boolean {
    const dateString = date.toISOString().split('T')[0];

    return blockedSchedules.some(schedule => {
      // Verificar bloqueos por excepción (fechas específicas bloqueadas)
      if (schedule.scheduleType === 'exception') {
        const startDate = schedule.startDate;
        const endDate = schedule.endDate || startDate;
        
        return dateString >= startDate && dateString <= endDate;
      }

      // Verificar bloqueos de días específicos sin disponibilidad
      if (schedule.scheduleType === 'specific_date' && !schedule.isAvailable) {
        if (dateString === schedule.startDate) {
          // Si no hay timeSlots, todo el día está bloqueado
          if (!schedule.timeSlots || schedule.timeSlots.length === 0) {
            return true;
          }

          // Verificar si el horario específico está bloqueado
          return schedule.timeSlots.some(slot => {
            return startTime >= slot.startTime && endTime <= slot.endTime;
          });
        }
      }

      return false;
    });
  }

  /**
   * Eliminar un horario bloqueado específico
   */
  async removeBlockedSchedule(scheduleId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar horario bloqueado');
      }
    } catch (error) {
      console.error('Error removing blocked schedule:', error);
      throw error;
    }
  }

  /**
   * Eliminar todos los horarios bloqueados
   */
  async removeAllBlockedSchedules(): Promise<void> {
    try {
      const blockedSchedules = await this.getBlockedSchedules();
      const exceptions = blockedSchedules.filter(s => s.scheduleType === 'exception');

      for (const schedule of exceptions) {
        await this.removeBlockedSchedule(schedule.id);
      }
    } catch (error) {
      console.error('Error removing all blocked schedules:', error);
      throw error;
    }
  }
}

export const blockedScheduleService = new BlockedScheduleService();
