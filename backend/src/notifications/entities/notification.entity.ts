import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cita } from '../../citas/entities/cita.entity';

@Entity('notificaciones')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'cita_id', nullable: true })
  citaId: number;

  @Column({
    type: 'enum',
    enum: ['cita_confirmada', 'cita_cancelada', 'recordatorio', 'cita_reagendada', 'completar_perfil'],
    default: 'cita_confirmada'
  })
  tipo: string;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ name: 'doctor_nombre', nullable: true })
  doctorNombre: string;

  @Column({ name: 'fecha_cita', type: 'datetime', nullable: true })
  fechaCita: Date;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Cita, { nullable: true })
  @JoinColumn({ name: 'cita_id' })
  cita: Cita;
}
