import { useState, useEffect, useCallback, useRef } from 'react';
import { citasService, Cita } from '../services/citasService.ts';
import { useAuth } from '../context/AuthContext';

interface UsePollingCitasOptions {
  interval?: number; // Intervalo en milisegundos, por defecto 30 segundos
  enabled?: boolean; // Si el polling está habilitado
  onError?: (error: Error) => void;
  onUpdate?: (citas: Cita[]) => void;
}

export const usePollingCitas = (options: UsePollingCitasOptions = {}) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const {
    interval = 30000, // 30 segundos por defecto
    enabled = true,
    onError,
    onUpdate
  } = options;

  // Función para cargar las citas
  const loadCitas = useCallback(async (showLoading = true) => {
    if (!user?.id || !user?.rol) return;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const citasData = await citasService.recargarCitas(user.id, user.rol);
      setCitas(citasData);
      setLastUpdate(new Date());
      
      if (onUpdate) {
        onUpdate(citasData);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las citas';
      setError(errorMessage);
      
      if (onError) {
        onError(new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.rol, onError, onUpdate]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    loadCitas(false);
  }, [loadCitas]);

  // Función para pausar el polling
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para reanudar el polling
  const resume = useCallback(() => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(() => {
        loadCitas(false);
      }, interval);
    }
  }, [enabled, interval, loadCitas]);

  // Efecto para manejar el polling
  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Carga inicial
    loadCitas(true);

    // Configurar polling
    intervalRef.current = setInterval(() => {
      loadCitas(false);
    }, interval);

    // Suscribirse a cambios del servicio
    const unsubscribeUpdated = citasService.onCitaUpdated((citaActualizada) => {
      setCitas(prev => 
        prev.map(cita => 
          cita.id === citaActualizada.id ? citaActualizada : cita
        )
      );
      setLastUpdate(new Date());
    });

    const unsubscribeCreated = citasService.onCitaCreated((nuevaCita) => {
      // Solo agregar si es relevante para el usuario actual
      if (
        (user.rol === 'paciente' && nuevaCita.pacienteId === user.id) ||
        (user.rol === 'doctor' && nuevaCita.doctorId === user.id)
      ) {
        setCitas(prev => [...prev, nuevaCita]);
        setLastUpdate(new Date());
      }
    });

    const unsubscribeChanged = citasService.onCitasChanged((citasActualizadas) => {
      setCitas(citasActualizadas);
      setLastUpdate(new Date());
    });

    // Combinar funciones de limpieza
    unsubscribeRef.current = () => {
      unsubscribeUpdated();
      unsubscribeCreated();
      unsubscribeChanged();
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [enabled, user?.id, user?.rol, interval, loadCitas]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    citas,
    loading,
    error,
    lastUpdate,
    refresh,
    pause,
    resume,
    isPolling: intervalRef.current !== null
  };
};

export default usePollingCitas;
