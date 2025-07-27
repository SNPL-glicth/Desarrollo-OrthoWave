import { Controller, Get, Put, Post, Delete, Patch, Body, UseGuards, Request, Param, ParseIntPipe, HttpException, HttpStatus, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { CrearUsuarioSimpleDto } from './dto/crear-usuario-simple.dto';
import { RegisterPatientSimpleDto } from '../auth/dto/register-patient-simple.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersRepository.findOne({
      where: { id: req.user.sub },
      relations: ['rol'],
    });
    if (!user) throw new Error('Usuario no encontrado');
    const { password, ...userData } = user;
    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() updateData: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id: req.user.sub } });
    if (!user) throw new Error('Usuario no encontrado');
    // Solo permitir actualizar ciertos campos
    user.nombre = updateData.nombre || user.nombre;
    user.apellido = updateData.apellido || user.apellido;
    user.telefono = updateData.telefono || user.telefono;
    user.direccion = updateData.direccion || user.direccion;
    await this.usersRepository.save(user);
    const { password, ...userData } = user;
    return userData;
  }

  // Nuevas funcionalidades para administradores

  @UseGuards(JwtAuthGuard)
  @Post('admin/crear-usuario')
  async crearUsuarioAdmin(@Body() crearUsuarioDto: CrearUsuarioAdminDto, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden crear usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para crear usuarios', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.crearUsuarioAdmin(crearUsuarioDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/crear-usuario-simple')
  async crearUsuarioSimple(@Body() crearUsuarioDto: CrearUsuarioSimpleDto, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden crear usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para crear usuarios', HttpStatus.FORBIDDEN);
    }

    // Convertir a CrearUsuarioAdminDto completo
    const fullDto: CrearUsuarioAdminDto = {
      ...crearUsuarioDto,
      apellido: '', // Se puede completar después
    };

    return await this.usersService.crearUsuarioAdmin(fullDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/crear-paciente')
  async crearPacienteAdmin(@Body() crearPacienteDto: RegisterPatientSimpleDto, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden crear pacientes
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para crear pacientes', HttpStatus.FORBIDDEN);
    }

    // Crear paciente directamente sin verificación por email
    return await this.usersService.crearPacienteSinVerificacion(crearPacienteDto);
  }

  // Endpoint público para crear usuarios sin autenticación (para uso del administrador)
  @Post('public/crear-usuario')
  async crearUsuarioPublico(@Body() crearUsuarioDto: CrearUsuarioAdminDto) {
    return await this.usersService.crearUsuarioAdmin(crearUsuarioDto);
  }

  // Endpoint público para obtener roles
  @Get('public/roles')
  async obtenerRoles() {
    return await this.usersService.obtenerRoles();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async obtenerTodosLosUsuarios(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver todos los usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.obtenerTodosLosUsuarios();
  }


  @UseGuards(JwtAuthGuard)
  @Get('admin/todos')
  async obtenerTodosLosUsuariosLegacy(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver todos los usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.obtenerTodosLosUsuarios();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/por-rol/:rol')
  async obtenerUsuariosPorRol(@Param('rol') rol: string, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden filtrar usuarios por rol
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.obtenerUsuariosPorRol(rol);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/buscar')
  async buscarUsuarios(@Query('termino') termino: string, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden buscar usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para realizar búsquedas', HttpStatus.FORBIDDEN);
    }

    if (!termino) {
      throw new HttpException('Término de búsqueda requerido', HttpStatus.BAD_REQUEST);
    }

    return await this.usersService.buscarUsuarios(termino);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/estadisticas')
  async obtenerEstadisticasUsuarios(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver estadísticas
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver estadísticas', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.obtenerEstadisticasUsuarios();
  }

  // IMPORTANT: This route must come AFTER all specific /admin/* routes
  // to avoid conflicts with parameterized routes like /admin/:id
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  async obtenerUsuarioPorId(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver detalles de cualquier usuario
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.obtenerUsuarioPorId(id);
  }


  @UseGuards(JwtAuthGuard)
  @Put('admin/:id')
  async cambiarEstadoUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
    @Request() req
  ) {
    const usuario = req.user;

    // Solo administradores pueden cambiar estado de usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para cambiar el estado de usuarios', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.cambiarEstadoUsuario(id, activo);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/status')
  async cambiarEstadoUsuarioPatch(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVerified') isVerified: boolean,
    @Request() req
  ) {
    const usuario = req.user;

    // Solo administradores pueden cambiar estado de usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para cambiar el estado de usuarios', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.cambiarEstadoUsuario(id, isVerified);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async eliminarUsuario(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden eliminar usuarios
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para eliminar usuarios', HttpStatus.FORBIDDEN);
    }

    // No permitir que el admin se elimine a sí mismo
    if (id === usuario.id) {
      throw new HttpException('No puedes eliminarte a ti mismo', HttpStatus.BAD_REQUEST);
    }

    await this.usersService.eliminarUsuario(id);
    return { message: 'Usuario eliminado exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verificar-email/:email')
  async verificarEmailDisponible(@Param('email') email: string) {
    const disponible = await this.usersService.verificarEmailDisponible(email);
    return { disponible };
  }
}
