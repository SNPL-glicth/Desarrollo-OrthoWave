import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

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
}
