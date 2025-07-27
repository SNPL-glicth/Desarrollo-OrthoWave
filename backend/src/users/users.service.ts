import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { RegisterPatientSimpleDto } from '../auth/dto/register-patient-simple.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async crearUsuarioAdmin(crearUsuarioDto: CrearUsuarioAdminDto): Promise<User> {
    // Verificar que el email no esté en uso
    const usuarioExistente = await this.usersRepository.findOne({
      where: { email: crearUsuarioDto.email }
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está en uso');
    }

    // Verificar que el rol existe
    const rol = await this.rolesRepository.findOne({
      where: { id: crearUsuarioDto.rolId }
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(crearUsuarioDto.password, 12);

    // Crear el usuario
    const nuevoUsuario = this.usersRepository.create({
      email: crearUsuarioDto.email,
      password: hashedPassword,
      nombre: crearUsuarioDto.nombre,
      apellido: crearUsuarioDto.apellido,
      telefono: crearUsuarioDto.telefono,
      direccion: crearUsuarioDto.direccion,
      rolId: crearUsuarioDto.rolId,
      isVerified: true, // Los usuarios creados por admin están verificados automáticamente
      verificationCode: null
    });

    const usuarioGuardado = await this.usersRepository.save(nuevoUsuario);

    // Crear perfil específico según el rol
    if (rol.nombre === 'doctor' && crearUsuarioDto.perfilMedico) {
      await this.perfilMedicoRepository.save({
        usuarioId: usuarioGuardado.id,
        ...crearUsuarioDto.perfilMedico
      });
    } else if (rol.nombre === 'paciente' && crearUsuarioDto.perfilPaciente) {
      await this.pacientesRepository.save({
        usuarioId: usuarioGuardado.id,
        ...crearUsuarioDto.perfilPaciente,
        fechaNacimiento: new Date(crearUsuarioDto.perfilPaciente.fechaNacimiento)
      });
    }

    // Retornar usuario sin contraseña
    const { password, ...userData } = usuarioGuardado;
    return userData as User;
  }

  async crearPacienteSinVerificacion(crearPacienteDto: RegisterPatientSimpleDto): Promise<User> {
    // Verificar que el email no esté en uso
    const usuarioExistente = await this.usersRepository.findOne({
      where: { email: crearPacienteDto.email }
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está en uso');
    }

    // Obtener rol de paciente
    const rolPaciente = await this.rolesRepository.findOne({
      where: { nombre: 'paciente' }
    });

    if (!rolPaciente) {
      throw new NotFoundException('Rol de paciente no encontrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(crearPacienteDto.password, 12);

    // Crear el paciente
    const nuevoPaciente = this.usersRepository.create({
      email: crearPacienteDto.email,
      password: hashedPassword,
      nombre: crearPacienteDto.nombre,
      apellido: '', // Se puede completar después en el perfil
      telefono: crearPacienteDto.telefono,
      rolId: rolPaciente.id,
      isVerified: true, // Pacientes creados por admin están verificados automáticamente
      verificationCode: null
    });

    const usuarioGuardado = await this.usersRepository.save(nuevoPaciente);

    // Retornar usuario sin contraseña
    const { password, ...userData } = usuarioGuardado;
    return {
      ...userData,
      rol: rolPaciente,
      message: 'Paciente creado exitosamente sin verificación por email'
    } as any;
  }

  async obtenerTodosLosUsuarios(): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.rol', 'rol')
      .where('rol.nombre != :adminRole', { adminRole: 'admin' })
      .orderBy('user.fechaCreacion', 'DESC')
      .select([
        'user.id',
        'user.email', 
        'user.nombre', 
        'user.apellido', 
        'user.telefono', 
        'user.direccion', 
        'user.isVerified', 
        'user.fechaCreacion',
        'rol.id',
        'rol.nombre'
      ])
      .getMany();
  }

  async obtenerUsuariosPorRol(rolNombre: string): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.rol', 'rol')
      .where('rol.nombre = :rolNombre', { rolNombre })
      .select(['user.id', 'user.email', 'user.nombre', 'user.apellido', 'user.telefono', 'user.isVerified', 'user.fechaCreacion'])
      .getMany();
  }

  async obtenerCuentasPendientes(): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.rol', 'rol')
      .where('user.approvalStatus = :status', { status: 'pending' })
      .andWhere('user.isVerified = :verified', { verified: true })
      .orderBy('user.fechaCreacion', 'DESC')
      .select([
        'user.id',
        'user.email', 
        'user.nombre', 
        'user.apellido', 
        'user.telefono', 
        'user.fechaCreacion',
        'user.approvalStatus',
        'user.isApproved',
        'rol.id',
        'rol.nombre'
      ])
      .getMany();
  }

  async aprobarCuenta(id: number, adminId: number): Promise<User> {
    const usuario = await this.obtenerUsuarioPorId(id);

    if (usuario.approvalStatus !== 'pending') {
      throw new ConflictException('La cuenta ya tiene un estado definitivo.');
    }

    usuario.isApproved = true;
    usuario.approvalStatus = 'approved';
    usuario.approvedBy = adminId;
    usuario.approvalDate = new Date();

    const usuarioActualizado = await this.usersRepository.save(usuario);

    const { password, ...userData } = usuarioActualizado;
    return userData as User;
  }

  async rechazarCuenta(id: number, adminId: number, razon: string): Promise<User> {
    const usuario = await this.obtenerUsuarioPorId(id);

    if (usuario.approvalStatus !== 'pending') {
      throw new ConflictException('La cuenta ya tiene un estado definitivo.');
    }

    usuario.isApproved = false;
    usuario.approvalStatus = 'rejected';
    usuario.rejectionReason = razon;

    const usuarioActualizado = await this.usersRepository.save(usuario);

    const { password, ...userData } = usuarioActualizado;
    return userData as User;
  }

  async obtenerUsuarioPorId(id: number): Promise<User> {
    const usuario = await this.usersRepository.findOne({
      where: { id },
      relations: ['rol'],
      select: [
        'id', 
        'email', 
        'nombre', 
        'apellido', 
        'telefono', 
        'direccion', 
        'isVerified', 
        'fechaCreacion',
        'isApproved',
        'approvalStatus',
        'approvedBy',
        'approvalDate',
        'rejectionReason'
      ]
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizarUsuario(id: number, actualizarData: Partial<User>): Promise<User> {
    const usuario = await this.obtenerUsuarioPorId(id);

    // Si se incluye contraseña, hashearla
    if (actualizarData.password) {
      actualizarData.password = await bcrypt.hash(actualizarData.password, 12);
    }

    Object.assign(usuario, actualizarData);
    const usuarioActualizado = await this.usersRepository.save(usuario);

    const { password, ...userData } = usuarioActualizado;
    return userData as User;
  }

  async cambiarEstadoUsuario(id: number, activo: boolean): Promise<User> {
    const usuario = await this.obtenerUsuarioPorId(id);

    // Para "desactivar" usuarios, podemos usar isVerified o crear un campo activo
    usuario.isVerified = activo;
    const usuarioActualizado = await this.usersRepository.save(usuario);

    const { password, ...userData } = usuarioActualizado;
    return userData as User;
  }

  async eliminarUsuario(id: number): Promise<void> {
    const usuario = await this.obtenerUsuarioPorId(id);

    // En lugar de eliminar completamente, marcamos como inactivo
    usuario.isVerified = false;
    await this.usersRepository.save(usuario);
  }

  async buscarUsuarios(termino: string): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.rol', 'rol')
      .where('rol.nombre != :adminRole', { adminRole: 'admin' })
      .andWhere('(user.nombre LIKE :termino OR user.apellido LIKE :termino OR user.email LIKE :termino)', { termino: `%${termino}%` })
      .select([
        'user.id', 
        'user.email', 
        'user.nombre', 
        'user.apellido', 
        'user.telefono', 
        'user.isVerified',
        'rol.id',
        'rol.nombre'
      ])
      .getMany();
  }

  async obtenerEstadisticasUsuarios() {
    const total = await this.usersRepository.count();
    const verificados = await this.usersRepository.count({ where: { isVerified: true } });
    const admins = await this.usersRepository.count({
      where: { rol: { nombre: 'admin' } },
      relations: ['rol']
    });
    const doctores = await this.usersRepository.count({
      where: { rol: { nombre: 'doctor' } },
      relations: ['rol']
    });
    const pacientes = await this.usersRepository.count({
      where: { rol: { nombre: 'paciente' } },
      relations: ['rol']
    });

    return {
      total,
      verificados,
      noVerificados: total - verificados,
      distribuciones: {
        admins,
        doctores,
        pacientes
      }
    };
  }

  async verificarEmailDisponible(email: string): Promise<boolean> {
    const count = await this.usersRepository.count({ where: { email } });
    return count === 0;
  }

  async obtenerRoles(): Promise<Role[]> {
    return await this.rolesRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }
}
