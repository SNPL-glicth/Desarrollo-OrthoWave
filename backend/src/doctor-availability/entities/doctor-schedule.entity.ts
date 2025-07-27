import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad para manejo flexible de horarios de doctores
 * Permite configurar horarios por fecha específica y patrones recurrentes
 */
@Entity('doctor_schedules')
@Index(['doctor_id', 'date'], { unique: true })
export class DoctorSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column()
  doctor_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: true })
  is_available: boolean;

  @Column({ type: 'time', nullable: true })
  start_time: string;

  @Column({ type: 'time', nullable: true })
  end_time: string;

  @Column({ type: 'time', nullable: true })
  break_start: string; // Hora de inicio de descanso/almuerzo

  @Column({ type: 'time', nullable: true })
  break_end: string; // Hora de fin de descanso/almuerzo

  @Column({ default: 30 })
  slot_duration: number; // Duración de cada slot en minutos

  @Column({ default: 0 })
  buffer_time: number; // Tiempo de buffer entre citas en minutos

  @Column({ type: 'json', nullable: true })
  custom_slots: string[]; // Slots personalizados para ese día ["09:00", "10:30", "14:00"]

  @Column({ default: 8 })
  max_appointments: number;

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas especiales para ese día

  @Column({
    type: 'enum',
    enum: ['specific', 'weekly_recurring', 'exception'],
    default: 'specific'
  })
  schedule_type: string;

  @Column({ nullable: true })
  recurring_day: number; // Para patrones recurrentes (0-6, domingo-sábado)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
