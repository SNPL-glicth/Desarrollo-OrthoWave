/**
 * Utilidades centralizadas para manejo de timezone de Colombia
 * Resuelve problemas de conversión UTC/Local en todo el sistema
 * ACTUALIZADO: Sistema unificado con backend para evitar inconsistencias
 */

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Timezone de Colombia: UTC-5 (sincronizado con backend)
export const COLOMBIA_TIMEZONE_OFFSET = -5;
export const COLOMBIA_TIMEZONE = 'America/Bogota';

/**
 * Configurar timezone al inicializar la aplicación
 */
export const initializeColombiaTimezone = (): void => {
  // Verificar que el navegador reconoce la zona horaria
  const testDate = new Date();
  const formatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    timeZoneName: 'short'
  });
  
  console.log('🌍 Frontend timezone configurado:', COLOMBIA_TIMEZONE);
  console.log('⏰ Fecha actual Colombia:', getCurrentColombiaDate().toISOString());
  console.log('🔍 Verificación timezone navegador:', formatter.format(testDate));
};

/**
 * Obtiene la fecha/hora actual de Colombia como Date object usando Intl API
 * Este método es más preciso que el cálculo manual de UTC offsets
 */
export const getCurrentColombiaDate = (): Date => {
  const now = new Date();
  
  // Método 1: Usar toLocaleString con timezone de Colombia
  const colombiaTimeString = now.toLocaleString('en-CA', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(', ', 'T');
  
  // Crear Date object que represente la hora de Colombia
  // Necesitamos ajustar porque JavaScript interpreta esto como hora local
  
  // Calcular la diferencia de timezone para ajustar correctamente
  const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
  const colombiaOffset = -5 * 60 * 60 * 1000; // -5 horas en milisegundos
  const colombiaTime = nowUTC + colombiaOffset;
  
  console.log('🌍 Timezone debug:', {
    originalNow: now.toISOString(),
    colombiaTimeString,
    calculatedColombia: new Date(colombiaTime).toISOString(),
    localTimezoneOffset: now.getTimezoneOffset()
  });
  
  return new Date(colombiaTime);
};

/**
 * Convierte una hora string (HH:MM) a un Date object en timezone de Colombia
 * @param timeString - Hora en formato "HH:MM" (ej: "09:20")
 * @param date - Fecha base (opcional, por defecto hoy)
 * @returns Date object ajustado a timezone de Colombia
 */
export const parseTimeInColombiaTimezone = (timeString: string, date?: Date): Date => {
  const baseDate = date || new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const dateInColombia = new Date(baseDate);
  dateInColombia.setHours(hours, minutes, 0, 0);
  
  return dateInColombia;
};

/**
 * Formatea una hora para mostrar en timezone de Colombia
 * @param time - Tiempo como string "HH:MM" o Date object
 * @param includeDate - Si incluir la fecha en el formato
 * @returns String formateado
 */
export const formatTimeInColombiaTimezone = (time: string | Date, includeDate: boolean = false): string => {
  let date: Date;
  
  if (typeof time === 'string') {
    // Si es string, asumimos que está en formato HH:MM y es hora local de Colombia
    return time;
  } else {
    date = time;
  }
  
  if (includeDate) {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  } else {
    return format(date, 'HH:mm');
  }
};

/**
 * Crea un string de fecha-hora ISO para el backend manteniendo timezone de Colombia
 * @param date - Fecha como Date object
 * @param time - Hora como string "HH:MM"
 * @returns String ISO con timezone de Colombia (-05:00)
 */
export const createColombiaDateTimeISO = (date: Date, time: string): string => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return `${dateStr}T${time}:00-05:00`;
};

/**
 * Convierte un datetime ISO del backend a Date object local
 * @param isoString - String ISO del backend
 * @returns Date object local
 */
export const parseBackendDateTime = (isoString: string): Date => {
  return parseISO(isoString);
};

/**
 * Extrae solo la hora de un datetime, manteniendo timezone de Colombia
 * @param datetime - Date object o string ISO
 * @returns String de hora en formato "HH:MM"
 */
export const extractTimeFromDateTime = (datetime: string | Date): string => {
  if (typeof datetime === 'string') {
    // Si viene del backend con timezone, parsearlo correctamente
    const parsed = parseISO(datetime);
    return format(parsed, 'HH:mm');
  } else {
    return format(datetime, 'HH:mm');
  }
};

/**
 * Valida si una fecha/hora está en el pasado según timezone de Colombia
 * @param date - Fecha como Date object
 * @param time - Hora como string "HH:MM"
 * @returns true si está en el pasado
 */
export const isInPastColombiaTime = (date: Date, time: string): boolean => {
  const appointmentDateTime = parseTimeInColombiaTimezone(time, date);
  const nowColombia = getCurrentColombiaDate();
  
  return appointmentDateTime <= nowColombia;
};

/**
 * Valida si una fecha específica está en el pasado según timezone de Colombia
 * @param date - Fecha a validar
 * @returns true si la fecha está en el pasado
 */
export const isDateInPastColombia = (date: Date): boolean => {
  const nowColombia = getCurrentColombiaDate();
  
  // Obtener solo la fecha (año, mes, día) sin horas, minutos, segundos
  const todayColombia = new Date(nowColombia.getFullYear(), nowColombia.getMonth(), nowColombia.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Debug logging para entender el problema
  console.log('🔍 isDateInPastColombia debug:', {
    nowColombia: nowColombia.toISOString(),
    todayColombia: todayColombia.toISOString(),
    targetDate: targetDate.toISOString(),
    dateInput: date.toISOString(),
    result: targetDate < todayColombia,
    comparison: {
      targetYear: targetDate.getFullYear(),
      targetMonth: targetDate.getMonth(),
      targetDay: targetDate.getDate(),
      todayYear: todayColombia.getFullYear(),
      todayMonth: todayColombia.getMonth(),
      todayDay: todayColombia.getDate()
    }
  });
  
  return targetDate < todayColombia;
};

/**
 * Valida si una hora específica del día actual está en el pasado según timezone de Colombia
 * @param time - Hora en formato "HH:MM"
 * @param date - Fecha opcional (por defecto hoy)
 * @returns true si la hora está en el pasado
 */
export const isTimeInPastColombia = (time: string, date?: Date): boolean => {
  const nowColombia = getCurrentColombiaDate();
  const targetDate = date || nowColombia;
  
  // Si la fecha no es hoy, no puede estar en el pasado por hora
  const isToday = (
    targetDate.getFullYear() === nowColombia.getFullYear() &&
    targetDate.getMonth() === nowColombia.getMonth() &&
    targetDate.getDate() === nowColombia.getDate()
  );
  
  if (!isToday) {
    return false; // Si no es hoy, validar solo por fecha, no por hora
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const targetDateTime = new Date(targetDate);
  targetDateTime.setHours(hours, minutes, 0, 0);
  
  return targetDateTime <= nowColombia;
};

/**
 * Valida si una combinación de fecha y hora está en el pasado según timezone de Colombia
 * @param date - Fecha como Date object
 * @param time - Hora como string "HH:MM"
 * @returns true si está en el pasado
 */
export const isDateTimeInPastColombia = (date: Date, time: string): boolean => {
  const nowColombia = getCurrentColombiaDate();
  const [hours, minutes] = time.split(':').map(Number);
  const targetDateTime = new Date(date);
  targetDateTime.setHours(hours, minutes, 0, 0);
  
  return targetDateTime <= nowColombia;
};

/**
 * Obtiene la hora actual de Colombia en formato HH:MM
 * @returns String de hora actual en formato "HH:MM"
 */
export const getCurrentColombiaTime = (): string => {
  const nowColombia = getCurrentColombiaDate();
  return format(nowColombia, 'HH:mm');
};

/**
 * Obtiene solo la fecha actual de Colombia (sin horas)
 * @returns Date object con hora 00:00:00
 */
export const getCurrentColombiaDateOnly = (): Date => {
  const nowColombia = getCurrentColombiaDate();
  return new Date(nowColombia.getFullYear(), nowColombia.getMonth(), nowColombia.getDate());
};

/**
 * Obtiene información detallada de fecha/hora actual de Colombia para debugging
 */
export const getColombiaTimeInfo = () => {
  const now = new Date();
  const colombiaTime = getCurrentColombiaDate();
  
  return {
    utc: now.toISOString(),
    colombia: format(colombiaTime, "yyyy-MM-dd'T'HH:mm:ss xxx", { locale: es }),
    colombiaReadable: format(colombiaTime, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es }),
    currentTime: getCurrentColombiaTime(),
    currentDateOnly: getCurrentColombiaDateOnly(),
    offset: COLOMBIA_TIMEZONE_OFFSET
  };
};
