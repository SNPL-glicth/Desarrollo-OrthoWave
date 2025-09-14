import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from './useWebSocket';
import api from '../services/api';

interface DashboardData {
  [key: string]: any;
}

interface RealtimeDashboardHook {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const useRealtimeDashboard = (
  endpoint: string,
  pollingInterval: number = 30000 // 30 segundos por defecto
): RealtimeDashboardHook => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('No user found, skipping fetch');
      return;
    }

    // Evitar múltiples llamadas simultáneas
    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < 1000) {
      console.log('Skipping fetch due to rate limiting');
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching data from ${endpoint}...`);
      const response = await api.get(endpoint);
      
      setData(response.data || {});
      setLastUpdated(new Date());
      
      console.log(`Dashboard data updated from ${endpoint}:`, response.data);
    } catch (err: any) {
      console.error(`Error fetching dashboard data from ${endpoint}:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar los datos del dashboard';
      setError(errorMessage);
      
      // No establecer data como vacío en caso de error para evitar bucles
      // setData({});
    } finally {
      setLoading(false);
    }
  }, [endpoint, user]);

  const refreshData = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const forceRefresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Configurar polling inteligente
  useEffect(() => {
    if (!user) return;

    // Cargar datos iniciales
    fetchData(true);

    // Configurar polling solo si no hay WebSocket conectado
    if (!isConnected) {
      pollingRef.current = setInterval(() => {
        fetchData(false);
      }, pollingInterval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [user, isConnected, pollingInterval, fetchData]);

  // Escuchar eventos de WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleDashboardUpdate = (updateData: any) => {
      console.log('Dashboard update received:', updateData);
      // Actualizar datos inmediatamente
      fetchData(true);
    };

    const handleCitaUpdate = (updateData: any) => {
      console.log('Cita update received:', updateData);
      // Actualizar si el usuario está involucrado
      if (user && (updateData.doctorId === user.id || updateData.pacienteId === user.id)) {
        fetchData(true);
      }
    };

    const handleUserUpdate = (updateData: any) => {
      console.log('User update received:', updateData);
      // Actualizar si es información relevante para el usuario actual
      if (user && (updateData.userId === user.id || user.rol === 'admin')) {
        fetchData(true);
      }
    };

    const handleSystemUpdate = (updateData: any) => {
      console.log('System update received:', updateData);
      // Actualizar datos del sistema
      fetchData(true);
    };

    // Listeners para eventos específicos de datos
    const handleDashboardDataUpdate = (updateData: any) => {
      console.log('Dashboard data update received:', updateData);
      fetchData(true);
    };

    const handleRoleDashboardUpdate = (updateData: any) => {
      console.log('Role dashboard update received:', updateData);
      fetchData(true);
    };

    const handleListUpdate = (updateData: any) => {
      console.log('List update received:', updateData);
      fetchData(true);
    };

    const handleAppointmentEvents = (updateData: any) => {
      console.log('Appointment event received:', updateData);
      // Solo actualizar si es relevante para el usuario
      if (user && (updateData.doctorId === user.id || updateData.pacienteId === user.id || user.rol === 'admin')) {
        fetchData(true);
      }
    };

    const handleUserEvents = (updateData: any) => {
      console.log('User event received:', updateData);
      // Actualizar si es admin o si es el mismo usuario
      if (user && (user.rol === 'admin' || updateData.userId === user.id)) {
        fetchData(true);
      }
    };

    const handleCounterUpdate = (updateData: any) => {
      console.log('Counter update received:', updateData);
      fetchData(true);
    };

    const handleScheduleUpdate = (updateData: any) => {
      console.log('Schedule update received:', updateData);
      // Actualizar si es un doctor o admin
      if (user && (user.rol === 'doctor' || user.rol === 'admin')) {
        fetchData(true);
      }
    };

    // Registrar SOLO listeners CRÍTICOS para evitar saturación
    
    // 1. Eventos esenciales de notificaciones y contadores
    socket.on('counter_update', handleCounterUpdate);
    
    // 2. Solo cambios de estado críticos de citas
    socket.on('appointment_status_changed', handleAppointmentEvents);
    
    // 3. Solo nuevos doctores (importante para pacientes)
    socket.on('new_user_registered', handleUserEvents);
    
    // 4. Solo cambios de horarios/disponibilidad
    socket.on('schedule_updated', handleScheduleUpdate);
    socket.on('calendar_sync', handleScheduleUpdate);

    return () => {
      // Limpiar solo listeners críticos
      socket.off('counter_update', handleCounterUpdate);
      socket.off('appointment_status_changed', handleAppointmentEvents);
      socket.off('new_user_registered', handleUserEvents);
      socket.off('schedule_updated', handleScheduleUpdate);
      socket.off('calendar_sync', handleScheduleUpdate);
    };
  }, [socket, isConnected, user, fetchData]);

  // Actualizar cuando la conexión WebSocket se establece
  useEffect(() => {
    if (isConnected && socket) {
      // Detener polling cuando WebSocket está conectado
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      // Actualizar datos inmediatamente
      fetchData(true);
    }
  }, [isConnected, socket, fetchData]);

  // Actualizar cuando el usuario cambia
  useEffect(() => {
    if (user) {
      fetchData(true);
    }
  }, [user, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    forceRefresh
  };
};

export default useRealtimeDashboard;
