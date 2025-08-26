import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe,
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FlexibleScheduleService } from '../doctor-availability/flexible-schedule.service';
import {
  CreateFlexibleScheduleDto,
  UpdateFlexibleScheduleDto,
  BulkScheduleOperationDto,
  QueryAvailabilityDto,
  TimeSlotDto
} from '../doctor-availability/dto/create-flexible-schedule.dto';

@Controller('doctor-availability')
@UseGuards(JwtAuthGuard)
export class DoctorAvailabilityController {
  constructor(
    private readonly flexibleScheduleService: FlexibleScheduleService,
  ) {}

  @Get('test')
  async test() {
    return {
      success: true,
      message: 'Doctor availability controller is working',
    };
  }

  /**
   * Obtener todos los horarios del doctor autenticado
   */
  @Get('my-schedules')
  async getMySchedules(@Request() req) {
    const doctorId = req.user.id;
    const schedules = await this.flexibleScheduleService.getDoctorSchedules(doctorId);
    return {
      success: true,
      data: schedules
    };
  }

  /**
   * Obtener disponibilidad para un rango de fechas
   */
  @Get('availability')
  async getAvailability(
    @Request() req,
    @Query() queryDto: QueryAvailabilityDto
  ) {
    const doctorId = req.user.id;
    const availability = await this.flexibleScheduleService.getDoctorAvailability(doctorId, queryDto);
    return {
      success: true,
      data: availability
    };
  }

  /**
   * Obtener disponibilidad para una fecha específica
   */
  @Get('availability/:date')
  async getAvailabilityForDate(
    @Request() req,
    @Param('date') date: string
  ) {
    const doctorId = req.user.id;
    const dateObj = new Date(date);
    const availability = await this.flexibleScheduleService.getAvailabilityForDate(doctorId, dateObj);
    return {
      success: true,
      data: availability
    };
  }

  /**
   * Crear un nuevo horario flexible
   */
  @Post('schedule')
  async createSchedule(
    @Request() req,
    @Body() createScheduleDto: CreateFlexibleScheduleDto
  ) {
    const doctorId = req.user.id;
    const schedule = await this.flexibleScheduleService.createSchedule(doctorId, createScheduleDto);
    return {
      success: true,
      message: 'Horario creado exitosamente',
      data: schedule
    };
  }

  /**
   * Actualizar un horario existente
   */
  @Put('schedule')
  async updateSchedule(
    @Request() req,
    @Body() updateScheduleDto: UpdateFlexibleScheduleDto
  ) {
    const doctorId = req.user.id;
    const schedule = await this.flexibleScheduleService.updateSchedule(doctorId, updateScheduleDto);
    return {
      success: true,
      message: 'Horario actualizado exitosamente',
      data: schedule
    };
  }

  /**
   * Eliminar un horario
   */
  @Delete('schedule/:id')
  async deleteSchedule(
    @Request() req,
    @Param('id', ParseIntPipe) scheduleId: number
  ) {
    const doctorId = req.user.id;
    await this.flexibleScheduleService.deleteSchedule(doctorId, scheduleId);
    return {
      success: true,
      message: 'Horario eliminado exitosamente'
    };
  }

  /**
   * Configurar horario semanal estándar (Lunes a Viernes)
   */
  @Post('weekly-standard')
  async setWeeklyStandardSchedule(
    @Request() req,
    @Body() body: {
      timeSlots: TimeSlotDto[];
      slotDuration?: number;
      bufferTime?: number;
      maxAppointments?: number;
    }
  ) {
    const doctorId = req.user.id;
    const schedules = await this.flexibleScheduleService.setStandardWeeklySchedule(
      doctorId,
      body.timeSlots,
      {
        slotDuration: body.slotDuration,
        bufferTime: body.bufferTime,
        maxAppointments: body.maxAppointments
      }
    );
    return {
      success: true,
      message: 'Horario semanal configurado exitosamente',
      data: schedules
    };
  }

  /**
   * Bloquear una fecha o rango de fechas
   */
  @Post('block-dates')
  async blockDates(
    @Request() req,
    @Body() body: {
      startDate: string;
      endDate: string;
      reason: string;
      notifyPatients?: boolean;
    }
  ) {
    const doctorId = req.user.id;
    const schedule = await this.flexibleScheduleService.blockDateRange(
      doctorId,
      body.startDate,
      body.endDate,
      body.reason,
      body.notifyPatients
    );
    return {
      success: true,
      message: 'Fechas bloqueadas exitosamente',
      data: schedule
    };
  }

  /**
   * Configurar horario específico para una fecha
   */
  @Post('specific-date')
  async setSpecificDateSchedule(
    @Request() req,
    @Body() body: {
      date: string;
      timeSlots: TimeSlotDto[];
      slotDuration?: number;
      bufferTime?: number;
      maxAppointments?: number;
      notes?: string;
    }
  ) {
    const doctorId = req.user.id;
    const schedule = await this.flexibleScheduleService.setSpecificDateSchedule(
      doctorId,
      body.date,
      body.timeSlots,
      {
        slotDuration: body.slotDuration,
        bufferTime: body.bufferTime,
        maxAppointments: body.maxAppointments,
        notes: body.notes
      }
    );
    return {
      success: true,
      message: 'Horario específico configurado exitosamente',
      data: schedule
    };
  }

  /**
   * Operaciones en lote
   */
  @Post('bulk-operation')
  async bulkScheduleOperation(
    @Request() req,
    @Body() bulkDto: BulkScheduleOperationDto
  ) {
    const doctorId = req.user.id;
    const schedules = await this.flexibleScheduleService.bulkScheduleOperation(doctorId, bulkDto);
    return {
      success: true,
      message: 'Operación en lote completada',
      data: schedules
    };
  }

  /**
   * Plantillas de horarios comunes
   */
  @Get('templates')
  async getScheduleTemplates() {
    return {
      success: true,
      data: {
        standard: {
          name: 'Horario Estándar',
          description: 'Lunes a Viernes 8:00-12:00, 14:00-18:00',
          timeSlots: [
            { startTime: '08:00', endTime: '12:00', label: 'Mañana' },
            { startTime: '14:00', endTime: '18:00', label: 'Tarde' }
          ]
        },
        morning: {
          name: 'Solo Mañanas',
          description: 'Lunes a Viernes 7:00-13:00',
          timeSlots: [
            { startTime: '07:00', endTime: '13:00', label: 'Mañana' }
          ]
        },
        afternoon: {
          name: 'Solo Tardes',
          description: 'Lunes a Viernes 14:00-20:00',
          timeSlots: [
            { startTime: '14:00', endTime: '20:00', label: 'Tarde' }
          ]
        },
        extended: {
          name: 'Horario Extendido',
          description: 'Lunes a Sábado 7:00-19:00',
          timeSlots: [
            { startTime: '07:00', endTime: '12:00', label: 'Mañana' },
            { startTime: '14:00', endTime: '19:00', label: 'Tarde' }
          ]
        }
      }
    };
  }
}
