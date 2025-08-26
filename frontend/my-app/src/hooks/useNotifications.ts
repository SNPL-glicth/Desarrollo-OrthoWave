import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

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

  // Polling para obtener notificaciones nuevas
  useEffect(() => {
    if (!user) return;

    // Cargar inicialmente
    fetchNotifications();

    // Polling cada 30 segundos para nuevas notificaciones
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);

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
