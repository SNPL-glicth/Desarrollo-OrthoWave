import { Notification } from '../hooks/useNotifications';
import { API_CONFIG } from '../config/api.js';

const API_BASE = API_CONFIG.BASE_URL;

class NotificationService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Método utilitario para obtener el icono de una notificación
  getNotificationIcon(tipo: string) {
    switch (tipo) {
      case 'cita_confirmada':
        return '✅';
      case 'cita_cancelada':
        return '❌';
      case 'cita_reagendada':
        return '📅';
      case 'recordatorio':
        return '⏰';
      case 'cita_pendiente_confirmacion':
        return '⏳';
      default:
        return '📢';
    }
  }

  // Método utilitario para obtener el color de una notificación
  getNotificationColor(tipo: string) {
    switch (tipo) {
      case 'cita_confirmada':
        return 'green';
      case 'cita_cancelada':
        return 'red';
      case 'cita_reagendada':
        return 'blue';
      case 'recordatorio':
        return 'yellow';
      case 'cita_pendiente_confirmacion':
        return 'orange';
      default:
        return 'gray';
    }
  }

  // Método utilitario para formatear el mensaje de una notificación
  formatNotificationMessage(notification: Notification): string {
    const doctorName = notification.doctorNombre ? `Dr. ${notification.doctorNombre}` : 'El doctor';
    const date = notification.fechaCita 
      ? new Date(notification.fechaCita).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    switch (notification.tipo) {
      case 'cita_confirmada':
        return `${doctorName} ha confirmado tu cita${date ? ` para el ${date}` : ''}.`;
      case 'cita_cancelada':
        return `${doctorName} ha cancelado tu cita${date ? ` del ${date}` : ''}.`;
      case 'cita_reagendada':
        return `${doctorName} ha reagendado tu cita${date ? ` para el ${date}` : ''}.`;
      case 'recordatorio':
        return `Recordatorio: Tienes una cita${date ? ` el ${date}` : ''}.`;
      case 'cita_pendiente_confirmacion':
        return `Tu cita${date ? ` para el ${date}` : ''} con ${doctorName} ha sido aprobada. Revisa el estado de tu cita y confirma tu asistencia.`;
      default:
        return notification.mensaje;
    }
  }

  // Método para verificar si una notificación es reciente (menos de 24 horas)
  isRecentNotification(notification: Notification): boolean {
    const now = new Date();
    const notificationDate = new Date(notification.fechaCreacion);
    const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);
    
    return diffInHours < 24;
  }

  // Método para agrupar notificaciones por fecha
  groupNotificationsByDate(notifications: Notification[]): { [date: string]: Notification[] } {
    return notifications.reduce((groups, notification) => {
      const date = new Date(notification.fechaCreacion).toDateString();
      
      if (!groups[date]) {
        groups[date] = [];
      }
      
      groups[date].push(notification);
      return groups;
    }, {} as { [date: string]: Notification[] });
  }

  // Método para obtener notificaciones no leídas solamente
  getUnreadNotifications(notifications: Notification[]): Notification[] {
    return notifications.filter(notification => !notification.leida);
  }

  // Método para obtener estadísticas de notificaciones
  getNotificationStats(notifications: Notification[]) {
    const total = notifications.length;
    const unread = this.getUnreadNotifications(notifications).length;
    const byType = notifications.reduce((counts, notification) => {
      counts[notification.tipo] = (counts[notification.tipo] || 0) + 1;
      return counts;
    }, {} as { [type: string]: number });

    return {
      total,
      unread,
      read: total - unread,
      byType,
      readPercentage: total > 0 ? Math.round((total - unread) / total * 100) : 0
    };
  }
}

// Exportar una instancia singleton
export const notificationService = new NotificationService();
export default notificationService;
