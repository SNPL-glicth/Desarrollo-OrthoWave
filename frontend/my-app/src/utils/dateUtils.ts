/**
 * Utilidad central para fechas - asegura que todos los componentes usen la misma fecha actual
 * Sincronizado con la zona horaria de Bogotá, Colombia (America/Bogota)
 * 
 * NOTA: Para nuevas funciones de timezone, usar timezoneUtils.ts
 */

// Re-export funciones principales desde timezoneUtils para usar sistema unificado
export { getCurrentColombiaDate, getColombiaTimeInfo, COLOMBIA_TIMEZONE } from './timezoneUtils';

// Zona horaria de Colombia (deprecated - usar COLOMBIA_TIMEZONE de timezoneUtils)
const COLOMBIA_TIMEZONE_LOCAL = 'America/Bogota';

// Función central para obtener la fecha actual en la zona horaria de Colombia
export const getCurrentDate = (): Date => {
  // Usar la fecha actual del sistema pero ajustada para FullCalendar
  // FullCalendar manejará la zona horaria internamente
  return new Date();
};

// getCurrentColombiaDate está exportado desde timezoneUtils (ver arriba)

// Función alternativa usando Intl.DateTimeFormat para mayor precisión
export const getCurrentDateWithIntl = (): Date => {
  return getCurrentDate(); // Ahora getCurrentDate ya usa Intl
};

// Función para obtener la fecha actual sin horas (solo año, mes, día) en zona horaria Colombia
export const getCurrentDateOnly = (): Date => {
  const now = getCurrentDate();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Función para obtener la hora actual de Colombia como texto
export const getCurrentTimeString = (): string => {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE_LOCAL,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
};

// Función para obtener la fecha y hora actual de Colombia como texto
export const getCurrentDateTimeString = (): string => {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE_LOCAL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
};

// Función para convertir cualquier fecha a la zona horaria de Colombia
export const convertToColombiaTime = (date: Date): Date => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: COLOMBIA_TIMEZONE_LOCAL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const colombiaDateTime = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}T${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`;
  
  return new Date(colombiaDateTime);
};

// Función para comparar si dos fechas son del mismo día
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Función para obtener el primer día del mes actual en zona horaria Colombia
export const getCurrentMonthStart = (): Date => {
  const now = getCurrentDate();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Función para formatear fecha para logging
export const formatDateForLog = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// Función para obtener el "hoy" en zona horaria Colombia
export const getTodayColombia = (): Date => {
  const now = getCurrentDate();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Constante exportada con la zona horaria
export const TIMEZONE = COLOMBIA_TIMEZONE_LOCAL;
