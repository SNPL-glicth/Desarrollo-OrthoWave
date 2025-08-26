import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { FlexibleDoctorSchedule, ScheduleType } from './entities/flexible-doctor-schedule.entity';
import { 
  CreateFlexibleScheduleDto, 
  UpdateFlexibleScheduleDto, 
  BulkScheduleOperationDto,
  QueryAvailabilityDto,
  DoctorAvailabilityResponseDto,
  TimeSlotDto
} from './dto/create-flexible-schedule.dto';

@Injectable()
export class FlexibleScheduleService {
  constructor(
    @InjectRepository(FlexibleDoctorSchedule)
    private readonly scheduleRepository: Repository<FlexibleDoctorSchedule>,
  ) {}

  /**
   * Crear un nuevo horario flexible
   */
  async createSchedule(doctorId: number, createScheduleDto: CreateFlexibleScheduleDto): Promise<FlexibleDoctorSchedule> {
    // Validar datos según el tipo de horario
    this.validateScheduleData(createScheduleDto);

    const schedule = this.scheduleRepository.create({
      doctor_id: doctorId,
      schedule_type: createScheduleDto.scheduleType,
      start_date: createScheduleDto.startDate ? new Date(createScheduleDto.startDate) : null,
      end_date: createScheduleDto.endDate ? new Date(createScheduleDto.endDate) : null,
      recurrence_pattern: createScheduleDto.recurrencePattern,
      day_of_week: createScheduleDto.dayOfWeek,
      day_of_month: createScheduleDto.dayOfMonth,
      is_available: createScheduleDto.isAvailable,
      time_slots: createScheduleDto.timeSlots || [],
      slot_duration: createScheduleDto.slotDuration || 60,
      buffer_time: createScheduleDto.bufferTime || 0,
      max_appointments: createScheduleDto.maxAppointments || 8,
      notes: createScheduleDto.notes,
      reason: createScheduleDto.reason,
      notify_patients: createScheduleDto.notifyPatients || false,
      priority: createScheduleDto.priority || 3,
    });

    return await this.scheduleRepository.save(schedule);
  }

  /**
   * Actualizar un horario existente
   */
  async updateSchedule(doctorId: number, updateScheduleDto: UpdateFlexibleScheduleDto): Promise<FlexibleDoctorSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: updateScheduleDto.id, doctor_id: doctorId }
    });

    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }

    this.validateScheduleData(updateScheduleDto);

    Object.assign(schedule, {
      schedule_type: updateScheduleDto.scheduleType,
      start_date: updateScheduleDto.startDate ? new Date(updateScheduleDto.startDate) : null,
      end_date: updateScheduleDto.endDate ? new Date(updateScheduleDto.endDate) : null,
      recurrence_pattern: updateScheduleDto.recurrencePattern,
      day_of_week: updateScheduleDto.dayOfWeek,
      day_of_month: updateScheduleDto.dayOfMonth,
      is_available: updateScheduleDto.isAvailable,
      time_slots: updateScheduleDto.timeSlots || [],
      slot_duration: updateScheduleDto.slotDuration || schedule.slot_duration,
      buffer_time: updateScheduleDto.bufferTime ?? schedule.buffer_time,
      max_appointments: updateScheduleDto.maxAppointments || schedule.max_appointments,
      notes: updateScheduleDto.notes,
      reason: updateScheduleDto.reason,
      notify_patients: updateScheduleDto.notifyPatients ?? schedule.notify_patients,
      priority: updateScheduleDto.priority || schedule.priority,
    });

    return await this.scheduleRepository.save(schedule);
  }

  /**
   * Eliminar un horario
   */
  async deleteSchedule(doctorId: number, scheduleId: number): Promise<void> {
    const result = await this.scheduleRepository.delete({
      id: scheduleId,
      doctor_id: doctorId
    });

    if (result.affected === 0) {
      throw new NotFoundException('Horario no encontrado');
    }
  }

  /**
   * Obtener todos los horarios de un doctor
   */
  async getDoctorSchedules(doctorId: number): Promise<FlexibleDoctorSchedule[]> {
    return await this.scheduleRepository.find({
      where: { doctor_id: doctorId, is_active: true },
      order: { priority: 'ASC', created_at: 'DESC' }
    });
  }

  /**
   * Obtener disponibilidad para un rango de fechas
   */
  async getDoctorAvailability(
    doctorId: number, 
    queryDto: QueryAvailabilityDto
  ): Promise<DoctorAvailabilityResponseDto[]> {
    const startDate = new Date(queryDto.startDate);
    const endDate = new Date(queryDto.endDate);
    const availability: DoctorAvailabilityResponseDto[] = [];

    // Iterar por cada día en el rango
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayAvailability = await this.getAvailabilityForDate(doctorId, new Date(currentDate));
      availability.push(dayAvailability);
    }

    return availability;
  }

  /**
   * Obtener disponibilidad para una fecha específica
   */
  async getAvailabilityForDate(doctorId: number, date: Date): Promise<DoctorAvailabilityResponseDto> {
    // Obtener todos los horarios que aplican a esta fecha
    const applicableSchedules = await this.getApplicableSchedules(doctorId, date);
    
    // Resolver conflictos por prioridad
    const resolvedSchedule = this.resolveScheduleConflicts(applicableSchedules, date);

    if (!resolvedSchedule || !resolvedSchedule.is_available) {
      return {
        date: date.toISOString().split('T')[0],
        isAvailable: false,
        timeSlots: [],
        maxAppointments: 0,
        currentAppointments: 0,
        slotDuration: 60,
        bufferTime: 0,
        notes: resolvedSchedule?.notes,
        reason: resolvedSchedule?.reason
      };
    }

    // Generar slots de tiempo disponibles
    const timeSlots = this.generateTimeSlots(resolvedSchedule);

    // TODO: Obtener citas existentes para verificar disponibilidad real
    // const existingAppointments = await this.getExistingAppointments(doctorId, date);

    return {
      date: date.toISOString().split('T')[0],
      isAvailable: true,
      timeSlots,
      maxAppointments: resolvedSchedule.max_appointments,
      currentAppointments: 0, // TODO: Calcular desde citas existentes
      slotDuration: resolvedSchedule.slot_duration,
      bufferTime: resolvedSchedule.buffer_time,
      notes: resolvedSchedule.notes,
      reason: resolvedSchedule.reason
    };
  }

  /**
   * Configurar horario semanal estándar (Lunes a Viernes)
   */
  async setStandardWeeklySchedule(
    doctorId: number, 
    timeSlots: TimeSlotDto[],
    options: {
      slotDuration?: number;
      bufferTime?: number;
      maxAppointments?: number;
    } = {}
  ): Promise<FlexibleDoctorSchedule[]> {
    const schedules = [];
    const workDays = [1, 2, 3, 4, 5]; // Lunes a Viernes

    // Eliminar horarios semanales existentes
    await this.scheduleRepository.delete({
      doctor_id: doctorId,
      schedule_type: ScheduleType.WEEKLY_RECURRING,
      day_of_week: In(workDays)
    });

    // Crear nuevos horarios para cada día laboral
    for (const dayOfWeek of workDays) {
      const schedule = await this.createSchedule(doctorId, {
        scheduleType: ScheduleType.WEEKLY_RECURRING,
        dayOfWeek,
        isAvailable: true,
        timeSlots,
        slotDuration: options.slotDuration || 60,
        bufferTime: options.bufferTime || 0,
        maxAppointments: options.maxAppointments || 8,
      });
      schedules.push(schedule);
    }

    return schedules;
  }

  /**
   * Bloquear una fecha o rango de fechas (vacaciones, etc.)
   */
  async blockDateRange(
    doctorId: number,
    startDate: string,
    endDate: string,
    reason: string,
    notifyPatients: boolean = true
  ): Promise<FlexibleDoctorSchedule> {
    return await this.createSchedule(doctorId, {
      scheduleType: ScheduleType.EXCEPTION,
      startDate,
      endDate,
      isAvailable: false,
      reason,
      notifyPatients,
      priority: 1 // Alta prioridad para excepciones
    });
  }

  /**
   * Crear horario específico para una fecha
   */
  async setSpecificDateSchedule(
    doctorId: number,
    date: string,
    timeSlots: TimeSlotDto[],
    options: {
      slotDuration?: number;
      bufferTime?: number;
      maxAppointments?: number;
      notes?: string;
    } = {}
  ): Promise<FlexibleDoctorSchedule> {
    return await this.createSchedule(doctorId, {
      scheduleType: ScheduleType.SPECIFIC_DATE,
      startDate: date,
      isAvailable: true,
      timeSlots,
      slotDuration: options.slotDuration || 60,
      bufferTime: options.bufferTime || 0,
      maxAppointments: options.maxAppointments || 8,
      notes: options.notes,
      priority: 2 // Prioridad media para fechas específicas
    });
  }

  /**
   * Operaciones en lote
   */
  async bulkScheduleOperation(
    doctorId: number, 
    bulkDto: BulkScheduleOperationDto
  ): Promise<FlexibleDoctorSchedule[]> {
    const results = [];

    for (const scheduleDto of bulkDto.schedules) {
      try {
        const schedule = await this.createSchedule(doctorId, scheduleDto);
        results.push(schedule);
      } catch (error) {
        console.error(`Error creating schedule: ${error.message}`);
        // Continuar con los demás horarios
      }
    }

    return results;
  }

  // Métodos privados de utilidad

  private validateScheduleData(dto: CreateFlexibleScheduleDto): void {
    switch (dto.scheduleType) {
      case ScheduleType.SPECIFIC_DATE:
        if (!dto.startDate) {
          throw new BadRequestException('startDate es requerido para horarios específicos');
        }
        break;
      
      case ScheduleType.WEEKLY_RECURRING:
        if (dto.dayOfWeek === undefined || dto.dayOfWeek < 0 || dto.dayOfWeek > 6) {
          throw new BadRequestException('dayOfWeek debe estar entre 0 y 6 para horarios semanales');
        }
        break;
      
      case ScheduleType.MONTHLY_RECURRING:
        if (!dto.dayOfMonth || dto.dayOfMonth < 1 || dto.dayOfMonth > 31) {
          throw new BadRequestException('dayOfMonth debe estar entre 1 y 31 para horarios mensuales');
        }
        break;
      
      case ScheduleType.EXCEPTION:
        if (!dto.startDate) {
          throw new BadRequestException('startDate es requerido para excepciones');
        }
        break;
    }

    // Validar time slots si están disponibles
    if (dto.isAvailable && dto.timeSlots) {
      for (const slot of dto.timeSlots) {
        if (slot.startTime >= slot.endTime) {
          throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
        }
      }
    }
  }

  private async getApplicableSchedules(doctorId: number, date: Date): Promise<FlexibleDoctorSchedule[]> {
    const schedules = await this.scheduleRepository.find({
      where: { doctor_id: doctorId, is_active: true }
    });

    return schedules.filter(schedule => schedule.appliesToDate(date));
  }

  private resolveScheduleConflicts(
    schedules: FlexibleDoctorSchedule[], 
    date: Date
  ): FlexibleDoctorSchedule | null {
    if (schedules.length === 0) return null;
    if (schedules.length === 1) return schedules[0];

    // Ordenar por prioridad (1 = más alta prioridad)
    return schedules.sort((a, b) => a.priority - b.priority)[0];
  }

  private generateTimeSlots(schedule: FlexibleDoctorSchedule): Array<{
    startTime: string;
    endTime: string;
    isBooked: boolean;
    appointmentId?: number;
    duration?: number;
  }> {
    const slots = [];
    
    if (!schedule.time_slots) return slots;

    for (const timeSlot of schedule.time_slots) {
      // Generar slots individuales dentro de cada rango
      const startMinutes = this.timeToMinutes(timeSlot.startTime);
      const endMinutes = this.timeToMinutes(timeSlot.endTime);
      const slotDuration = schedule.slot_duration;
      const bufferTime = schedule.buffer_time;

      for (let currentMinutes = startMinutes; 
           currentMinutes + slotDuration <= endMinutes; 
           currentMinutes += slotDuration + bufferTime) {
        
        const slotStart = this.minutesToTime(currentMinutes);
        const slotEnd = this.minutesToTime(currentMinutes + slotDuration);
        
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: false, // TODO: Verificar con citas existentes
          duration: slotDuration
        });
      }
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
