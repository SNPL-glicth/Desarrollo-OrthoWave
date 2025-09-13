import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { PerfilMedico } from '../../perfil-medico/entities/perfil-medico.entity';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ name: 'rol_id' })
  rolId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'rol_id' })
  rol: Role;

  @Column({ name: 'fecha_creacion', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verification_code', nullable: true, length: 10 })
  verificationCode: string;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', nullable: true, type: 'datetime' })
  resetPasswordExpires: Date;

  @Column({ name: 'password_reset_code', nullable: true, length: 6 })
  passwordResetCode: string;

  @Column({ name: 'password_reset_code_expires', nullable: true, type: 'datetime' })
  passwordResetCodeExpires: Date;

  @Column({ name: 'is_approved', default: true })
  isApproved: boolean;

  @Column({ name: 'approval_status', default: 'approved' }) // 'pending', 'approved', 'rejected'
  approvalStatus: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @Column({ name: 'approval_date', nullable: true, type: 'datetime' })
  approvalDate: Date;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason: string;

  @OneToOne(() => PerfilMedico, perfilMedico => perfilMedico.usuario)
  perfilMedico: PerfilMedico;

  @OneToOne(() => Paciente, paciente => paciente.usuario)
  paciente: Paciente;
}
