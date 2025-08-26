import { IsNumber, IsString, IsBoolean, IsOptional, IsArray, IsEnum, IsDateString, IsObject } from 'class-validator';

export enum ScheduleType {
  SPECIFIC_DATE = 'specific_date',     // Para una fecha específica
  WEEKLY_RECURRING = 'weekly_recurring', // Para patrón semanal
  MONTHLY_RECURRING = 'monthly_recurring', // Para patrón mensual
  EXCEPTION = 'exception'              // Para excepciones/bloqueos
}

export enum RecurrencePattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export class TimeSlotDto {
  @IsString()
  startTime: string; // "08:00"

  @IsString()
  endTime: string; // "12:00"

  @IsOptional()
  @IsString()
  label?: string; // "Mañana", "Tarde", etc.
}

export class CreateFlexibleScheduleDto {
  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  // Para fechas específicas o inicio de rango
  @IsOptional()
  @IsDateString()
  startDate?: string;

  // Para rangos de fechas
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Para patrones recurrentes
  @IsOptional()
  @IsEnum(RecurrencePattern)
  recurrencePattern?: RecurrencePattern;

  // Día de la semana (0-6, domingo-sábado) para patrones semanales
  @IsOptional()
  @IsNumber()
  dayOfWeek?: number;

  // Día del mes (1-31) para patrones mensuales
  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  // Indica si el doctor está disponible
  @IsBoolean()
  isAvailable: boolean;

  // Horarios específicos del día
  @IsOptional()
  @IsArray()
  timeSlots?: TimeSlotDto[];

  // Duración de cada cita en minutos
  @IsOptional()
  @IsNumber()
  slotDuration?: number; // 30, 45, 60, etc.

  // Tiempo de buffer entre citas
  @IsOptional()
  @IsNumber()
  bufferTime?: number; // 5, 10, 15 minutos

  // Número máximo de citas para este período
  @IsOptional()
  @IsNumber()
  maxAppointments?: number;

  // Notas del doctor para este horario
  @IsOptional()
  @IsString()
  notes?: string;

  // Para casos especiales (vacaciones, conferencias, etc.)
  @IsOptional()
  @IsString()
  reason?: string;

  // Configuración de notificaciones
  @IsOptional()
  @IsBoolean()
  notifyPatients?: boolean;

  // Prioridad del horario (útil para resolver conflictos)
  @IsOptional()
  @IsNumber()
  priority?: number; // 1 = alta, 5 = baja
}

export class UpdateFlexibleScheduleDto extends CreateFlexibleScheduleDto {
  @IsNumber()
  id: number;
}

export class BulkScheduleOperationDto {
  @IsArray()
  schedules: CreateFlexibleScheduleDto[];

  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;
}

// DTO para consultar disponibilidad
export class QueryAvailabilityDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  includeExceptions?: boolean;

  @IsOptional()
  @IsArray()
  scheduleTypes?: ScheduleType[];
}

// DTO para respuestas de disponibilidad
export class DoctorAvailabilityResponseDto {
  @IsDateString()
  date: string;

  @IsBoolean()
  isAvailable: boolean;

  @IsArray()
  timeSlots: {
    startTime: string;
    endTime: string;
    isBooked: boolean;
    appointmentId?: number;
    duration?: number;
  }[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsNumber()
  maxAppointments: number;

  @IsNumber()
  currentAppointments: number;

  @IsNumber()
  slotDuration: number;

  @IsNumber()
  bufferTime: number;
}
