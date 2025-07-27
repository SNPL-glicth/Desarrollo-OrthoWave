import { useState, useEffect } from 'react';
import api from '../services/api';

interface PendingUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fechaCreacion: string;
  approvalStatus: string;
  isApproved: boolean;
  rol: {
    id: number;
    nombre: string;
  };
}

export const usePendingAccounts = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingAccounts = async () => {
    try {
      console.log('🔍 [DEBUG] Iniciando fetchPendingAccounts');
      setLoading(true);
      setError(null);
      
      console.log('🔍 [DEBUG] Realizando petición GET a /approval/pending-accounts');
      const response = await api.get('/approval/pending-accounts');
      
      console.log('🔍 [DEBUG] Respuesta recibida:', {
        status: response.status,
        dataLength: response.data?.length || 0,
        data: response.data
      });
      
      // Manejar nueva estructura de respuesta { success, data, message }
      const users = response.data.success ? response.data.data : response.data;
      setPendingUsers(users);
      console.log('🔍 [DEBUG] fetchPendingAccounts completado exitosamente');
    } catch (err: any) {
      console.error('❌ [DEBUG] Error en fetchPendingAccounts:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setError(err.response?.data?.message || 'Error al cargar cuentas pendientes');
    } finally {
      setLoading(false);
    }
  };

  const approveAccount = async (userId: number) => {
    try {
      console.log('✅ [DEBUG] Iniciando approveAccount para userId:', userId);
      
      // Validar que userId sea un número válido
      if (!userId || !Number.isInteger(userId) || userId <= 0) {
        console.error('❌ [DEBUG] userId inválido:', userId);
        return { 
          success: false, 
          error: 'ID de usuario inválido' 
        };
      }

      const url = `/approval/approve/${String(userId)}`;
      console.log('🔍 [DEBUG] Realizando PATCH a:', url);
      
      await api.patch(url);
      console.log('✅ [DEBUG] Aprobación exitosa, refrescando lista');
      
      // Refrescar la lista después de aprobar
      await fetchPendingAccounts();
      return { success: true };
    } catch (err: any) {
      console.error('❌ [DEBUG] Error en approveAccount:', {
        userId,
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al aprobar la cuenta' 
      };
    }
  };

  const rejectAccount = async (userId: number, reason: string) => {
    try {
      // Validar que userId sea un número válido
      if (!userId || !Number.isInteger(userId) || userId <= 0) {
        return { 
          success: false, 
          error: 'ID de usuario inválido' 
        };
      }

      // Validar que se proporcione una razón
      if (!reason || reason.trim().length === 0) {
        return { 
          success: false, 
          error: 'Debe proporcionar una razón para el rechazo' 
        };
      }

      await api.patch(`/approval/reject/${String(userId)}`, { razon: reason.trim() });
      // Refrescar la lista después de rechazar
      await fetchPendingAccounts();
      return { success: true };
    } catch (err: any) {
      console.error('Error rejecting account:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al rechazar la cuenta' 
      };
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  return {
    pendingUsers,
    loading,
    error,
    refreshPendingAccounts: fetchPendingAccounts,
    approveAccount,
    rejectAccount
  };
};
