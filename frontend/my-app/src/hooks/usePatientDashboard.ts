import { useState, useEffect, useMemo } from 'react';
import { useRealtimeDashboard } from './useRealtimeDashboard';
import { useAuth } from '../context/AuthContext';

interface PatientStats {
  citasProximas: number;
  tratamientosActivos: number;
  historialesSubidos: number;
}

interface Cita {
  id: number;
  doctor?: {
    nombre: string;
    apellido: string;
  };
  fechaHora: string;
  tipoConsulta: string;
  estado: string;
  motivoConsulta?: string;
}

interface Tratamiento {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  duracionEstimada: string;
  progreso: number;
  estadoTratamiento: string;
}

interface Historial {
  id: number;
  nombre: string;
  tipo: string;
  fechaSubida: string;
  descripcion?: string;
  archivoUrl?: string;
}

interface PatientDashboardData {
  estadisticas: PatientStats;
  citasProximas: Cita[];
  citasPasadas: Cita[];
  tratamientosActivos: Tratamiento[];
  historialesRecientes: Historial[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const usePatientDashboard = (): PatientDashboardData => {
  const { user } = useAuth();
  const [processingData, setProcessingData] = useState(false);
  
  // Usar el hook de tiempo real para obtener resumen del paciente
  const dashboardHook = useRealtimeDashboard('/dashboard/citas/resumen-paciente', 20000);

  // Procesar datos
  const processedData = useMemo(() => {
    if (!dashboardHook.data) {
      return {
        estadisticas: {
          citasProximas: 0,
          tratamientosActivos: 0,
          historialesSubidos: 0
        },
        citasProximas: [],
        citasPasadas: [],
        tratamientosActivos: [],
        historialesRecientes: []
      };
    }

    const dashboardData = dashboardHook.data;

    // Obtener datos del dashboard
    const citasProximas = dashboardData.proximasCitas || [];
    const citasPasadas = dashboardData.ultimasCitas || [];
    const tratamientosActivos = dashboardData.tratamientosActivos || [];
    const historialesRecientes = dashboardData.historialesRecientes || [];

    // Crear estadísticas basadas en datos reales
    const estadisticas = {
      citasProximas: citasProximas.length,
      tratamientosActivos: tratamientosActivos.length,
      historialesSubidos: historialesRecientes.length
    };

    return {
      estadisticas,
      citasProximas,
      citasPasadas,
      tratamientosActivos,
      historialesRecientes
    };
  }, [dashboardHook.data]);

  // Función para actualizar datos
  const refreshAll = async () => {
    setProcessingData(true);
    try {
      await dashboardHook.refreshData();
    } finally {
      setProcessingData(false);
    }
  };

  // Función para forzar actualización
  const forceRefreshAll = async () => {
    setProcessingData(true);
    try {
      await dashboardHook.forceRefresh();
    } finally {
      setProcessingData(false);
    }
  };

  return {
    ...processedData,
    loading: dashboardHook.loading || processingData,
    error: dashboardHook.error,
    lastUpdated: dashboardHook.lastUpdated,
    refresh: refreshAll,
    forceRefresh: forceRefreshAll
  };
};
