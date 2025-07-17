import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { DashboardCitasService } from './dashboard-citas.service';
import { DashboardDisponibilidadDto } from './dto/dashboard-disponibilidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard/citas')
@UseGuards(JwtAuthGuard)
export class DashboardCitasController {
  constructor(private readonly dashboardCitasService: DashboardCitasService) {}

  @Get('doctores-disponibles')
  async obtenerDoctoresDisponibles(@Query() dashboardDto: DashboardDisponibilidadDto) {
    try {
      // Establecer valores por defecto si no se proporcionan
      if (!dashboardDto.fechaInicio) {
        dashboardDto.fechaInicio = new Date().toISOString().split('T')[0];
      }
      
      if (!dashboardDto.fechaFin) {
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30); // Próximos 30 días por defecto
        dashboardDto.fechaFin = fechaFin.toISOString().split('T')[0];
      }

      return await this.dashboardCitasService.obtenerDoctoresDisponibles(dashboardDto);
    } catch (error) {
      throw new HttpException(
        'Error al obtener doctores disponibles: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('estadisticas')
  async obtenerEstadisticasCitas(@Request() req) {
    try {
      const usuario = req.user;
      return await this.dashboardCitasService.obtenerEstadisticasCitas(
        usuario.id,
        usuario.rol.nombre
      );
    } catch (error) {
      throw new HttpException(
        'Error al obtener estadísticas: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('estadisticas/admin')
  async obtenerEstadisticasCompletas(@Request() req) {
    try {
      const usuario = req.user;
      
      // Solo admins pueden ver estadísticas completas
      if (usuario.rol.nombre !== 'admin') {
        throw new HttpException(
          'No tienes permisos para ver estadísticas completas',
          HttpStatus.FORBIDDEN
        );
      }

      return await this.dashboardCitasService.obtenerEstadisticasCitas();
    } catch (error) {
      throw new HttpException(
        'Error al obtener estadísticas completas: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('disponibilidad-semanal/:doctorId')
  async obtenerDisponibilidadSemanal(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Request() req
  ) {
    try {
      const usuario = req.user;

      // Los pacientes pueden ver la disponibilidad de cualquier doctor
      // Los doctores solo pueden ver su propia disponibilidad
      // Los admins pueden ver la disponibilidad de cualquier doctor
      if (usuario.rol.nombre === 'doctor' && doctorId !== usuario.id) {
        throw new HttpException(
          'No tienes permisos para ver la disponibilidad de otro doctor',
          HttpStatus.FORBIDDEN
        );
      }

      return await this.dashboardCitasService.obtenerDisponibilidadSemanal(doctorId);
    } catch (error) {
      throw new HttpException(
        'Error al obtener disponibilidad semanal: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('especialidades')
  async obtenerEspecialidades() {
    try {
      // Este endpoint devuelve las especialidades disponibles en el sistema
      // para usar en filtros del frontend
      return await this.dashboardCitasService.obtenerEspecialidades();
    } catch (error) {
      throw new HttpException(
        'Error al obtener especialidades: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('resumen-paciente')
  async obtenerResumenPaciente(@Request() req) {
    try {
      const usuario = req.user;

      // Solo pacientes pueden usar este endpoint
      if (usuario.rol.nombre !== 'paciente') {
        throw new HttpException(
          'Este endpoint es solo para pacientes',
          HttpStatus.FORBIDDEN
        );
      }

      return await this.dashboardCitasService.obtenerResumenPaciente(usuario.id);
    } catch (error) {
      throw new HttpException(
        'Error al obtener resumen del paciente: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('agenda-doctor')
  async obtenerAgendaDoctor(@Request() req) {
    try {
      const usuario = req.user;

      // Solo doctores pueden usar este endpoint
      if (usuario.rol.nombre !== 'doctor') {
        throw new HttpException(
          'Este endpoint es solo para doctores',
          HttpStatus.FORBIDDEN
        );
      }

      return await this.dashboardCitasService.obtenerAgendaDoctor(usuario.id);
    } catch (error) {
      throw new HttpException(
        'Error al obtener agenda del doctor: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('validar-disponibilidad')
  async validarDisponibilidad(
    @Query('doctorId', ParseIntPipe) doctorId: number,
    @Query('fechaHora') fechaHora: string,
    @Query('duracion', ParseIntPipe) duracion: number = 60
  ) {
    try {
      return await this.dashboardCitasService.validarDisponibilidadEspecifica(
        doctorId,
        fechaHora,
        duracion
      );
    } catch (error) {
      throw new HttpException(
        'Error al validar disponibilidad: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('doctores-recomendados')
  async obtenerDoctoresRecomendados(@Request() req) {
    try {
      const usuario = req.user;

      // Solo pacientes pueden obtener recomendaciones
      if (usuario.rol.nombre !== 'paciente') {
        throw new HttpException(
          'Este endpoint es solo para pacientes',
          HttpStatus.FORBIDDEN
        );
      }

      return await this.dashboardCitasService.obtenerDoctoresRecomendados(usuario.id);
    } catch (error) {
      throw new HttpException(
        'Error al obtener doctores recomendados: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('estado-sistema')
  async obtenerEstadoSistema(@Request() req) {
    try {
      const usuario = req.user;
      return await this.dashboardCitasService.obtenerEstadoSistema(usuario.id, usuario.rol.nombre);
    } catch (error) {
      throw new HttpException(
        'Error al obtener estado del sistema: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('panel-medico')
  async obtenerPanelMedico(@Request() req) {
    try {
      const usuario = req.user;
      
      // Solo doctores pueden usar este endpoint
      if (usuario.rol.nombre !== 'doctor') {
        throw new HttpException(
          'Este endpoint es solo para doctores',
          HttpStatus.FORBIDDEN
        );
      }

      return await this.dashboardCitasService.obtenerPanelMedico(usuario.id);
    } catch (error) {
      throw new HttpException(
        'Error al obtener panel médico: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
