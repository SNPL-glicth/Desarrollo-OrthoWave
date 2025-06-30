import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, HttpException, HttpStatus, Query } from '@nestjs/common';
import { HistoriaClinicaService } from './historia-clinica.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('historia-clinica')
@UseGuards(JwtAuthGuard)
export class HistoriaClinicaController {
  constructor(private readonly historiaClinicaService: HistoriaClinicaService) {}

  @Post()
  async crearHistoriaClinica(@Body() historiaData: any, @Request() req) {
    const usuario = req.user;

    // Solo doctores pueden crear historias clínicas
    if (usuario.rol.nombre !== 'doctor') {
      throw new HttpException('Solo los doctores pueden crear historias clínicas', HttpStatus.FORBIDDEN);
    }

    // El doctor debe ser quien crea la historia
    historiaData.doctorId = usuario.id;

    return await this.historiaClinicaService.crearHistoriaClinica(historiaData);
  }

  @Get('paciente/:id')
  async obtenerHistoriaPorPaciente(@Param('id', ParseIntPipe) pacienteId: number, @Request() req) {
    const usuario = req.user;

    // Los pacientes solo pueden ver su propia historia
    if (usuario.rol.nombre === 'paciente' && pacienteId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver esta historia clínica', HttpStatus.FORBIDDEN);
    }

    return await this.historiaClinicaService.obtenerHistoriaPorPaciente(pacienteId);
  }

  @Get('doctor/:id')
  async obtenerHistoriaPorDoctor(@Param('id', ParseIntPipe) doctorId: number, @Request() req) {
    const usuario = req.user;

    // Los doctores solo pueden ver sus propias historias, admins pueden ver todas
    if (usuario.rol.nombre === 'doctor' && doctorId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver estas historias clínicas', HttpStatus.FORBIDDEN);
    }

    return await this.historiaClinicaService.obtenerHistoriaPorDoctor(doctorId);
  }

  @Get('mi-historia')
  async obtenerMiHistoria(@Request() req) {
    const usuario = req.user;

    if (usuario.rol.nombre !== 'paciente') {
      throw new HttpException('Solo los pacientes pueden ver su historia clínica', HttpStatus.BAD_REQUEST);
    }

    return await this.historiaClinicaService.obtenerHistoriaPorPaciente(usuario.id);
  }

  @Get('mis-consultas')
  async obtenerMisConsultas(@Request() req) {
    const usuario = req.user;

    if (usuario.rol.nombre !== 'doctor') {
      throw new HttpException('Solo los doctores pueden ver sus consultas', HttpStatus.BAD_REQUEST);
    }

    return await this.historiaClinicaService.obtenerHistoriaPorDoctor(usuario.id);
  }

  @Get('buscar')
  async buscarPorDiagnostico(@Query('diagnostico') diagnostico: string, @Request() req) {
    const usuario = req.user;

    // Solo administradores y doctores pueden buscar por diagnóstico
    if (!['admin', 'doctor'].includes(usuario.rol.nombre)) {
      throw new HttpException('No tienes permisos para realizar esta búsqueda', HttpStatus.FORBIDDEN);
    }

    if (!diagnostico) {
      throw new HttpException('Diagnóstico requerido para la búsqueda', HttpStatus.BAD_REQUEST);
    }

    return await this.historiaClinicaService.buscarHistoriasPorDiagnostico(diagnostico);
  }

  @Get('estadisticas')
  async obtenerEstadisticas(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver estadísticas
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver estadísticas', HttpStatus.FORBIDDEN);
    }

    return await this.historiaClinicaService.obtenerEstadisticasHistorias();
  }

  @Get('paciente/:pacienteId/ultima')
  async obtenerUltimaConsulta(
    @Param('pacienteId', ParseIntPipe) pacienteId: number,
    @Query('doctorId') doctorId: string,
    @Request() req
  ) {
    const usuario = req.user;

    // Verificar permisos
    if (usuario.rol.nombre === 'paciente' && pacienteId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    if (usuario.rol.nombre === 'doctor' && doctorId && parseInt(doctorId) !== usuario.id) {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    const doctorIdNum = doctorId ? parseInt(doctorId) : undefined;
    return await this.historiaClinicaService.obtenerUltimaConsultaPaciente(pacienteId, doctorIdNum);
  }

  @Get(':id')
  async obtenerHistoriaPorId(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuario = req.user;

    // Verificar acceso a la historia específica
    const tieneAcceso = await this.historiaClinicaService.verificarAccesoHistoria(
      id,
      usuario.id,
      usuario.rol.nombre
    );

    if (!tieneAcceso) {
      throw new HttpException('No tienes permisos para ver esta historia clínica', HttpStatus.FORBIDDEN);
    }

    return await this.historiaClinicaService.obtenerHistoriaPorId(id);
  }

  @Patch(':id')
  async actualizarHistoriaClinica(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarData: any,
    @Request() req
  ) {
    const usuario = req.user;

    // Verificar acceso para modificar
    const tieneAcceso = await this.historiaClinicaService.verificarAccesoHistoria(
      id,
      usuario.id,
      usuario.rol.nombre
    );

    if (!tieneAcceso) {
      throw new HttpException('No tienes permisos para modificar esta historia clínica', HttpStatus.FORBIDDEN);
    }

    // Solo doctores y admins pueden modificar historias clínicas
    if (!['doctor', 'admin'].includes(usuario.rol.nombre)) {
      throw new HttpException('No tienes permisos para modificar historias clínicas', HttpStatus.FORBIDDEN);
    }

    return await this.historiaClinicaService.actualizarHistoriaClinica(id, actualizarData);
  }

  @Delete(':id')
  async eliminarHistoriaClinica(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuario = req.user;

    // Solo administradores pueden eliminar historias clínicas
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('Solo los administradores pueden eliminar historias clínicas', HttpStatus.FORBIDDEN);
    }

    await this.historiaClinicaService.eliminarHistoriaClinica(id);
    return { message: 'Historia clínica eliminada exitosamente' };
  }
}
