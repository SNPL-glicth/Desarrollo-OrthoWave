import { useState, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { API_CONFIG } from '../config/api.js';

export interface AppointmentForConfirmation {
  citaId: number;
  startTime: string;
  specialist: {
    name: string;
    specialty: string;
  };
}

export const useAppointmentConfirmation = () => {
  const { notifications, markAsRead, refresh } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<AppointmentForConfirmation | null>(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  // Buscar notificaciones pendientes de confirmación
  const getPendingConfirmationNotifications = useCallback(() => {
    return notifications.filter(n => n.tipo === 'cita_pendiente_confirmacion' && !n.leida);
  }, [notifications]);

  // Abrir modal de confirmación
  const openConfirmationModal = useCallback((notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && notification.tipo === 'cita_pendiente_confirmacion') {
      const appointmentData: AppointmentForConfirmation = {
        citaId: notification.citaId,
        startTime: notification.fechaCita || '',
        specialist: {
          name: notification.doctorNombre || 'Doctor',
          specialty: 'Especialista' // TODO: Obtener la especialidad real del backend
        }
      };
      
      setAppointmentToConfirm(appointmentData);
      setIsModalOpen(true);
      
      // Marcar la notificación como leída
      markAsRead(notificationId);
    }
  }, [notifications, markAsRead]);

  // Cerrar modal
  const closeConfirmationModal = useCallback(() => {
    setIsModalOpen(false);
    setAppointmentToConfirm(null);
  }, []);

  // Confirmar cita
  const confirmAppointment = useCallback(async () => {
    if (!appointmentToConfirm) return false;

    try {
      setConfirmationLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/citas/${appointmentToConfirm.citaId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al confirmar la cita');
      }

      // Refrescar notificaciones para actualizar el estado
      await refresh();
      
      closeConfirmationModal();
      return true;
      
    } catch (error) {
      console.error('Error confirmando cita:', error);
      return false;
    } finally {
      setConfirmationLoading(false);
    }
  }, [appointmentToConfirm, refresh, closeConfirmationModal]);

  return {
    // Estado del modal
    isModalOpen,
    appointmentToConfirm,
    confirmationLoading,
    
    // Funciones
    getPendingConfirmationNotifications,
    openConfirmationModal,
    closeConfirmationModal,
    confirmAppointment,
  };
};
