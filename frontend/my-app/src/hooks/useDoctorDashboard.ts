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
  paciente?: {
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
    console.log('Procesando datos del doctor:', { agendaData: agendaHook.data, statsData: statsHook.data });
    
    // Valores por defecto
    const defaultData = {
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

    // Si no hay datos de agenda, pero sí hay stats, usar valores por defecto con stats
    if (!agendaHook.data) {
      const statsData = statsHook.data || {};
      return {
        ...defaultData,
        estadisticas: {
          ...defaultData.estadisticas,
          pacientesActivos: statsData.totalCitas || 0
        }
      };
    }

    const agendaData = agendaHook.data;
    const statsData = statsHook.data || {};

    // Validar estructura de agendaData
    if (!agendaData || typeof agendaData !== 'object') {
      console.warn('agendaData no tiene la estructura esperada:', agendaData);
      return defaultData;
    }

    // Procesar datos de la agenda con validación
    const citasHoy = Array.isArray(agendaData.citasHoy) ? agendaData.citasHoy : [];
    const proximasCitas = Array.isArray(agendaData.proximasCitas) ? agendaData.proximasCitas : [];
    const citasEstaSemana = Array.isArray(agendaData.citasEstaSemana) ? agendaData.citasEstaSemana : [];

    // Crear estadísticas basadas en datos reales
    const estadisticasAgenda = agendaData.estadisticas || {};
    const estadisticas = {
      citasHoy: estadisticasAgenda.citasHoy || citasHoy.length,
      citasPendientes: estadisticasAgenda.citasPendientes || citasHoy.filter(c => c.estado === 'pendiente').length,
      pacientesActivos: statsData.totalCitas || citasEstaSemana.length,
      tratamientosActivos: estadisticasAgenda.citasCompletadas || citasHoy.filter(c => c.estado === 'completada').length
    };

    // Extraer pacientes recientes de las citas
    const pacientesRecientes = proximasCitas.slice(0, 3).map((cita: Cita) => {
      if (!cita || !cita.paciente) {
        return {
          id: cita?.id || 0,
          nombre: 'Sin nombre',
          apellido: '',
          edad: 0,
          ultimaCita: new Date().toISOString().split('T')[0],
          proximaCita: new Date().toISOString().split('T')[0]
        };
      }
      
      return {
        id: cita.id,
        nombre: cita.paciente.nombre || 'Sin nombre',
        apellido: cita.paciente.apellido || '',
        edad: 0,
        ultimaCita: new Date(cita.fechaHora).toISOString().split('T')[0],
        proximaCita: new Date(cita.fechaHora).toISOString().split('T')[0]
      };
    });

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
