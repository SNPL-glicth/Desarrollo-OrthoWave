import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { ActualizarEstadoCitaDto } from './dto/actualizar-estado-cita.dto';
import { BuscarDisponibilidadDto } from './dto/buscar-disponibilidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  async crearCita(@Body() crearCitaDto: CrearCitaDto, @Request() req) {
    try {
      // Verificar que el usuario puede crear citas para este paciente
      const usuario = req.user;

      // Los pacientes solo pueden crear citas para sí mismos
      if (usuario.rol.nombre === 'paciente' && crearCitaDto.pacienteId !== usuario.id) {
        throw new HttpException('No tienes permisos para crear citas para otro paciente', HttpStatus.FORBIDDEN);
      }

      // Doctores y administradores pueden crear citas para cualquier paciente
      return await this.citasService.crearCita(crearCitaDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('paciente/:id')
  async obtenerCitasPorPaciente(@Param('id', ParseIntPipe) pacienteId: number, @Request() req) {
    const usuario = req.user;

    // Los pacientes solo pueden ver sus propias citas
    if (usuario.rol.nombre === 'paciente' && pacienteId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver las citas de otro paciente', HttpStatus.FORBIDDEN);
    }

    return await this.citasService.obtenerCitasPorPaciente(pacienteId);
  }

  @Get('doctor/:id')
  async obtenerCitasPorDoctor(@Param('id', ParseIntPipe) doctorId: number, @Request() req) {
    const usuario = req.user;

    // Los doctores solo pueden ver sus propias citas, admins pueden ver todas
    if (usuario.rol.nombre === 'doctor' && doctorId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver las citas de otro doctor', HttpStatus.FORBIDDEN);
    }

    return await this.citasService.obtenerCitasPorDoctor(doctorId);
  }

  @Get('mis-citas')
  async obtenerMisCitas(@Request() req) {
    const usuario = req.user;

    if (usuario.rol.nombre === 'paciente') {
      return await this.citasService.obtenerCitasPorPaciente(usuario.id);
    } else if (usuario.rol.nombre === 'doctor') {
      return await this.citasService.obtenerCitasPorDoctor(usuario.id);
    } else {
      throw new HttpException('Rol no válido para obtener citas', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('pendientes-aprobacion')
  async obtenerCitasPendientesAprobacion(@Request() req) {
    const usuario = req.user;

    // Solo administradores pueden ver citas pendientes de aprobación
    if (usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para ver las citas pendientes de aprobación', HttpStatus.FORBIDDEN);
    }

    return await this.citasService.obtenerCitasPendientesAprobacion();
  }

  @Get('disponibilidad')
  async buscarDisponibilidad(@Query() buscarDisponibilidadDto: BuscarDisponibilidadDto) {
    return await this.citasService.buscarDisponibilidad(buscarDisponibilidadDto);
  }

  @Get(':id')
  async obtenerCitaPorId(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const cita = await this.citasService.obtenerCitaPorId(id);
    const usuario = req.user;

    // Verificar permisos: paciente solo puede ver sus citas, doctor sus citas, admin todas
    if (usuario.rol.nombre === 'paciente' && cita.pacienteId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver esta cita', HttpStatus.FORBIDDEN);
    }

    if (usuario.rol.nombre === 'doctor' && cita.doctorId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver esta cita', HttpStatus.FORBIDDEN);
    }

    return cita;
  }

  @Patch(':id/estado')
  async actualizarEstadoCita(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarEstadoDto: ActualizarEstadoCitaDto,
    @Request() req
  ) {
    const usuario = req.user;
    const cita = await this.citasService.obtenerCitaPorId(id);

    // Verificar permisos según el tipo de cambio de estado
    if (actualizarEstadoDto.estado === 'aprobada' || actualizarEstadoDto.estado === 'cancelada') {
      // Solo administradores pueden aprobar o cancelar citas
      if (usuario.rol.nombre !== 'admin') {
        throw new HttpException('No tienes permisos para aprobar o cancelar citas', HttpStatus.FORBIDDEN);
      }
      actualizarEstadoDto.aprobadaPor = usuario.id;
    } else if (actualizarEstadoDto.estado === 'confirmada') {
      // Pacientes pueden confirmar sus propias citas
      if (usuario.rol.nombre === 'paciente' && cita.pacienteId !== usuario.id) {
        throw new HttpException('No tienes permisos para confirmar esta cita', HttpStatus.FORBIDDEN);
      }
    } else if (['en_curso', 'completada', 'no_asistio'].includes(actualizarEstadoDto.estado)) {
      // Solo doctores pueden marcar como en curso, completada o no asistió
      if (usuario.rol.nombre === 'doctor' && cita.doctorId !== usuario.id) {
        throw new HttpException('No tienes permisos para actualizar el estado de esta cita', HttpStatus.FORBIDDEN);
      }
    }

    return await this.citasService.actualizarEstadoCita(id, actualizarEstadoDto);
  }

  @Delete(':id')
  async eliminarCita(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuario = req.user;
    const cita = await this.citasService.obtenerCitaPorId(id);

    // Solo administradores pueden eliminar citas, o pacientes sus propias citas pendientes
    if (usuario.rol.nombre === 'paciente') {
      if (cita.pacienteId !== usuario.id || cita.estado !== 'pendiente') {
        throw new HttpException('No tienes permisos para eliminar esta cita', HttpStatus.FORBIDDEN);
      }
    } else if (usuario.rol.nombre === 'doctor') {
      throw new HttpException('Los doctores no pueden eliminar citas', HttpStatus.FORBIDDEN);
    }
    // Los administradores pueden eliminar cualquier cita

    await this.citasService.eliminarCita(id);
    return { message: 'Cita eliminada exitosamente' };
  }

  @Get('doctor/:doctorId/agenda/:fecha')
  async obtenerAgendaDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('fecha') fecha: string,
    @Request() req
  ) {
    const usuario = req.user;

    // Los doctores solo pueden ver su propia agenda, admins pueden ver todas
    if (usuario.rol.nombre === 'doctor' && doctorId !== usuario.id) {
      throw new HttpException('No tienes permisos para ver la agenda de otro doctor', HttpStatus.FORBIDDEN);
    }

    // Obtener citas del día
    const citas = await this.citasService.obtenerCitasPorDoctor(doctorId);
    const citasDelDia = citas.filter(cita => {
      const fechaCita = new Date(cita.fechaHora).toISOString().split('T')[0];
      return fechaCita === fecha;
    });

    // Obtener disponibilidad
    const disponibilidad = await this.citasService.buscarDisponibilidad({
      doctorId,
      fecha,
      duracion: 60
    });

    return {
      fecha,
      citas: citasDelDia,
      horariosDisponibles: disponibilidad
    };
  }
}
