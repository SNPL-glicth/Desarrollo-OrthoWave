import { useState, useMemo } from 'react';
import { useRealtimeDashboard } from './useRealtimeDashboard';

interface AdminStats {
  usuariosActivos: number;
  doctores: number;
  pacientes: number;
  total: number;
}

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  isVerified: boolean;
  fechaCreacion: string;
  rol: {
    id: number;
    nombre: string;
  };
}

interface AdminDashboardData {
  estadisticas: AdminStats;
  usuarios: User[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const useAdminDashboard = (): AdminDashboardData => {
  const [processingData, setProcessingData] = useState(false);
  
  // Usar el hook de tiempo real para obtener estadísticas
  const statsHook = useRealtimeDashboard('/users/admin/estadisticas', 30000);
  
  // Usar el hook de tiempo real para obtener usuarios
  const usersHook = useRealtimeDashboard('/users/admin', 20000);

  // Procesar y combinar datos
  const processedData = useMemo(() => {
    if (!statsHook.data || !usersHook.data) {
      return {
        estadisticas: {
          usuariosActivos: 0,
          doctores: 0,
          pacientes: 0,
          total: 0
        },
        usuarios: []
      };
    }

    const statsData = statsHook.data;
    const usersData = usersHook.data;

    // Verificar que statsData tiene la estructura esperada
    if (!statsData || typeof statsData !== 'object') {
      console.warn('statsData no tiene la estructura esperada:', statsData);
      return {
        estadisticas: {
          usuariosActivos: 0,
          doctores: 0,
          pacientes: 0,
          total: 0
        },
        usuarios: Array.isArray(usersData) ? usersData : []
      };
    }

    // Procesar estadísticas con validación segura
    const distribuciones = statsData.distribuciones || {};
    const estadisticas = {
      usuariosActivos: (distribuciones.doctores || 0) + (distribuciones.pacientes || 0),
      doctores: distribuciones.doctores || 0,
      pacientes: distribuciones.pacientes || 0,
      total: (statsData.total || 0) - (distribuciones.admins || 0)
    };

    // Los usuarios ya vienen procesados del backend
    const usuarios = Array.isArray(usersData) ? usersData : [];

    return {
      estadisticas,
      usuarios
    };
  }, [statsHook.data, usersHook.data]);

  // Función para actualizar ambos endpoints
  const refreshAll = async () => {
    setProcessingData(true);
    try {
      await Promise.all([
        statsHook.refreshData(),
        usersHook.refreshData()
      ]);
    } finally {
      setProcessingData(false);
    }
  };

  // Función para forzar actualización
  const forceRefreshAll = async () => {
    setProcessingData(true);
    try {
      await Promise.all([
        statsHook.forceRefresh(),
        usersHook.forceRefresh()
      ]);
    } finally {
      setProcessingData(false);
    }
  };

  return {
    ...processedData,
    loading: statsHook.loading || usersHook.loading || processingData,
    error: statsHook.error || usersHook.error,
    lastUpdated: statsHook.lastUpdated && usersHook.lastUpdated 
      ? new Date(Math.max(statsHook.lastUpdated.getTime(), usersHook.lastUpdated.getTime()))
      : statsHook.lastUpdated || usersHook.lastUpdated,
    refresh: refreshAll,
    forceRefresh: forceRefreshAll
  };
};
