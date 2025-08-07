import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseIntPipe, HttpException, HttpStatus, Query, NotFoundException } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pacientes')
@UseGuards(JwtAuthGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  async obtenerTodosLosPacientes(@Request() req) {
    const usuario = req.user;

    // Solo administradores y doctores pueden ver todos los pacientes
    if (!['admin', 'doctor'].includes(usuario.rol.nombre)) {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.pacientesService.obtenerTodosLosPacientes();
  }

  @Get('mis-pacientes')
  async obtenerMisPacientes(@Request() req) {
    const usuario = req.user;

    if (usuario.rol.nombre !== 'doctor') {
      throw new HttpException('Solo los doctores pueden ver sus pacientes', HttpStatus.BAD_REQUEST);
    }

    return await this.pacientesService.obtenerPacientesPorDoctor(usuario.id);
  }

  @Get('mi-perfil')
  async obtenerMiPerfil(@Request() req) {
    const usuario = req.user;
    
    console.log('=== OBTENER MI PERFIL ===');
    console.log('Usuario:', {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol?.nombre
    });

    if (usuario.rol.nombre !== 'paciente') {
      console.log('Error: Usuario no es paciente');
      throw new HttpException('Solo los pacientes tienen perfil de paciente', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log('Intentando obtener perfil completo...');
      const perfil = await this.pacientesService.obtenerPacienteCompleto(usuario.id);
      console.log('Perfil obtenido exitosamente:', perfil);
      return perfil;
    } catch (error) {
      console.log('Error al obtener perfil:', error.message);
      if (error instanceof NotFoundException) {
        console.log('Perfil no encontrado, devolviendo estructura básica');
        // Si no existe perfil de paciente, devolver estructura básica
        const perfilBasico = {
          usuarioId: usuario.id,
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono
          }
        };
        console.log('Perfil básico:', perfilBasico);
        return perfilBasico;
      }
      console.log('Error no controlado, relanzando:', error);
      throw error;
    }
  }

  @Get('buscar')
  async buscarPaciente(@Query('identificacion') identificacion: string, @Request() req) {
    const usuario = req.user;

    // Solo administradores y doctores pueden buscar pacientes
    if (!['admin', 'doctor'].includes(usuario.rol.nombre)) {
      throw new HttpException('No tienes permisos para buscar pacientes', HttpStatus.FORBIDDEN);
    }

    if (!identificacion) {
      throw new HttpException('Número de identificación requerido', HttpStatus.BAD_REQUEST);
    }

    const paciente = await this.pacientesService.buscarPacientePorIdentificacion(identificacion);

    if (!paciente) {
      throw new HttpException('Paciente no encontrado', HttpStatus.NOT_FOUND);
    }

    return paciente;
  }

  @Get('estadisticas')
  async obtenerEstadisticas(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver estadísticas
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver estadísticas', HttpStatus.FORBIDDEN);
    }

    return await this.pacientesService.obtenerEstadisticasPacientes();
  }

  @Get('usuario/:id')
  async obtenerPacientePorUsuario(@Param('id', ParseIntPipe) usuarioId: number, @Request() req) {
    const usuario = req.user;

    // Los pacientes solo pueden ver su propia información
    if (usuario.rol.nombre === 'paciente' && usuarioId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.pacientesService.obtenerPorUsuarioId(usuarioId);
  }

  @Post()
  async crearPaciente(@Body() pacienteData: any, @Request() req) {
    const usuario = req.user;

    // Solo admins pueden crear perfiles para otros usuarios
    if (usuario.rol.nombre !== 'admin' && pacienteData.usuarioId !== usuario.id) {
      throw new HttpException('No tienes permisos para crear este perfil', HttpStatus.FORBIDDEN);
    }

    return await this.pacientesService.crearPaciente(pacienteData);
  }

  @Patch('mi-perfil')
  async actualizarMiPerfil(@Body() actualizarData: any, @Request() req) {
    const usuario = req.user;

    console.log('=== ACTUALIZAR MI PERFIL ===');
    console.log('Usuario ID:', usuario.id);
    console.log('Datos recibidos:', JSON.stringify(actualizarData, null, 2));

    if (usuario.rol.nombre !== 'paciente') {
      throw new HttpException('Solo los pacientes pueden actualizar su perfil', HttpStatus.BAD_REQUEST);
    }

    // Separar datos de usuario y datos de paciente
    const { usuario: datosUsuario, ...datosPaciente } = actualizarData;
    console.log('Datos usuario:', datosUsuario);
    console.log('Datos paciente:', datosPaciente);

    // Verificar si existe perfil de paciente, si no, crearlo
    const existe = await this.pacientesService.verificarPacienteExiste(usuario.id);

    if (!existe) {
      const datosBasicos = {
        usuarioId: usuario.id,
        ...datosPaciente
      };
      await this.pacientesService.crearPaciente(datosBasicos);
    } else {
      // Actualizar datos del paciente
      if (Object.keys(datosPaciente).length > 0) {
        await this.pacientesService.actualizarPaciente(usuario.id, datosPaciente);
      }
    }

    // Actualizar datos del usuario si se proporcionaron
    if (datosUsuario && Object.keys(datosUsuario).length > 0) {
      await this.pacientesService.actualizarDatosUsuario(usuario.id, datosUsuario);
    }

    // Retornar el perfil actualizado
    return await this.pacientesService.obtenerPacienteCompleto(usuario.id);
  }

  @Patch('usuario/:id')
  async actualizarPaciente(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Body() actualizarData: any,
    @Request() req
  ) {
    const usuario = req.user;

    // Los pacientes solo pueden actualizar su propia información, admins pueden actualizar todas
    if (usuario.rol.nombre === 'paciente' && usuarioId !== usuario.id) {
      throw new HttpException('No tienes permisos para actualizar esta información', HttpStatus.FORBIDDEN);
    }

    return await this.pacientesService.actualizarPaciente(usuarioId, actualizarData);
  }

  @Patch('usuario/:id/primera-consulta')
  async marcarPrimeraConsultaCompleta(@Param('id', ParseIntPipe) usuarioId: number, @Request() req) {
    const usuario = req.user;

    // Solo doctores pueden marcar primera consulta como completa
    if (usuario.rol.nombre !== 'doctor') {
      throw new HttpException('Solo los doctores pueden realizar esta acción', HttpStatus.FORBIDDEN);
    }

    await this.pacientesService.marcarPrimeraConsultaCompleta(usuarioId);
    return { message: 'Primera consulta marcada como completa' };
  }

  // Endpoint temporal para crear pacientes de prueba
  @Post('crear-pacientes-prueba')
  async crearPacientesPrueba(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden crear pacientes de prueba
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('Solo los administradores pueden crear pacientes de prueba', HttpStatus.FORBIDDEN);
    }

    return await this.pacientesService.crearPacientesPrueba();
  }
}
