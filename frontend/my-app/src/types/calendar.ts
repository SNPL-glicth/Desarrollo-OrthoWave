// Tipos para el nuevo sistema de calendario - Compatibles con FullCalendar
export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export type EventType = 'appointment' | 'request' | 'blocked' | 'available';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'in_progress' 
  | 'no_show'
  | 'pending';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  status: AppointmentStatus;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  allDay?: boolean;
  editable?: boolean;
  extendedProps?: {
    patientId?: number;
    doctorId?: number;
    serviceType?: string;
    notes?: string;
    phone?: string;
    email?: string;
    [key: string]: any;
  };
}

export interface CalendarConfig {
  view: CalendarView;
  initialDate?: Date;
  businessHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  timeSlotDuration: number; // en minutos
  locale: string;
  timezone: string;
  theme: 'light' | 'dark';
  features: {
    dragAndDrop: boolean;
    resize: boolean;
    selection: boolean;
    weekends: boolean;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
  events: CalendarEvent[];
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  isBlocked: boolean;
  events: CalendarEvent[];
  timeSlots: TimeSlot[];
}

export interface CalendarProps {
  events: CalendarEvent[];
  config: CalendarConfig;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onEventResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  onDateChange?: (date: Date) => void;
  className?: string;
}

export interface CalendarHookReturn {
  currentDate: Date;
  currentView: CalendarView;
  events: CalendarEvent[];
  config: CalendarConfig;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: CalendarView) => void;
  nextPeriod: () => void;
  previousPeriod: () => void;
  goToToday: () => void;
  createEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

