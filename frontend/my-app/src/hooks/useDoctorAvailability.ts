import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import api from '../services/api';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isOccupied: boolean;
  citaId?: number;
  estado?: string;
}

interface DoctorSchedule {
  doctorId: number;
  date: string;
  timeSlots: TimeSlot[];
  workingHours: {
    start: string;
    end: string;
    interval: number; // minutos
  };
  isLoading: boolean;
  error: string | null;
}

interface UseDoctorAvailabilityProps {
  doctorId: number;
  selectedDate: Date;
  refreshInterval?: number; // ms para auto-refresh
}

export const useDoctorAvailability = ({
  doctorId,
  selectedDate,
  refreshInterval = 30000 // 30 segundos por defecto
}: UseDoctorAvailabilityProps) => {
  const [schedule, setSchedule] = useState<DoctorSchedule>({
    doctorId,
    date: format(selectedDate, 'yyyy-MM-dd'),
    timeSlots: [],
    workingHours: {
      start: '08:00',
      end: '17:00',
      interval: 20
    },
    isLoading: true,
    error: null
  });

  const [cache, setCache] = useState<Map<string, DoctorSchedule>>(new Map());

  // Generar clave única para caché
  const cacheKey = useMemo(() => 
    `${doctorId}-${format(selectedDate, 'yyyy-MM-dd')}`, 
    [doctorId, selectedDate]
  );

  // Generar slots de tiempo basados en horario de trabajo
  const generateTimeSlots = useCallback((
    startTime: string, 
    endTime: string, 
    interval: number
  ): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      
      currentMinute += interval;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    
    return slots;
  }, []);

  // Obtener disponibilidad del doctor para una fecha específica
  const fetchDoctorAvailability = useCallback(async (
    docId: number, 
    date: Date
  ): Promise<DoctorSchedule> => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    try {
      // Obtener configuración del doctor y citas del día
      const [doctorConfigResponse, appointmentsResponse] = await Promise.all([
        api.get(`/perfil-medico/usuario/${docId}`),
        api.get(`/citas/doctor/${docId}/agenda/${dateString}`)
      ]);

      const doctorConfig = doctorConfigResponse.data || {
        horaInicio: '08:00',
        horaFin: '17:00',
        duracionConsultaDefault: 20
      };

      const appointments = appointmentsResponse.data?.citas || [];

      // Generar slots disponibles con intervalos fijos de 20 minutos
      const timeSlots = generateTimeSlots(
        doctorConfig.horaInicio,
        doctorConfig.horaFin,
        20  // Intervalos fijos de 20 minutos
      );

      // Crear mapa de ocupación
      const occupiedSlots = new Map<string, any>();
      appointments.forEach((appointment: any) => {
        const appointmentTime = format(new Date(appointment.fechaHora), 'HH:mm');
        occupiedSlots.set(appointmentTime, appointment);
      });

      // Generar timeSlots con estado
      const slotsWithStatus: TimeSlot[] = timeSlots.map(time => {
        const occupied = occupiedSlots.get(time);
        const isOccupied = !!occupied;
        return {
          time,
          isAvailable: !isOccupied,
          isOccupied,
          citaId: occupied?.id,
          estado: occupied?.estado
        };
      });
      
      console.log(`📅 Slots generados para ${dateString}:`, {
        totalSlots: slotsWithStatus.length,
        availableSlots: slotsWithStatus.filter(s => s.isAvailable).length,
        occupiedSlots: slotsWithStatus.filter(s => s.isOccupied).length,
        appointments: appointments.length
      });

      return {
        doctorId: docId,
        date: dateString,
        timeSlots: slotsWithStatus,
        workingHours: {
          start: doctorConfig.horaInicio,
          end: doctorConfig.horaFin,
          interval: doctorConfig.duracionConsultaDefault
        },
        isLoading: false,
        error: null
      };

    } catch (error: any) {
      console.error(`Error fetching availability for doctor ${docId}:`, error);
      return {
        doctorId: docId,
        date: dateString,
        timeSlots: [],
        workingHours: {
          start: '08:00',
          end: '17:00',
          interval: 20
        },
        isLoading: false,
        error: error.message || 'Error al cargar disponibilidad'
      };
    }
  }, [generateTimeSlots]);

  // Cargar disponibilidad con caché
  const loadAvailability = useCallback(async () => {
    // Verificar caché primero
    const cachedData = cache.get(cacheKey);
    if (cachedData && !cachedData.isLoading) {
      setSchedule(cachedData);
      return;
    }

    setSchedule(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newSchedule = await fetchDoctorAvailability(doctorId, selectedDate);
      
      // Actualizar caché
      setCache(prevCache => new Map(prevCache.set(cacheKey, newSchedule)));
      setSchedule(newSchedule);
      
    } catch (error: any) {
      const errorSchedule = {
        doctorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlots: [],
        workingHours: {
          start: '08:00',
          end: '17:00',
          interval: 20
        },
        isLoading: false,
        error: error.message || 'Error al cargar disponibilidad'
      };
      
      setSchedule(errorSchedule);
    }
  }, [doctorId, selectedDate, cacheKey, cache, fetchDoctorAvailability]);

  // Invalidar caché para un doctor específico
  const invalidateCache = useCallback((docId?: number) => {
    if (docId) {
      const keysToDelete = Array.from(cache.keys()).filter(key => key.startsWith(`${docId}-`));
      keysToDelete.forEach(key => cache.delete(key));
      setCache(new Map(cache));
    } else {
      setCache(new Map());
    }
  }, [cache]);

  // Refrescar disponibilidad
  const refreshAvailability = useCallback(() => {
    invalidateCache(doctorId);
    loadAvailability();
  }, [doctorId, invalidateCache, loadAvailability]);

  // Verificar si un slot específico está disponible
  const isSlotAvailable = useCallback((time: string): boolean => {
    const slot = schedule.timeSlots.find(s => s.time === time);
    return slot ? slot.isAvailable : false;
  }, [schedule.timeSlots]);

  // Obtener slots disponibles
  const availableSlots = useMemo(() => 
    schedule.timeSlots.filter(slot => slot.isAvailable),
    [schedule.timeSlots]
  );

  // Obtener slots ocupados
  const occupiedSlots = useMemo(() => 
    schedule.timeSlots.filter(slot => slot.isOccupied),
    [schedule.timeSlots]
  );

  // Cargar disponibilidad al inicializar o cambiar parámetros
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Auto-refresh opcional
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refreshAvailability, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshAvailability]);

  // Limpiar caché antiguo (más de 1 hora)
  useEffect(() => {
    const cleanup = () => {
      const oneHourAgo = Date.now() - 3600000;
      const keysToDelete: string[] = [];
      
      cache.forEach((value, key) => {
        // Si el caché es muy antiguo, eliminarlo
        if (Date.now() - oneHourAgo > 0) {
          keysToDelete.push(key);
        }
      });
      
      if (keysToDelete.length > 0) {
        keysToDelete.forEach(key => cache.delete(key));
        setCache(new Map(cache));
      }
    };

    const cleanupInterval = setInterval(cleanup, 300000); // 5 minutos
    return () => clearInterval(cleanupInterval);
  }, [cache]);

  return {
    schedule,
    availableSlots,
    occupiedSlots,
    isLoading: schedule.isLoading,
    error: schedule.error,
    refreshAvailability,
    isSlotAvailable,
    invalidateCache
  };
};
