import { useState, useEffect, useCallback } from 'react';
import { citasService, Cita } from '../services/citasService';
import { useAuth } from '../context/AuthContext';

interface UseCitasSinPollingOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en minutos, no milisegundos
  onError?: (error: Error) => void;
  onUpdate?: (citas: Cita[]) => void;
}

export const useCitasSinPolling = (options: UseCitasSinPollingOptions = {}) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const {
    autoRefresh = false,
    refreshInterval = 5, // 5 minutos por defecto
    onError,
    onUpdate
  } = options;

  // Función simple para cargar citas UNA vez
  const loadCitas = useCallback(async (showLoading = true) => {
    if (!user?.id || !user?.rol) {
      console.log('👤 No hay usuario autenticado, no se cargan citas');
      setLoading(false);
      return;
    }

    console.log(`📋 Cargando citas para usuario ${user.id} (${user.rol})`);
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      let citasData: Cita[] = [];
      
      if (user.rol === 'paciente') {
        citasData = await citasService.obtenerCitasPorPaciente(Number(user.id));
      } else if (user.rol === 'doctor') {
        citasData = await citasService.obtenerCitasPorDoctor(Number(user.id));
      }
      
      // Asegurar que sea un array
      const citasArray = Array.isArray(citasData) ? citasData : [];
      
      console.log(`✅ Citas cargadas: ${citasArray.length} citas encontradas`);
      
      setCitas(citasArray);
      setLastUpdate(new Date());
      
      if (onUpdate) {
        onUpdate(citasArray);
      }
      
    } catch (err: any) {
      console.error('❌ Error al cargar citas:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar las citas';
      setError(errorMessage);
      
      if (onError) {
        onError(new Error(errorMessage));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id, user?.rol, onUpdate, onError]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    console.log('🔄 Refresh manual solicitado');
    loadCitas(false);
  }, [loadCitas]);

  // Efecto para cargar citas inicialmente
  useEffect(() => {
    console.log('🚀 Iniciando carga inicial de citas');
    loadCitas(true);
  }, [loadCitas]);

  // Efecto para auto-refresh opcional (SIN polling continuo)
  useEffect(() => {
    if (!autoRefresh || !user?.id) {
      return;
    }

    console.log(`⏰ Configurando auto-refresh cada ${refreshInterval} minutos`);
    
    const intervalId = setInterval(() => {
      console.log('⏰ Auto-refresh ejecutándose...');
      loadCitas(false);
    }, refreshInterval * 60 * 1000); // convertir minutos a milisegundos

    return () => {
      console.log('🛑 Limpiando auto-refresh');
      clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval, loadCitas, user?.id]);

  // Suscribirse a eventos del servicio para updates en tiempo real
  useEffect(() => {
    const unsubscribeUpdated = citasService.onCitaUpdated((citaActualizada) => {
      console.log('📝 Cita actualizada recibida:', citaActualizada.id);
      setCitas(prev => 
        prev.map(cita => 
          cita.id === citaActualizada.id ? citaActualizada : cita
        )
      );
      setLastUpdate(new Date());
    });

    const unsubscribeCreated = citasService.onCitaCreated((nuevaCita) => {
      console.log('➕ Nueva cita recibida:', nuevaCita.id);
      // Solo agregar si es relevante para el usuario actual
      if (
        (user?.rol === 'paciente' && nuevaCita.pacienteId === Number(user.id)) ||
        (user?.rol === 'doctor' && nuevaCita.doctorId === Number(user.id))
      ) {
        setCitas(prev => [...prev, nuevaCita]);
        setLastUpdate(new Date());
      }
    });

    const unsubscribeChanged = citasService.onCitasChanged((citasActualizadas) => {
      console.log('🔄 Cambio en citas recibido:', citasActualizadas.length);
      setCitas(citasActualizadas);
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribeUpdated();
      unsubscribeCreated();
      unsubscribeChanged();
    };
  }, [user?.id, user?.rol]);

  return {
    citas,
    loading,
    error,
    lastUpdate,
    refresh,
    isLoading: loading
  };
};

export default useCitasSinPolling;
