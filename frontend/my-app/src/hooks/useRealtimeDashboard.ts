import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from './useWebSocket.ts';
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
    if (!user) return;

    // Evitar múltiples llamadas simultáneas
    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(endpoint);
      
      setData(response.data);
      setLastUpdated(new Date());
      
      console.log(`Dashboard data updated from ${endpoint}:`, response.data);
    } catch (err: any) {
      console.error(`Error fetching dashboard data from ${endpoint}:`, err);
      setError(err.response?.data?.message || 'Error al cargar los datos del dashboard');
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

    // Registrar listeners
    socket.on('dashboard_update', handleDashboardUpdate);
    socket.on('cita_update', handleCitaUpdate);
    socket.on('user_update', handleUserUpdate);
    socket.on('system_update', handleSystemUpdate);

    return () => {
      socket.off('dashboard_update', handleDashboardUpdate);
      socket.off('cita_update', handleCitaUpdate);
      socket.off('user_update', handleUserUpdate);
      socket.off('system_update', handleSystemUpdate);
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
