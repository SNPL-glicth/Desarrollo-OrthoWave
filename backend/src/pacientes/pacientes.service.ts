import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async crearPaciente(pacienteData: Partial<Paciente>): Promise<Paciente> {
    const paciente = this.pacientesRepository.create(pacienteData);
    return await this.pacientesRepository.save(paciente);
  }

  async obtenerPorUsuarioId(usuarioId: number): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne({
      where: { usuarioId },
      relations: ['usuario']
    });

    if (!paciente) {
      throw new NotFoundException('Información de paciente no encontrada');
    }

    return paciente;
  }

  async actualizarPaciente(usuarioId: number, actualizarData: Partial<Paciente>): Promise<Paciente> {
    const paciente = await this.obtenerPorUsuarioId(usuarioId);
    Object.assign(paciente, actualizarData);
    return await this.pacientesRepository.save(paciente);
  }

  async obtenerTodosLosPacientes(): Promise<any[]> {
    // Obtener todos los usuarios con rol de paciente
    const usuarios = await this.usersRepository.find({
      where: { 
        rol: { nombre: 'paciente' },
        isVerified: true 
      },
      relations: ['rol'],
      select: ['id', 'nombre', 'apellido', 'email', 'telefono'],
      order: { id: 'DESC' }
    });

    return usuarios;
  }

  async buscarPacientePorIdentificacion(numeroIdentificacion: string): Promise<Paciente | null> {
    return await this.pacientesRepository.findOne({
      where: { numeroIdentificacion },
      relations: ['usuario']
    });
  }

  async obtenerPacientesPorDoctor(doctorId: number): Promise<User[]> {
    // Obtener pacientes que han tenido citas con este doctor
    const query = this.usersRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.rol', 'rol')
      .leftJoin('citas', 'cita', 'cita.pacienteId = usuario.id')
      .where('rol.nombre = :rol', { rol: 'paciente' })
      .andWhere('cita.doctorId = :doctorId', { doctorId })
      .groupBy('usuario.id')
      .select(['usuario.id', 'usuario.nombre', 'usuario.apellido', 'usuario.email', 'usuario.telefono']);

    return await query.getMany();
  }

  async verificarPacienteExiste(usuarioId: number): Promise<boolean> {
    const count = await this.pacientesRepository.count({
      where: { usuarioId }
    });
    return count > 0;
  }

  async marcarPrimeraConsultaCompleta(usuarioId: number): Promise<void> {
    await this.pacientesRepository.update(
      { usuarioId },
      { primeraConsulta: false }
    );
  }

  async obtenerEstadisticasPacientes() {
    const total = await this.pacientesRepository.count({ where: { activo: true } });
    const nuevos = await this.pacientesRepository.count({
      where: {
        activo: true,
        primeraConsulta: true
      }
    });

    return {
      total,
      nuevos,
      regulares: total - nuevos
    };
  }

  async crearPacientesPrueba(): Promise<void> {
    const pacientesPrueba = [
      { usuarioId: 1, activo: true, primeraConsulta: true, numeroIdentificacion: '0001', fechaRegistro: new Date() },
      { usuarioId: 2, activo: true, primeraConsulta: false, numeroIdentificacion: '0002', fechaRegistro: new Date() },
    ];

    for (const pacienteData of pacientesPrueba) {
      const paciente = this.pacientesRepository.create(pacienteData);
      await this.pacientesRepository.save(paciente);
    }
  }
}
