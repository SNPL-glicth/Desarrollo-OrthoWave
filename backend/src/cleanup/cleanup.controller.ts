import { Controller, Get, Post, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CleanupService } from './cleanup.service';

@Controller('api/cleanup')
@UseGuards(JwtAuthGuard)
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Get('stats')
  async getCleanupStats(@Request() req) {
    const usuario = req.user;
    
    // Solo admins y doctores pueden ver estadísticas
    if (usuario.rol.nombre !== 'admin' && usuario.rol.nombre !== 'doctor') {
      throw new HttpException('No tienes permisos para ver estadísticas de limpieza', HttpStatus.FORBIDDEN);
    }
    
    return await this.cleanupService.getCleanupStats();
  }

  @Post('run')
  async runCleanupManually(@Request() req) {
    const usuario = req.user;
    
    // Solo admins pueden ejecutar limpieza manual
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('Solo los administradores pueden ejecutar limpieza manual', HttpStatus.FORBIDDEN);
    }
    
    try {
      const result = await this.cleanupService.runCleanupManually();
      return {
        success: true,
        message: 'Limpieza ejecutada exitosamente',
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error durante la limpieza',
        error: error.message
      };
    }
  }
}
