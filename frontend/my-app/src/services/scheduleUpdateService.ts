/**
 * Servicio para coordinar las actualizaciones de horarios entre componentes
 * Utiliza eventos del navegador para comunicación entre componentes no relacionados
 */

// Tipo de eventos que se pueden emitir
export type ScheduleUpdateEventType = 
  | 'schedule-created'
  | 'schedule-updated' 
  | 'schedule-deleted'
  | 'working-days-updated'
  | 'dates-blocked'
  | 'dates-unblocked';

// Interfaz para los datos del evento
export interface ScheduleUpdateEventData {
  type: ScheduleUpdateEventType;
  scheduleId?: number;
  doctorId?: number;
  date?: string;
  details?: any;
  timestamp: number;
}

class ScheduleUpdateService {
  private readonly EVENT_NAME = 'schedule-update';

  /**
   * Emite un evento de actualización de horario
   */
  public emitScheduleUpdate(data: Omit<ScheduleUpdateEventData, 'timestamp'>): void {
    const eventData: ScheduleUpdateEventData = {
      ...data,
      timestamp: Date.now()
    };

    console.log('📢 Emitiendo evento de actualización de horario:', eventData);

    const customEvent = new CustomEvent(this.EVENT_NAME, {
      detail: eventData,
      bubbles: true,
      cancelable: true
    });

    window.dispatchEvent(customEvent);
  }

  /**
   * Suscribe a eventos de actualización de horario
   */
  public onScheduleUpdate(callback: (data: ScheduleUpdateEventData) => void): () => void {
    const eventListener = (event: CustomEvent<ScheduleUpdateEventData>) => {
      console.log('📥 Recibido evento de actualización de horario:', event.detail);
      callback(event.detail);
    };

    window.addEventListener(this.EVENT_NAME, eventListener as EventListener);

    // Retornar función de cleanup
    return () => {
      window.removeEventListener(this.EVENT_NAME, eventListener as EventListener);
    };
  }

  /**
   * Métodos de conveniencia para emitir eventos específicos
   */
  public emitScheduleCreated(scheduleId: number, doctorId: number, details?: any): void {
    this.emitScheduleUpdate({
      type: 'schedule-created',
      scheduleId,
      doctorId,
      details
    });
  }

  public emitScheduleUpdated(scheduleId: number, doctorId: number, details?: any): void {
    this.emitScheduleUpdate({
      type: 'schedule-updated',
      scheduleId,
      doctorId,
      details
    });
  }

  public emitScheduleDeleted(scheduleId: number, doctorId: number, details?: any): void {
    this.emitScheduleUpdate({
      type: 'schedule-deleted',
      scheduleId,
      doctorId,
      details
    });
  }

  public emitWorkingDaysUpdated(doctorId: number, workingDays: number[], details?: any): void {
    this.emitScheduleUpdate({
      type: 'working-days-updated',
      doctorId,
      details: { workingDays, ...details }
    });
  }

  public emitDatesBlocked(doctorId: number, startDate: string, endDate: string, reason?: string): void {
    this.emitScheduleUpdate({
      type: 'dates-blocked',
      doctorId,
      details: { startDate, endDate, reason }
    });
  }

  public emitDatesUnblocked(scheduleId: number, doctorId: number, details?: any): void {
    this.emitScheduleUpdate({
      type: 'dates-unblocked',
      scheduleId,
      doctorId,
      details
    });
  }
}

// Exportar una instancia singleton
export const scheduleUpdateService = new ScheduleUpdateService();
