/**
 * Utilidades centralizadas para manejo de timezone de Colombia en el backend
 * Configuración unificada para evitar inconsistencias de fechas/horas
 * Zona Horaria: America/Bogota (UTC-5)
 */

// Configuración global de timezone
export const COLOMBIA_TIMEZONE = 'America/Bogota';
export const COLOMBIA_UTC_OFFSET = -5; // UTC-5

/**
 * Configura la zona horaria del proceso Node.js a Colombia
 * Debe llamarse al iniciar la aplicación
 */
export function setColombiaTimezone(): void {
  process.env.TZ = COLOMBIA_TIMEZONE;
  
  // Verificar que la configuración se aplicó correctamente
  const testDate = new Date();
  const offset = testDate.getTimezoneOffset() / 60;
  
  console.log(`🌍 Timezone configurado: ${COLOMBIA_TIMEZONE}`);
  console.log(`⏰ Offset actual: UTC${offset > 0 ? '-' : '+'}${Math.abs(offset)}`);
  console.log(`📅 Fecha/Hora actual (Colombia): ${getCurrentColombiaDateTime().toISOString()}`);
}

/**
 * Obtiene la fecha y hora actual de Colombia
 */
export function getCurrentColombiaDateTime(): Date {
  return new Date();
}

/**
 * Convierte cualquier fecha a la zona horaria de Colombia
 */
export function toColombiaTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: COLOMBIA_TIMEZONE }));
}

/**
 * Crea una fecha específica en timezone de Colombia
 */
export function createColombiaDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}.000${getColombiaTimezoneOffset()}`;
  return new Date(dateString);
}

/**
 * Obtiene el offset de Colombia en formato string (ej: "-05:00")
 */
export function getColombiaTimezoneOffset(): string {
  return '-05:00';
}

/**
 * Parsea un string de fecha-hora asumiendo que está en timezone de Colombia
 */
export function parseColombiaDateTime(dateTimeString: string): Date {
  // Si no tiene timezone, agregar el de Colombia
  if (!dateTimeString.includes('T') && !dateTimeString.includes('Z') && !dateTimeString.includes('+') && !dateTimeString.includes('-', 10)) {
    return new Date(dateTimeString + getColombiaTimezoneOffset());
  }
  return new Date(dateTimeString);
}

/**
 * Formatea una fecha para logging con timezone de Colombia
 */
export function formatForLog(date: Date = getCurrentColombiaDateTime()): string {
  return date.toLocaleString('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Obtiene el inicio del día actual en Colombia (00:00:00)
 */
export function getStartOfToday(): Date {
  const now = getCurrentColombiaDateTime();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Obtiene el final del día actual en Colombia (23:59:59)
 */
export function getEndOfToday(): Date {
  const now = getCurrentColombiaDateTime();
  now.setHours(23, 59, 59, 999);
  return now;
}

/**
 * Verifica si una fecha está en el pasado según hora de Colombia
 */
export function isInPast(date: Date): boolean {
  return date < getCurrentColombiaDateTime();
}

/**
 * Calcula la diferencia en minutos entre una fecha y la hora actual de Colombia
 */
export function getMinutesToNow(date: Date): number {
  const now = getCurrentColombiaDateTime();
  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
}

/**
 * Obtiene información detallada del estado actual de timezone
 */
export function getTimezoneInfo() {
  const now = new Date();
  const colombiaTime = getCurrentColombiaDateTime();
  
  return {
    systemTZ: process.env.TZ,
    colombiaTimezone: COLOMBIA_TIMEZONE,
    utcOffset: COLOMBIA_UTC_OFFSET,
    currentUTC: now.toISOString(),
    currentColombia: colombiaTime.toISOString(),
    formattedColombia: formatForLog(colombiaTime),
    systemOffset: now.getTimezoneOffset()
  };
}
