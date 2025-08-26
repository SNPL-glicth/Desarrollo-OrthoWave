import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ScheduleType {
  SPECIFIC_DATE = 'specific_date',     // Para una fecha específica
  WEEKLY_RECURRING = 'weekly_recurring', // Para patrón semanal recurrente
  MONTHLY_RECURRING = 'monthly_recurring', // Para patrón mensual recurrente
  EXCEPTION = 'exception'              // Para excepciones/bloqueos
}

export enum RecurrencePattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label?: string;
}

/**
 * Entidad para manejo súper flexible de horarios de doctores
 * Permite configurar horarios específicos, recurrentes y excepciones
 */
@Entity('flexible_doctor_schedules')
@Index(['doctor_id', 'schedule_type', 'start_date'], { unique: false })
@Index(['doctor_id', 'day_of_week', 'schedule_type'], { unique: false })
@Index(['doctor_id', 'start_date', 'end_date'], { unique: false })
export class FlexibleDoctorSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column()
  doctor_id: number;

  @Column({
    type: 'enum',
    enum: ScheduleType,
    default: ScheduleType.SPECIFIC_DATE
  })
  schedule_type: ScheduleType;

  // Para fechas específicas o inicio de rango
  @Column({ type: 'date', nullable: true })
  start_date: Date;

  // Para rangos de fechas
  @Column({ type: 'date', nullable: true })
  end_date: Date;

  // Para patrones recurrentes
  @Column({
    type: 'enum',
    enum: RecurrencePattern,
    default: RecurrencePattern.NONE,
    nullable: true
  })
  recurrence_pattern: RecurrencePattern;

  // Día de la semana (0-6, domingo-sábado) para patrones semanales
  @Column({ nullable: true })
  day_of_week: number;

  // Día del mes (1-31) para patrones mensuales
  @Column({ nullable: true })
  day_of_month: number;

  // Indica si el doctor está disponible
  @Column({ default: true })
  is_available: boolean;

  // Horarios específicos del día en formato JSON
  @Column({ type: 'json', nullable: true })
  time_slots: TimeSlot[];

  // Duración de cada cita en minutos
  @Column({ default: 60 })
  slot_duration: number;

  // Tiempo de buffer entre citas en minutos
  @Column({ default: 0 })
  buffer_time: number;

  // Número máximo de citas para este período
  @Column({ default: 8 })
  max_appointments: number;

  // Notas del doctor para este horario
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Para casos especiales (vacaciones, conferencias, etc.)
  @Column({ type: 'varchar', nullable: true })
  reason: string;

  // Configuración de notificaciones
  @Column({ default: false })
  notify_patients: boolean;

  // Prioridad del horario (útil para resolver conflictos)
  @Column({ default: 3 })
  priority: number; // 1 = alta, 5 = baja

  // Indica si este horario está activo
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Métodos de utilidad
  /**
   * Verifica si este horario aplica para una fecha específica
   */
  appliesToDate(date: Date): boolean {
    const checkDate = new Date(date);
    
    switch (this.schedule_type) {
      case ScheduleType.SPECIFIC_DATE:
        return this.start_date && 
               checkDate.toDateString() === new Date(this.start_date).toDateString();
      
      case ScheduleType.WEEKLY_RECURRING:
        return checkDate.getDay() === this.day_of_week;
      
      case ScheduleType.MONTHLY_RECURRING:
        return checkDate.getDate() === this.day_of_month;
      
      case ScheduleType.EXCEPTION:
        if (this.start_date && this.end_date) {
          return checkDate >= new Date(this.start_date) && 
                 checkDate <= new Date(this.end_date);
        }
        return this.start_date && 
               checkDate.toDateString() === new Date(this.start_date).toDateString();
      
      default:
        return false;
    }
  }

  /**
   * Obtiene los slots de tiempo disponibles
   */
  getAvailableTimeSlots(): TimeSlot[] {
    if (!this.is_available || !this.time_slots) {
      return [];
    }
    return this.time_slots;
  }

  /**
   * Verifica si un horario específico está disponible
   */
  isTimeSlotAvailable(timeSlot: string): boolean {
    if (!this.is_available) return false;
    
    return this.time_slots?.some(slot => {
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      return timeSlot >= slotStart && timeSlot < slotEnd;
    }) || false;
  }

  /**
   * Calcula el número de slots disponibles para un día
   */
  calculateTotalSlots(): number {
    if (!this.is_available || !this.time_slots) return 0;
    
    let totalMinutes = 0;
    for (const slot of this.time_slots) {
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);
      totalMinutes += (endMinutes - startMinutes);
    }
    
    return Math.floor(totalMinutes / (this.slot_duration + this.buffer_time));
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
