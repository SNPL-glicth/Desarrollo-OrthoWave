import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarEvent, 
  CalendarConfig, 
  CalendarView, 
  CalendarHookReturn 
} from '../types/calendar';
import { 
  navigateDate, 
  createEventFromAppointment, 
  createEventFromRequest 
} from '../components/calendar/utils/calendarUtils';
import { citasService } from '../services/citasService';
import { useAuth } from '../context/AuthContext';
import { getCurrentDate } from '../utils/dateUtils';

// Función para obtener la configuración por defecto con fecha actual
const getDefaultConfig = (): CalendarConfig => ({
  view: 'dayGridMonth' as CalendarView,
  initialDate: getCurrentDate(), // Usar getCurrentDate() en lugar de new Date()
  businessHours: {
    start: '08:00',
    end: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
  },
  timeSlotDuration: 30,
  locale: 'es',
  timezone: 'America/Bogota', // Zona horaria fija para Colombia
  theme: 'light',
  features: {
    dragAndDrop: true,
    resize: true,
    selection: true,
    weekends: true,
  },
});

export const useGoogleCalendar = (initialConfig?: Partial<CalendarConfig>): CalendarHookReturn => {
  const { user } = useAuth();
  
  // Usar la fecha actual siempre - crear nueva instancia cada vez
  const [currentDate, setCurrentDate] = useState<Date>(() => getCurrentDate());
  const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [config, setConfig] = useState<CalendarConfig>(() => ({
    ...getDefaultConfig(),
    ...initialConfig,
    initialDate: getCurrentDate(), // Siempre usar fecha actual
    view: 'dayGridMonth'
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Asegurar que el calendario siempre comience en la fecha actual al montar
  useEffect(() => {
    const today = getCurrentDate();
    setCurrentDate(today);
    setConfig(prev => ({ 
      ...prev, 
      initialDate: today,
      view: currentView 
    }));
  }, []); // Solo ejecutar una vez al montar

  // Sincronizar configuración cuando cambie currentDate o currentView
  useEffect(() => {
    setConfig(prev => ({ 
      ...prev, 
      initialDate: currentDate,
      view: currentView 
    }));
  }, [currentDate, currentView]);

  // Función para obtener eventos desde el backend
  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener citas del doctor
      let appointments: any[] = [];
      if (user.rol === 'doctor') {
        appointments = await citasService.obtenerCitasPorDoctor(Number(user.id));
      } else if (user.rol === 'paciente') {
        appointments = await citasService.obtenerCitasPorPaciente(Number(user.id));
      }

      // Convertir citas a eventos del calendario
      const calendarEvents = appointments.map(createEventFromAppointment);

      // Aquí puedes agregar solicitudes de citas si es necesario
      // const requests = await fetchAppointmentRequests();
      // const requestEvents = requests.map(createEventFromRequest);
      // calendarEvents.push(...requestEvents);

      setEvents(calendarEvents);
    } catch (err: any) {
      console.error('Error al obtener eventos del calendario:', err);
      setError(err.message || 'Error al cargar los eventos del calendario');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.rol]);

  // Cargar eventos cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id, fetchEvents]);

  // Navegación
  const nextPeriod = useCallback(() => {
    setCurrentDate(prev => navigateDate(prev, currentView, 'next'));
  }, [currentView]);

  const previousPeriod = useCallback(() => {
    setCurrentDate(prev => navigateDate(prev, currentView, 'prev'));
  }, [currentView]);

  const goToToday = useCallback(() => {
    setCurrentDate(getCurrentDate());
  }, []);

  // CRUD de eventos
  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      // Aquí implementarías la lógica para crear una nueva cita
      // const newAppointment = await citasService.crearCita({...});
      // const newEvent = createEventFromAppointment(newAppointment);
      // setEvents(prev => [...prev, newEvent]);
      
      // Por ahora, solo refrescamos los eventos
      await fetchEvents();
    } catch (err: any) {
      console.error('Error al crear evento:', err);
      setError(err.message || 'Error al crear el evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchEvents]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      // Extraer el ID numérico del evento
      const numericId = parseInt(id.replace(/^(appointment-|request-)/, ''));
      
      // Aquí implementarías la lógica para actualizar la cita
      // await citasService.actualizarCita(numericId, updates);
      
      // Por ahora, solo refrescamos los eventos
      await fetchEvents();
    } catch (err: any) {
      console.error('Error al actualizar evento:', err);
      setError(err.message || 'Error al actualizar el evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      // Extraer el ID numérico del evento
      const numericId = parseInt(id.replace(/^(appointment-|request-)/, ''));
      
      // Aquí implementarías la lógica para eliminar la cita
      // await citasService.eliminarCita(numericId);
      
      // Por ahora, solo refrescamos los eventos
      await fetchEvents();
    } catch (err: any) {
      console.error('Error al eliminar evento:', err);
      setError(err.message || 'Error al eliminar el evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchEvents]);

  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Actualizar configuración
  const updateConfig = useCallback((newConfig: Partial<CalendarConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Cambiar vista (la configuración se actualiza automáticamente en useEffect)
  const changeView = useCallback((view: CalendarView) => {
    setCurrentView(view);
  }, []);

  return {
    currentDate,
    currentView,
    events,
    config,
    loading,
    error,
    
    // Actions
    setCurrentDate,
    setCurrentView: changeView,
    nextPeriod,
    previousPeriod,
    goToToday,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
};
