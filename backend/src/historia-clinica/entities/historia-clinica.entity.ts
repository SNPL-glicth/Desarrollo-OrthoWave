import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cita } from '../../citas/entities/cita.entity';

@Entity('historias_clinicas')
export class HistoriaClinica {
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

  @Column({ name: 'cita_id', nullable: true })
  citaId: number;

  @ManyToOne(() => Cita)
  @JoinColumn({ name: 'cita_id' })
  cita: Cita;

  @Column({ type: 'text' })
  motivoConsulta: string;

  @Column({ type: 'text' })
  enfermedadActual: string;

  @Column({ type: 'text', nullable: true })
  antecedentesMedicos: string;

  @Column({ type: 'text', nullable: true })
  antecedentesQuirurgicos: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @Column({ type: 'text', nullable: true })
  medicamentosActuales: string;

  @Column({ type: 'text' })
  examenFisico: string;

  @Column({ type: 'text', nullable: true })
  signosVitales: string; // JSON string con presión, pulso, temperatura, etc.

  @Column({ type: 'text' })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  diagnosticoDiferencial: string;

  @Column({ type: 'text' })
  tratamiento: string;

  @Column({ type: 'text', nullable: true })
  examenesSolicitados: string;

  @Column({ type: 'text', nullable: true })
  interconsultas: string;

  @Column({ type: 'text', nullable: true })
  recomendaciones: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'date', nullable: true })
  proximaConsulta: Date;

  @CreateDateColumn({ name: 'fecha_consulta' })
  fechaConsulta: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
