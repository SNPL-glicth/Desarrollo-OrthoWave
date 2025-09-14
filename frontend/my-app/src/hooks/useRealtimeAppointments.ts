import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from './useWebSocket';

export interface Appointment {
  id: number;
  doctorId: number;
  pacienteId: number;
  fechaHora: string;
  duracion: number;
  estado: string;
  motivoConsulta: string;
  doctor?: any;
  paciente?: any;
  fechaCreacion?: string;
  fechaAprobacion?: string;
  aprobadaPor?: number;
  razonRechazo?: string;
}

export const useRealtimeAppointments = (userId?: number, userRole?: string) => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Función para obtener el token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Función para cargar citas
  const fetchAppointments = useCallback(async () => {
    if (!user && !userId) return;

    const targetUserId = userId || user?.id;
    const targetUserRole = userRole || user?.rol;

    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      if (targetUserRole === 'doctor') {
        endpoint = `http://localhost:4000/citas/doctor/${targetUserId}`;
      } else if (targetUserRole === 'paciente') {
        endpoint = `http://localhost:4000/citas/paciente/${targetUserId}`;
      } else if (targetUserRole === 'admin') {
        endpoint = 'http://localhost:4000/citas'; // Suponiendo que hay un endpoint para admin
      } else {
        endpoint = 'http://localhost:4000/citas/mis-citas';
      }

      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cargar citas');
      }

      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
      setLastUpdate(new Date());

    } catch (err) {
      console.error('Error al cargar citas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user, userId, userRole]);

  // WebSocket listeners para citas en tiempo real
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('Configurando listeners de WebSocket para citas...');

    // Listener para nuevas citas
    const handleAppointmentCreated = (data: any) => {
      console.log('Nueva cita creada:', data);
      const newAppointment = data.appointment;
      
      // Solo añadir si es relevante para el usuario actual
      const targetUserId = userId || user?.id;
      if (newAppointment.doctorId === targetUserId || 
          newAppointment.pacienteId === targetUserId ||
          user?.rol === 'admin') {
        setAppointments(prev => [newAppointment, ...prev]);
        setLastUpdate(new Date());
      }
    };

    // Listener para citas actualizadas
    const handleAppointmentUpdated = (data: any) => {
      console.log('Cita actualizada:', data);
      const updatedAppointment = data.appointment;
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === updatedAppointment.id 
            ? { ...apt, ...updatedAppointment }
            : apt
        )
      );
      setLastUpdate(new Date());
    };

    // Listener para cambios de estado
    const handleAppointmentStatusChanged = (data: any) => {
      console.log('Estado de cita cambiado:', data);
      const updatedAppointment = data.appointment;
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === updatedAppointment.id 
            ? { ...apt, estado: data.newStatus }
            : apt
        )
      );
      setLastUpdate(new Date());
    };

    // Listener para citas eliminadas
    const handleAppointmentDeleted = (data: any) => {
      console.log('Cita eliminada:', data);
      
      setAppointments(prev => 
        prev.filter(apt => apt.id !== data.appointmentId)
      );
      setLastUpdate(new Date());
    };

    // Listener genérico para actualizaciones de listas
    const handleListUpdate = (data: any) => {
      if (data.listType === 'appointments') {
        console.log('Actualizando lista de citas por evento genérico');
        fetchAppointments();
      }
    };

    // Listener para actualizaciones del dashboard
    const handleDashboardDataUpdate = (data: any) => {
      if (data.dataType === 'appointments') {
        console.log('Actualizando citas por evento de dashboard');
        fetchAppointments();
      }
    };

    // Registrar SOLO listeners CRÍTICOS para citas
    socket.on('appointment_status_changed', handleAppointmentStatusChanged); // Estados importantes
    socket.on('appointment_deleted', handleAppointmentDeleted); // Eliminaciones
    socket.on('calendar_sync', () => fetchAppointments()); // Cambios de disponibilidad

    return () => {
      socket.off('appointment_status_changed', handleAppointmentStatusChanged);
      socket.off('appointment_deleted', handleAppointmentDeleted);
      socket.off('calendar_sync');
    };
  }, [socket, isConnected, user, userId, fetchAppointments]);

  // Carga inicial y polling como fallback
  useEffect(() => {
    if (!user && !userId) return;

    // Cargar inicialmente
    fetchAppointments();

    // Solo usar polling si WebSocket no está conectado
    if (!isConnected) {
      console.log('WebSocket no conectado, usando polling como fallback para citas');
      const interval = setInterval(fetchAppointments, 30000); // 30 segundos
      return () => clearInterval(interval);
    } else {
      console.log('WebSocket conectado, citas en tiempo real activas');
    }
  }, [user, userId, fetchAppointments, isConnected]);

  // Funciones para operaciones CRUD en tiempo real
  const createAppointment = useCallback(async (appointmentData: any) => {
    try {
      const response = await fetch('http://localhost:4000/citas', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la cita');
      }

      const newAppointment = await response.json();
      // El WebSocket se encargará de actualizar la lista automáticamente
      return newAppointment;
    } catch (err) {
      console.error('Error al crear cita:', err);
      throw err;
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (appointmentId: number, statusData: any) => {
    try {
      const response = await fetch(`http://localhost:4000/citas/${appointmentId}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la cita');
      }

      const updatedAppointment = await response.json();
      // El WebSocket se encargará de actualizar la lista automáticamente
      return updatedAppointment;
    } catch (err) {
      console.error('Error al actualizar estado de cita:', err);
      throw err;
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    lastUpdate,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    refresh: fetchAppointments,
  };
};