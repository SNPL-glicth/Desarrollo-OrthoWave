import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay, isWeekend, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent, EventType, AppointmentStatus, CalendarView } from '../../../types/calendar';

// Colores estilo Google Calendar
export const EventColors = {
  appointment: {
    confirmed: '#1a73e8',
    scheduled: '#4285f4',
    pending: '#fbbc04',
    cancelled: '#ea4335',
    completed: '#34a853',
    in_progress: '#9c27b0',
    no_show: '#9e9e9e',
  },
  request: {
    pending: '#ff9800',
    approved: '#4caf50',
    rejected: '#f44336',
  },
  blocked: '#757575',
  available: '#e8f5e8',
};

export const getEventColor = (type: EventType, status: AppointmentStatus): string => {
  switch (type) {
    case 'appointment':
      return EventColors.appointment[status as keyof typeof EventColors.appointment] || EventColors.appointment.scheduled;
    case 'request':
      return EventColors.request[status as keyof typeof EventColors.request] || EventColors.request.pending;
    case 'blocked':
      return EventColors.blocked;
    case 'available':
      return EventColors.available;
    default:
      return '#9e9e9e';
  }
};

export const formatEventTime = (startTime: Date, endTime: Date): string => {
  return `${format(startTime, 'HH:mm', { locale: es })} - ${format(endTime, 'HH:mm', { locale: es })}`;
};

export const formatEventDate = (date: Date): string => {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
};

export const formatEventTitle = (event: CalendarEvent): string => {
  const timeText = formatEventTime(event.startTime, event.endTime);
  return `${timeText} - ${event.title}`;
};

export const generateTimeSlots = (startHour: number, endHour: number, interval: number): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

export const navigateDate = (currentDate: Date, view: CalendarView, direction: 'prev' | 'next'): Date => {
  const multiplier = direction === 'next' ? 1 : -1;
  
  switch (view) {
    case 'timeGridDay':
      return addDays(currentDate, multiplier);
    case 'timeGridWeek':
    case 'listWeek':
      return addWeeks(currentDate, multiplier);
    case 'dayGridMonth':
      return addMonths(currentDate, multiplier);
    default:
      return currentDate;
  }
};

export const isBusinessDay = (date: Date, businessDays: number[]): boolean => {
  const dayOfWeek = date.getDay();
  return businessDays.includes(dayOfWeek);
};

export const isHoliday = (date: Date, holidays: string[]): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  return holidays.includes(dateString);
};

export const getDayClassNames = (date: Date, isCurrentMonth: boolean, holidays: string[] = []): string => {
  const classes = ['calendar-day'];
  
  if (isToday(date)) {
    classes.push('calendar-day--today');
  }
  
  if (!isCurrentMonth) {
    classes.push('calendar-day--other-month');
  }
  
  if (isWeekend(date)) {
    classes.push('calendar-day--weekend');
  }
  
  if (isHoliday(date, holidays)) {
    classes.push('calendar-day--holiday');
  }
  
  return classes.join(' ');
};

export const filterEventsByDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return events.filter(event => {
    const eventStart = startOfDay(event.startTime);
    return eventStart >= dayStart && eventStart <= dayEnd;
  });
};

export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

export const getEventDuration = (event: CalendarEvent): number => {
  return event.endTime.getTime() - event.startTime.getTime();
};

export const createEventFromAppointment = (appointment: any): CalendarEvent => {
  console.log('🔧 createEventFromAppointment - Datos de entrada:', {
    id: appointment.id,
    fechaHora: appointment.fechaHora,
    fechaHoraType: typeof appointment.fechaHora,
    fechaHoraString: appointment.fechaHora?.toString(),
    duracion: appointment.duracion
  });

  // SOLUCIÓN MUY SIMPLIFICADA:
  // Las fechas del backend ya vienen correctas. Solo parseamos sin conversiones.
  const startTime = new Date(appointment.fechaHora);
  
  console.log('📅 Fecha procesada:', {
    original: appointment.fechaHora,
    startTime: startTime.toString(),
    startTimeISO: startTime.toISOString(),
    horaLocal: startTime.toLocaleString(),
    horaColombia: startTime.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    offsetMinutos: startTime.getTimezoneOffset()
  });
  
  const endTime = new Date(startTime.getTime() + (appointment.duracion || 60) * 60000);
  
  console.log('✅ createEventFromAppointment - Resultado:', {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    startTimeLocal: startTime.toString(),
    endTimeLocal: endTime.toString(),
    startTimeColombia: startTime.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    endTimeColombia: endTime.toLocaleString('es-CO', { timeZone: 'America/Bogota' })
  });
  
  return {
    id: `appointment-${appointment.id}`,
    title: `${appointment.paciente?.nombre || 'Sin nombre'} ${appointment.paciente?.apellido || ''}`,
    description: appointment.motivoConsulta || appointment.tipoConsulta,
    startTime,
    endTime,
    type: 'appointment',
    status: appointment.estado as AppointmentStatus,
    backgroundColor: getEventColor('appointment', appointment.estado),
    textColor: '#ffffff',
    extendedProps: {
      patientId: appointment.paciente?.id,
      doctorId: appointment.doctorId,
      serviceType: appointment.tipoConsulta,
      notes: appointment.motivoConsulta,
      phone: appointment.paciente?.telefono,
      email: appointment.paciente?.email,
      // Información adicional para debugging
      originalFechaHora: appointment.fechaHora,
      parsedCorrectly: true
    },
  };
};

export const createEventFromRequest = (request: any): CalendarEvent => {
  const startTime = new Date(request.fechaHora);
  const endTime = new Date(startTime.getTime() + (request.duracion || 60) * 60000);
  
  return {
    id: `request-${request.id}`,
    title: `📋 SOLICITUD: ${request.paciente.nombre} ${request.paciente.apellido}`,
    description: request.motivoConsulta,
    startTime,
    endTime,
    type: 'request',
    status: request.estado as AppointmentStatus,
    backgroundColor: getEventColor('request', request.estado),
    textColor: '#ffffff',
    extendedProps: {
      patientId: request.paciente.id,
      serviceType: request.tipoConsulta,
      notes: request.motivoConsulta,
      phone: request.paciente.telefono,
      email: request.paciente.email,
    },
  };
};
