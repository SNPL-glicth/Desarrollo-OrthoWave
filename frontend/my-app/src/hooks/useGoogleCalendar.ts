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

const defaultConfig: CalendarConfig = {
  view: 'dayGridMonth' as CalendarView,
  initialDate: new Date(),
  businessHours: {
    start: '08:00',
    end: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
  },
  timeSlotDuration: 30,
  locale: 'es',
  timezone: 'America/Bogota',
  theme: 'light',
  features: {
    dragAndDrop: true,
    resize: true,
    selection: true,
    weekends: true,
  },
};

export const useGoogleCalendar = (initialConfig?: Partial<CalendarConfig>): CalendarHookReturn => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [config, setConfig] = useState<CalendarConfig>({
    ...defaultConfig,
    ...initialConfig,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar la fecha actual con la configuración
  useEffect(() => {
    setConfig(prev => ({ ...prev, initialDate: currentDate }));
  }, [currentDate]);

  // Asegurar que la vista esté sincronizada
  useEffect(() => {
    setConfig(prev => ({ ...prev, view: currentView }));
  }, [currentView]);

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
    setCurrentDate(new Date());
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

  // Cambiar vista y actualizar configuración
  const changeView = useCallback((view: CalendarView) => {
    setCurrentView(view);
    updateConfig({ view });
  }, [updateConfig]);

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
