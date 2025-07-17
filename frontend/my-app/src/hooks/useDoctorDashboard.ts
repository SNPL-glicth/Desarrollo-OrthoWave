import { useState, useEffect, useMemo } from 'react';
import { useRealtimeDashboard } from './useRealtimeDashboard';
import { useAuth } from '../context/AuthContext';

interface DoctorStats {
  citasHoy: number;
  citasPendientes: number;
  pacientesActivos: number;
  tratamientosActivos: number;
}

interface Cita {
  id: number;
  paciente: {
    nombre: string;
    apellido: string;
  };
  fechaHora: string;
  tipoConsulta: string;
  estado: string;
  motivoConsulta?: string;
}

interface PacienteReciente {
  id: number;
  nombre: string;
  apellido: string;
  edad?: number;
  ultimaCita: string;
  proximaCita?: string;
}

interface DashboardData {
  estadisticas: DoctorStats;
  citasHoy: Cita[];
  proximasCitas: Cita[];
  pacientesRecientes: PacienteReciente[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const useDoctorDashboard = (): DashboardData => {
  const { user } = useAuth();
  const [processingData, setProcessingData] = useState(false);
  
  // Usar el hook de tiempo real para obtener datos de la agenda
  const agendaHook = useRealtimeDashboard('/dashboard/citas/agenda-doctor', 15000);
  
  // Usar el hook de tiempo real para obtener estadísticas
  const statsHook = useRealtimeDashboard('/dashboard/citas/estadisticas', 30000);

  // Procesar y combinar datos
  const processedData = useMemo(() => {
    if (!agendaHook.data || !statsHook.data) {
      return {
        estadisticas: {
          citasHoy: 0,
          citasPendientes: 0,
          pacientesActivos: 0,
          tratamientosActivos: 0
        },
        citasHoy: [],
        proximasCitas: [],
        pacientesRecientes: []
      };
    }

    const agendaData = agendaHook.data;
    const statsData = statsHook.data;

    // Procesar datos de la agenda
    const citasHoy = agendaData.citasHoy || [];
    const proximasCitas = agendaData.proximasCitas || [];

    // Crear estadísticas basadas en datos reales
    const estadisticas = {
      citasHoy: agendaData.estadisticas?.citasHoy || 0,
      citasPendientes: agendaData.estadisticas?.citasPendientes || 0,
      pacientesActivos: statsData.totalCitas || 0,
      tratamientosActivos: agendaData.estadisticas?.citasCompletadas || 0
    };

    // Extraer pacientes recientes de las citas
    const pacientesRecientes = proximasCitas.slice(0, 3).map((cita: Cita) => ({
      id: cita.id,
      nombre: cita.paciente?.nombre || 'Sin nombre',
      apellido: cita.paciente?.apellido || '',
      edad: 0,
      ultimaCita: new Date(cita.fechaHora).toISOString().split('T')[0],
      proximaCita: new Date(cita.fechaHora).toISOString().split('T')[0]
    }));

    return {
      estadisticas,
      citasHoy,
      proximasCitas,
      pacientesRecientes
    };
  }, [agendaHook.data, statsHook.data]);

  // Función para actualizar ambos endpoints
  const refreshAll = async () => {
    setProcessingData(true);
    try {
      await Promise.all([
        agendaHook.refreshData(),
        statsHook.refreshData()
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
        agendaHook.forceRefresh(),
        statsHook.forceRefresh()
      ]);
    } finally {
      setProcessingData(false);
    }
  };

  return {
    ...processedData,
    loading: agendaHook.loading || statsHook.loading || processingData,
    error: agendaHook.error || statsHook.error,
    lastUpdated: agendaHook.lastUpdated && statsHook.lastUpdated 
      ? new Date(Math.max(agendaHook.lastUpdated.getTime(), statsHook.lastUpdated.getTime()))
      : agendaHook.lastUpdated || statsHook.lastUpdated,
    refresh: refreshAll,
    forceRefresh: forceRefreshAll
  };
};
