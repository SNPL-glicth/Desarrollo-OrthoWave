import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { RegisterPatientSimpleDto } from '../auth/dto/register-patient-simple.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeWebSocketGateway } from '../websocket/websocket.gateway';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => RealtimeWebSocketGateway))
    private websocketGateway: RealtimeWebSocketGateway,
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

    // Si es un paciente, crear notificación para completar perfil
    if (rol.nombre === 'paciente') {
      try {
        this.logger.log(`Creando notificación para paciente creado por admin: ${usuarioGuardado.email} (ID: ${usuarioGuardado.id})`);
        await this.notificationsService.crearNotificacionCompletarPerfil(usuarioGuardado.id);
        this.logger.log(`Notificación creada exitosamente para paciente: ${usuarioGuardado.email}`);
      } catch (notificationError) {
        this.logger.error(`Error al crear notificación para paciente ${usuarioGuardado.email}:`, notificationError.message);
        // No fallar la creación del usuario por error de notificación
      }
    }

    // Emitir eventos WebSocket CRÍTICOS SOLAMENTE
    try {
      // Solo notificar si es un doctor (importante para pacientes)
      if (rol.nombre === 'doctor') {
        this.websocketGateway.notifyNewUserRegistered({
          id: usuarioGuardado.id,
          email: usuarioGuardado.email,
          nombre: usuarioGuardado.nombre,
          apellido: usuarioGuardado.apellido,
          rol: rol.nombre
        });
      }
      
    } catch (error) {
      this.logger.error('Error al enviar eventos WebSocket críticos para nuevo usuario:', error);
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

    // Crear notificación para completar perfil del paciente
    try {
      this.logger.log(`Creando notificación para paciente simple creado por admin: ${usuarioGuardado.email} (ID: ${usuarioGuardado.id})`);
      await this.notificationsService.crearNotificacionCompletarPerfil(usuarioGuardado.id);
      this.logger.log(`Notificación creada exitosamente para paciente: ${usuarioGuardado.email}`);
    } catch (notificationError) {
      this.logger.error(`Error al crear notificación para paciente ${usuarioGuardado.email}:`, notificationError.message);
      // No fallar la creación del usuario por error de notificación
    }

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

    // Solo notificar actualización crítica de perfil (opcional, podría eliminarse)
    try {
      // Solo notificar al usuario mismo sobre su actualización
      this.websocketGateway.notifyUserUpdate(id, 'profile_update');
      
    } catch (error) {
      this.logger.error('Error al enviar evento WebSocket crítico para actualización de usuario:', error);
    }

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

    this.logger.log(`Iniciando eliminación del usuario ID: ${id} (${usuario.email})`);

    try {
      // Usar transacción para asegurar consistencia
      await this.usersRepository.manager.transaction(async transactionalEntityManager => {
        
        // 1. Eliminar notificaciones asociadas
        await transactionalEntityManager.query(
          'DELETE FROM notificaciones WHERE usuario_id = ?', 
          [id]
        );
        this.logger.log(`Notificaciones eliminadas para usuario ID: ${id}`);

        // 2. Eliminar citas donde el usuario es paciente
        await transactionalEntityManager.query(
          'DELETE FROM citas WHERE paciente_id = ?', 
          [id]
        );
        this.logger.log(`Citas como paciente eliminadas para usuario ID: ${id}`);

        // 3. Eliminar citas donde el usuario es doctor
        await transactionalEntityManager.query(
          'DELETE FROM citas WHERE doctor_id = ?', 
          [id]
        );
        this.logger.log(`Citas como doctor eliminadas para usuario ID: ${id}`);

        // 4. Obtener ID del perfil de paciente si existe (antes de eliminarlo)
        const pacienteResult = await transactionalEntityManager.query(
          'SELECT id FROM pacientes WHERE usuario_id = ?', 
          [id]
        );
        const pacienteId = pacienteResult.length > 0 ? pacienteResult[0].id : null;

        // 5. Eliminar documentos de paciente si existen (usando el pacienteId obtenido)
        if (pacienteId) {
          await transactionalEntityManager.query(
            'DELETE FROM patient_documents WHERE patient_id = ?', 
            [pacienteId]
          );
          this.logger.log(`Documentos de paciente eliminados para usuario ID: ${id}`);
        }

        // 6. Eliminar perfil médico si existe
        await transactionalEntityManager.query(
          'DELETE FROM perfiles_medicos WHERE usuario_id = ?', 
          [id]
        );
        this.logger.log(`Perfil médico eliminado para usuario ID: ${id}`);

        // 7. Eliminar perfil de paciente si existe
        await transactionalEntityManager.query(
          'DELETE FROM pacientes WHERE usuario_id = ?', 
          [id]
        );
        this.logger.log(`Perfil de paciente eliminado para usuario ID: ${id}`);

        // 8. Finalmente, eliminar el usuario
        await transactionalEntityManager.query(
          'DELETE FROM usuarios WHERE id = ?', 
          [id]
        );
        this.logger.log(`Usuario eliminado exitosamente: ID ${id} (${usuario.email})`);
      });

    } catch (error) {
      this.logger.error(`Error al eliminar usuario ID: ${id} (${usuario.email}):`, error.message);
      throw new Error(`Error al eliminar el usuario: ${error.message}`);
    }
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
    
    // Contar solo usuarios verificados para consistencia con la tabla del dashboard
    const admins = await this.usersRepository.count({
      where: { 
        rol: { nombre: 'admin' },
        isVerified: true 
      },
      relations: ['rol']
    });
    const doctores = await this.usersRepository.count({
      where: { 
        rol: { nombre: 'doctor' },
        isVerified: true 
      },
      relations: ['rol']
    });
    const pacientes = await this.usersRepository.count({
      where: { 
        rol: { nombre: 'paciente' },
        isVerified: true 
      },
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

  async obtenerDoctores(): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.rol', 'rol')
      .leftJoinAndSelect('user.perfilMedico', 'perfilMedico')
      .where('rol.nombre = :rolNombre', { rolNombre: 'doctor' })
      .andWhere('user.isVerified = :verified', { verified: true })
      .select([
        'user.id',
        'user.nombre', 
        'user.apellido', 
        'user.email',
        'user.telefono',
        'rol.id',
        'rol.nombre',
        'perfilMedico.especialidad',
        'perfilMedico.biografia',
        'perfilMedico.añoGraduacion'
      ])
      .orderBy('user.nombre', 'ASC')
      .getMany();
  }

  async obtenerRoles(): Promise<Role[]> {
    return await this.rolesRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }
}
