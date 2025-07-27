import { useState, useEffect, useCallback, useRef } from 'react';
import { citasService, Cita } from '../services/citasService';
import { useAuth } from '../context/AuthContext';

interface UsePollingCitasOptions {
  interval?: number; // Intervalo en milisegundos, por defecto 30 segundos
  enabled?: boolean; // Si el polling está habilitado
  timeout?: number; // Tiempo límite para cada petición en milisegundos, por defecto 10 segundos
  maxRetries?: number; // Número máximo de reintentos, por defecto 3
  onError?: (error: Error) => void;
  onUpdate?: (citas: Cita[]) => void;
}

export const usePollingCitas = (options: UsePollingCitasOptions = {}) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [, setRetryCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const lastSuccessfulFetch = useRef<number>(0);
  const consecutiveErrors = useRef<number>(0);

  const {
    interval = 30000, // 30 segundos por defecto
    enabled = true,
    timeout = 8000, // 8 segundos de timeout por defecto
    maxRetries = 2, // 2 reintentos por defecto
    onError,
    onUpdate
  } = options;

  // Función para cargar las citas con timeout y reintentos mejorado
  const loadCitas = useCallback(async (showLoading = true, currentRetry = 0) => {
    if (!user?.id || !user?.rol) {
      setLoading(false);
      return;
    }

    // Evitar peticiones concurrentes
    if (isLoadingRef.current) {
      console.log('Petición ya en curso, evitando duplicado');
      return;
    }

    // Verificar si han pasado suficientes errores consecutivos para pausar
    if (consecutiveErrors.current >= 5) {
      console.log('Demasiados errores consecutivos, pausando polling por 2 minutos');
      setTimeout(() => {
        consecutiveErrors.current = 0;
      }, 120000); // 2 minutos
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      console.log('Cancelando petición anterior...');
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    isLoadingRef.current = true;
    
    // Crear timeout mejorado
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current && !signal.aborted) {
        console.log(`Timeout alcanzado (${timeout}ms), cancelando petición...`);
        abortControllerRef.current.abort();
      }
    }, timeout);

    try {
      if (showLoading) setLoading(true);
      setError(null);

      console.log(`Cargando citas para usuario: ${user.id}, rol: ${user.rol} (intento ${currentRetry + 1}/${maxRetries + 1})`);
      
      // Verificar si ya fue cancelada antes de hacer la petición
      if (signal.aborted) {
        console.log('Petición cancelada antes de iniciarse');
        return;
      }
      
      const citasData = await citasService.recargarCitas(
        typeof user.id === 'string' ? parseInt(user.id) : user.id, 
        user.rol,
        signal // Pasar signal para cancelación
      );
      
      // Verificar si fue cancelada después de la petición
      if (signal.aborted) {
        console.log('Petición cancelada después de completarse');
        return;
      }
      
      console.log('Citas cargadas exitosamente:', citasData);
      console.log('Tipo de datos recibidos:', typeof citasData, 'Es array:', Array.isArray(citasData));
      
      // Limpiar timeout si la petición fue exitosa
      clearTimeout(timeoutId);
      
      // Asegurar que citasData sea un array
      const citasArray = Array.isArray(citasData) ? citasData : [];
      
      setCitas(citasArray);
      setLastUpdate(new Date());
      setRetryCount(0); // Resetear contador de reintentos
      consecutiveErrors.current = 0; // Resetear errores consecutivos
      lastSuccessfulFetch.current = Date.now();
      
      if (onUpdate) {
        onUpdate(citasArray);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // Si fue cancelada intencionalmente, no es un error
      if (signal.aborted) {
        console.log('Petición cancelada por AbortController');
        return;
      }
      
      consecutiveErrors.current++;
      
      // Si fue cancelada por timeout o abort, intentar reintento
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        console.warn(`Petición falló por timeout/abort (intento ${currentRetry + 1}/${maxRetries + 1})`);
        
        if (currentRetry < maxRetries) {
          console.log(`Reintentando en ${1000 * (currentRetry + 1)}ms...`);
          setRetryCount(currentRetry + 1);
          
          // Esperar un poco antes de reintentar con backoff exponencial
          setTimeout(() => {
            loadCitas(false, currentRetry + 1);
          }, 1000 * (currentRetry + 1));
          
          return;
        } else {
          console.error('Se agotaron todos los reintentos');
        }
      }
      
      console.error('Error al cargar citas:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar las citas';
      setError(errorMessage);
      setRetryCount(0);
      
      if (onError) {
        onError(new Error(errorMessage));
      }
    } finally {
      if (showLoading) setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?.id, user?.rol, timeout, maxRetries, onUpdate, onError]);

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
    if (!enabled || !user?.id || !user?.rol) {
      setLoading(false);
      return;
    }

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
        intervalRef.current = null;
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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
