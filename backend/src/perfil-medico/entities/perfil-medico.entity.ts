import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('perfiles_medicos')
export class PerfilMedico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', unique: true })
  usuarioId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'numero_registro_medico', unique: true })
  numeroRegistroMedico: string;

  @Column()
  especialidad: string;

  @Column({ type: 'simple-array', nullable: true })
  subespecialidades: string[];

  @Column({ name: 'universidad_egreso', nullable: true })
  universidadEgreso: string;

  @Column({ name: 'año_graduacion', nullable: true })
  añoGraduacion: number;

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @Column({ name: 'acepta_nuevos_pacientes', default: true })
  aceptaNuevosPacientes: boolean;

  @Column({ name: 'tarifa_consulta', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tarifaConsulta: number;

  @Column({ name: 'duracion_consulta_default', default: 20 }) // en minutos
  duracionConsultaDefault: number;

  // Datos adicionales de contacto
  @Column({ name: 'telefono_consultorio', nullable: true })
  telefonoConsultorio: string;

  @Column({ name: 'direccion_consultorio', nullable: true })
  direccionConsultorio: string;

  @Column({ nullable: true })
  ciudad: string;

  // Configuraciones de disponibilidad
  @Column({ name: 'dias_atencion', type: 'simple-array', nullable: true })
  diasAtencion: string[]; // ['lunes', 'martes', 'miércoles', ...]

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio: string; // '08:00'

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin: string; // '18:00'

  @Column({ name: 'hora_almuerzo_inicio', type: 'time', nullable: true })
  horaAlmuerzoInicio: string; // '12:00'

  @Column({ name: 'hora_almuerzo_fin', type: 'time', nullable: true })
  horaAlmuerzoFin: string; // '13:00'

  // Estado y validaciones
  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'verificado_colegio', default: false })
  verificadoColegio: boolean;

  @Column({ name: 'fecha_verificacion', type: 'datetime', nullable: true })
  fechaVerificacion: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
