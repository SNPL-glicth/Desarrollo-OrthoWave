import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from './useWebSocket';

export interface Notification {
  id: number;
  tipo: 'cita_confirmada' | 'cita_cancelada' | 'recordatorio' | 'cita_reagendada' | 'cita_pendiente_confirmacion';
  titulo: string;
  mensaje: string;
  fechaCreacion: string;
  leida: boolean;
  citaId: number;
  doctorNombre?: string;
  fechaCita?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Función para cargar notificaciones
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/notifications', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }

      const data = await response.json();
      setNotifications(data);
      
      // Contar no leídas
      const unread = data.filter((notif: Notification) => !notif.leida).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para obtener solo el conteo de no leídas
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('http://localhost:4000/notifications/unread-count', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Error al obtener conteo de no leídas:', err);
    }
  }, [user]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, leida: true }
              : notif
          )
        );

        // Decrementar contador
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      return false;
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/notifications/read-all', {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, leida: true }))
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err);
      return false;
    }
  }, []);

  // WebSocket listeners para notificaciones en tiempo real
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('Configurando listeners de WebSocket para notificaciones...');

    const handleNewNotification = (data: any) => {
      console.log('Nueva notificación recibida:', data);
      const newNotification = data.notification;
      
      // Agregar la nueva notificación al estado
      setNotifications(prev => [newNotification, ...prev]);
      
      // Incrementar el contador de no leídas
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationCountUpdate = (data: any) => {
      console.log('Contador de notificaciones actualizado:', data.unreadCount);
      setUnreadCount(data.unreadCount);
    };

    // Registrar listeners
    socket.on('new_notification', handleNewNotification);
    socket.on('notification_count_update', handleNotificationCountUpdate);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_count_update', handleNotificationCountUpdate);
    };
  }, [socket, isConnected]);

  // Polling como fallback y carga inicial
  useEffect(() => {
    if (!user) return;

    // Cargar inicialmente
    fetchNotifications();

    // Solo usar polling si WebSocket no está conectado
    if (!isConnected) {
      console.log('WebSocket no conectado, usando polling como fallback');
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      console.log('WebSocket conectado, notificaciones en tiempo real activas');
    }
  }, [user, fetchNotifications, fetchUnreadCount, isConnected]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};
