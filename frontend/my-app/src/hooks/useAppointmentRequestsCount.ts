import { useState, useEffect, useCallback } from 'react';
import appointmentRequestsService from '../services/appointmentRequestsService';
import { useAuth } from '../context/AuthContext';

export const useAppointmentRequestsCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar el conteo
  const loadCount = useCallback(async () => {
    // Solo cargar si el usuario es doctor y está autenticado
    if (!user || !user.id) {
      console.log('Usuario no disponible o no autenticado, no cargando conteo');
      setCount(0);
      return;
    }

    if (user.rol !== 'doctor') {
      console.log(`Usuario con rol '${user.rol}' no es doctor, no cargando conteo`);
      setCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCount = await appointmentRequestsService.getConteoSolicitudesPendientes();
      setCount(newCount);
      console.log('Conteo de solicitudes cargado para doctor:', { userId: user.id, count: newCount });
    } catch (err: any) {
      console.error('Error al cargar conteo de solicitudes:', err);
      
      // Solo mostrar error si es un error crítico del servidor
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || 'Error al cargar conteo';
      
      if (status === 404) {
        // 404 significa que no hay endpoint implementado aún, esto es normal
        console.log('Endpoint de conteo no implementado aún - esto es normal:', message);
        setCount(0);
      } else if (status === 400 || status === 403) {
        // 400/403 significa que el usuario no tiene permisos (probablemente no es doctor)
        console.log('Usuario no autorizado para ver conteo (no es doctor):', message);
        setCount(0);
      } else if (!err.response && err.message?.includes('Network Error')) {
        // Error de red - backend no está disponible
        console.warn('Backend no disponible:', message);
        setCount(0);
        // No mostrar error, es normal si el backend no está ejecutándose
      } else if (status >= 500) {
        // Error del servidor - esto sí es un problema
        setError(`Error del servidor: ${message}`);
        setCount(0);
      } else if (status === 401) {
        // No autorizado - el usuario necesita hacer login
        console.log('Usuario no autorizado para ver conteo');
        setCount(0);
      } else {
        // Otros errores - logear pero no mostrar error al usuario
        console.warn('Error de solicitud (no crítico):', message);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para decrementar el conteo (cuando se aprueba o rechaza una solicitud)
  const decrementCount = useCallback(() => {
    setCount(prev => Math.max(0, prev - 1));
  }, []);

  // Función para incrementar el conteo (cuando llega una nueva solicitud)
  const incrementCount = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  // Función para recargar manualmente
  const refreshCount = useCallback(() => {
    loadCount();
  }, [loadCount]);

  // Cargar conteo inicial
  useEffect(() => {
    loadCount();
  }, [loadCount]);

  // Polling cada 30 segundos para mantener actualizado
  useEffect(() => {
    const interval = setInterval(() => {
      loadCount();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [loadCount]);

  return {
    count,
    loading,
    error,
    refreshCount,
    decrementCount,
    incrementCount
  };
};

export default useAppointmentRequestsCount;
