import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { HistoriaClinica } from './entities/historia-clinica.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class HistoriaClinicaService {
  constructor(
    @InjectRepository(HistoriaClinica)
    private historiaClinicaRepository: Repository<HistoriaClinica>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async crearHistoriaClinica(historiaData: Partial<HistoriaClinica>): Promise<HistoriaClinica> {
    const historia = this.historiaClinicaRepository.create(historiaData);
    return await this.historiaClinicaRepository.save(historia);
  }

  async obtenerHistoriaPorPaciente(pacienteId: number): Promise<HistoriaClinica[]> {
    return await this.historiaClinicaRepository.find({
      where: { pacienteId },
      relations: ['doctor', 'cita'],
      order: { fechaConsulta: 'DESC' }
    });
  }

  async obtenerHistoriaPorDoctor(doctorId: number): Promise<HistoriaClinica[]> {
    return await this.historiaClinicaRepository.find({
      where: { doctorId },
      relations: ['paciente', 'cita'],
      order: { fechaConsulta: 'DESC' }
    });
  }

  async obtenerHistoriaPorId(id: number): Promise<HistoriaClinica> {
    const historia = await this.historiaClinicaRepository.findOne({
      where: { id },
      relations: ['paciente', 'doctor', 'cita']
    });

    if (!historia) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    return historia;
  }

  async actualizarHistoriaClinica(id: number, actualizarData: Partial<HistoriaClinica>): Promise<HistoriaClinica> {
    const historia = await this.obtenerHistoriaPorId(id);
    Object.assign(historia, actualizarData);
    return await this.historiaClinicaRepository.save(historia);
  }

  async eliminarHistoriaClinica(id: number): Promise<void> {
    const historia = await this.obtenerHistoriaPorId(id);
    await this.historiaClinicaRepository.remove(historia);
  }

  async obtenerUltimaConsultaPaciente(pacienteId: number, doctorId?: number): Promise<HistoriaClinica | null> {
    const whereClause: any = { pacienteId };
    if (doctorId) {
      whereClause.doctorId = doctorId;
    }

    return await this.historiaClinicaRepository.findOne({
      where: whereClause,
      relations: ['doctor', 'cita'],
      order: { fechaConsulta: 'DESC' }
    });
  }

  async verificarAccesoHistoria(historiaId: number, usuarioId: number, rolUsuario: string): Promise<boolean> {
    const historia = await this.obtenerHistoriaPorId(historiaId);

    // Administradores tienen acceso completo
    if (rolUsuario === 'admin') {
      return true;
    }

    // Doctores solo pueden acceder a historias que ellos crearon
    if (rolUsuario === 'doctor' && historia.doctorId === usuarioId) {
      return true;
    }

    // Pacientes solo pueden acceder a su propia historia
    if (rolUsuario === 'paciente' && historia.pacienteId === usuarioId) {
      return true;
    }

    return false;
  }

  async buscarHistoriasPorDiagnostico(diagnostico: string): Promise<HistoriaClinica[]> {
    return await this.historiaClinicaRepository
      .createQueryBuilder('historia')
      .leftJoinAndSelect('historia.paciente', 'paciente')
      .leftJoinAndSelect('historia.doctor', 'doctor')
      .where('historia.diagnostico LIKE :diagnostico', { diagnostico: `%${diagnostico}%` })
      .orderBy('historia.fechaConsulta', 'DESC')
      .getMany();
  }

  async obtenerEstadisticasHistorias() {
    const total = await this.historiaClinicaRepository.count();
    const ultimoMes = new Date();
    ultimoMes.setMonth(ultimoMes.getMonth() - 1);

    const recientes = await this.historiaClinicaRepository.count({
      where: {
        fechaConsulta: MoreThanOrEqual(ultimoMes)
      }
    });

    return {
      total,
      recientes,
      promedioPorMes: Math.round(recientes)
    };
  }
}
