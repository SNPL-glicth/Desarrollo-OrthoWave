import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', unique: true })
  usuarioId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  // Datos de identificación
  @Column({ name: 'numero_identificacion', nullable: true })
  numeroIdentificacion: string;

  @Column({
    name: 'tipo_identificacion',
    type: 'varchar',
    length: 10,
    default: 'CC'
  })
  tipoIdentificacion: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'masculino'
  })
  genero: string;

  // Campos adicionales eliminados por requerimientos del sistema

  // Información de salud básica
  @Column({ nullable: true })
  eps: string;

  @Column({ name: 'numero_afiliacion', nullable: true })
  numeroAfiliacion: string;

  @Column({ name: 'tipo_afiliacion', nullable: true })
  tipoAfiliacion: string; // EPS, Particular

  // Contacto de emergencia
  @Column({ name: 'contacto_emergencia_nombre', nullable: true })
  contactoEmergenciaNombre: string;

  @Column({ name: 'contacto_emergencia_telefono', nullable: true })
  contactoEmergenciaTelefono: string;

  @Column({ name: 'contacto_emergencia_parentesco', nullable: true })
  contactoEmergenciaParentesco: string;

  // Campos médicos eliminados por requerimientos del sistema

  // Configuraciones y preferencias
  @Column({ name: 'acepta_comunicaciones', default: true })
  aceptaComunicaciones: boolean;

  @Column({ name: 'prefiere_whatsapp', default: false })
  prefiereWhatsapp: boolean;

  @Column({ name: 'prefiere_email', default: true })
  prefiereEmail: boolean;

  @Column({ name: 'prefiere_sms', default: false })
  prefiereSms: boolean;

  // Estado del paciente
  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'primera_consulta', default: true })
  primeraConsulta: boolean;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
