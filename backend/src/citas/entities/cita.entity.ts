import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'paciente_id' })
  paciente: User;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ default: 60 }) // duración en minutos
  duracion: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendiente'
  })
  estado: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'primera_vez'
  })
  tipoConsulta: string;

  @Column({ type: 'text', nullable: true })
  motivoConsulta: string;

  @Column({ type: 'text', nullable: true })
  notasDoctor: string;

  @Column({ type: 'text', nullable: true })
  notasPaciente: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // Campos de aprobación
  @Column({ name: 'aprobada_por', nullable: true })
  aprobadaPor: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'aprobada_por' })
  aprobadaPorUsuario: User;

  @Column({ name: 'fecha_aprobacion', type: 'datetime', nullable: true })
  fechaAprobacion: Date;

  @Column({ type: 'text', nullable: true })
  razonRechazo: string;
}
