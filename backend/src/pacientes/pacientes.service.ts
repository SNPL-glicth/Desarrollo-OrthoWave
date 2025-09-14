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

  // Método privado para calcular la edad
  private calcularEdad(fechaNacimiento: Date): number {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

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

  async obtenerPacienteCompleto(usuarioId: number): Promise<Paciente & { edad?: number }> {
    const paciente = await this.obtenerPorUsuarioId(usuarioId);
    
    // Calcular edad si existe fecha de nacimiento
    const pacienteCompleto = { ...paciente } as Paciente & { edad?: number };
    if (paciente.fechaNacimiento) {
      pacienteCompleto.edad = this.calcularEdad(paciente.fechaNacimiento);
    }

    return pacienteCompleto;
  }

  async actualizarPaciente(usuarioId: number, actualizarData: Partial<Paciente>): Promise<Paciente> {
    const paciente = await this.obtenerPorUsuarioId(usuarioId);
    Object.assign(paciente, actualizarData);
    return await this.pacientesRepository.save(paciente);
  }

  async actualizarDatosUsuario(usuarioId: number, datosUsuario: Partial<User>): Promise<User> {
    console.log('=== ACTUALIZAR DATOS USUARIO ===');
    console.log('Usuario ID:', usuarioId);
    console.log('Datos a actualizar:', datosUsuario);
    
    const usuario = await this.usersRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    console.log('Usuario encontrado:', {
      id: usuario.id,
      nombre: usuario.nombre,
      telefono: usuario.telefono
    });
    
    Object.assign(usuario, datosUsuario);
    
    console.log('Usuario después de assign:', {
      id: usuario.id,
      nombre: usuario.nombre,
      telefono: usuario.telefono
    });
    
    const resultado = await this.usersRepository.save(usuario);
    console.log('Usuario guardado:', {
      id: resultado.id,
      nombre: resultado.nombre,
      telefono: resultado.telefono
    });
    
    return resultado;
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

  async obtenerPacientesPorDoctor(doctorId: number): Promise<any[]> {
    // Obtener todos los pacientes verificados (sin importar estado de aprobación)
    const pacientesUsuarios = await this.usersRepository.find({
      where: { 
        rol: { nombre: 'paciente' },
        isVerified: true
      },
      relations: ['rol'],
      select: ['id', 'nombre', 'apellido', 'email', 'telefono'],
      order: { id: 'DESC' }
    });

    // Para cada paciente, obtener información adicional del perfil de paciente
    const pacientesCompletos = [];
    for (const usuario of pacientesUsuarios) {
      try {
        const perfilPaciente = await this.pacientesRepository.findOne({
          where: { usuarioId: usuario.id },
          select: ['id', 'fechaNacimiento', 'eps', 'tipoAfiliacion']
        });

        const pacienteCompleto = {
          id: perfilPaciente?.id || null, // ID de la tabla pacientes
          usuarioId: usuario.id, // ID de la tabla usuarios
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          telefono: usuario.telefono,
          fechaNacimiento: perfilPaciente?.fechaNacimiento,
          edad: perfilPaciente?.fechaNacimiento ? this.calcularEdad(perfilPaciente.fechaNacimiento) : null,
          eps: perfilPaciente?.eps,
          tipoAfiliacion: perfilPaciente?.tipoAfiliacion
        };

        pacientesCompletos.push(pacienteCompleto);
      } catch (error) {
        // Si no tiene perfil de paciente, agregar solo la información básica
        pacientesCompletos.push({
          id: null, // No hay ID de paciente
          usuarioId: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          telefono: usuario.telefono,
          fechaNacimiento: null,
          edad: null,
          eps: null,
          tipoAfiliacion: null
        });
      }
    }

    return pacientesCompletos;
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
