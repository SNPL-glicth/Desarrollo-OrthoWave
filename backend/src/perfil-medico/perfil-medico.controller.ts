import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { PerfilMedicoService } from './perfil-medico.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('perfil-medico')
@UseGuards(JwtAuthGuard)
export class PerfilMedicoController {
  constructor(private readonly perfilMedicoService: PerfilMedicoService) {}

  @Get('doctores')
  async obtenerTodosLosDoctores(@Request() req) {
    // Solo administradores pueden ver todos los doctores
    const usuario = req.user;
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver esta información', HttpStatus.FORBIDDEN);
    }

    return await this.perfilMedicoService.obtenerTodosLosDoctores();
  }

  @Get('doctores-disponibles')
  async obtenerDoctoresDisponibles() {
    // Cualquier usuario autenticado puede ver doctores disponibles
    return await this.perfilMedicoService.obtenerDoctoresDisponibles();
  }

  @Get('mi-perfil')
  async obtenerMiPerfil(@Request() req) {
    const usuario = req.user;

    if (usuario.rol.nombre !== 'doctor') {
      throw new HttpException('Solo los doctores tienen perfil médico', HttpStatus.BAD_REQUEST);
    }

    return await this.perfilMedicoService.obtenerPorUsuarioId(usuario.id);
  }

  @Get('usuario/:id')
  async obtenerPerfilPorUsuario(@Param('id', ParseIntPipe) usuarioId: number, @Request() req) {
    const usuario = req.user;

    // Los doctores solo pueden ver su propio perfil, admins pueden ver todos
    if (usuario.rol.nombre === 'doctor' && usuarioId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver este perfil', HttpStatus.FORBIDDEN);
    }

    return await this.perfilMedicoService.obtenerPorUsuarioId(usuarioId);
  }

  @Post()
  async crearPerfil(@Body() perfilData: any, @Request() req) {
    const usuario = req.user;

    // Solo admins pueden crear perfiles para otros usuarios
    if (usuario.rol.nombre !== 'admin' && perfilData.usuarioId !== usuario.id) {
      throw new HttpException('No tienes permisos para crear este perfil', HttpStatus.FORBIDDEN);
    }

    return await this.perfilMedicoService.crearPerfilMedico(perfilData);
  }

  @Patch('mi-perfil')
  async actualizarMiPerfil(@Body() actualizarData: any, @Request() req) {
    const usuario = req.user;

    if (usuario.rol.nombre !== 'doctor') {
      throw new HttpException('Solo los doctores pueden actualizar perfil médico', HttpStatus.BAD_REQUEST);
    }

    return await this.perfilMedicoService.actualizarPerfil(usuario.id, actualizarData);
  }

  @Patch('usuario/:id')
  async actualizarPerfil(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Body() actualizarData: any,
    @Request() req
  ) {
    const usuario = req.user;

    // Los doctores solo pueden actualizar su propio perfil, admins pueden actualizar todos
    if (usuario.rol.nombre === 'doctor' && usuarioId !== usuario.id) {
      throw new HttpException('No tienes permisos para actualizar este perfil', HttpStatus.FORBIDDEN);
    }

    return await this.perfilMedicoService.actualizarPerfil(usuarioId, actualizarData);
  }
}
