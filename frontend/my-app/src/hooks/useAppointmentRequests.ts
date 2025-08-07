import { useState, useEffect, useCallback } from 'react';
import appointmentRequestsService, { SolicitudCita } from '../services/appointmentRequestsService';
import { useAuth } from '../context/AuthContext';

export const useAppointmentRequests = (doctorId?: number) => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contadorPendientes, setContadorPendientes] = useState(0);

  // Cargar solicitudes pendientes
  const cargarSolicitudes = useCallback(async () => {
    if (!user || user.rol !== 'doctor') {
      console.log('Usuario no es doctor o no existe:', user);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let solicitudesPendientes: SolicitudCita[];
      
      console.log('Cargando solicitudes para doctor:', user.id, user.nombre);
      
      if (doctorId) {
        solicitudesPendientes = await appointmentRequestsService.getSolicitudesPendientesDoctor(doctorId);
      } else {
        solicitudesPendientes = await appointmentRequestsService.getMisSolicitudesPendientes();
      }

      console.log('Solicitudes obtenidas:', solicitudesPendientes);
      
      // Asegurarse de que sea un array
      if (!Array.isArray(solicitudesPendientes)) {
        console.warn('Las solicitudes no son un array:', solicitudesPendientes);
        solicitudesPendientes = [];
      }
      
      setSolicitudes(solicitudesPendientes);
      setContadorPendientes(solicitudesPendientes.length);
    } catch (err: any) {
      console.error('Error al cargar solicitudes:', err);
      
      // Solo mostrar error si es un error crítico del servidor
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || 'Error al cargar solicitudes';
      
      if (status === 404) {
        // 404 significa que no hay endpoint implementado aún, esto es normal
        console.log('Endpoint de solicitudes no implementado aún - esto es normal:', message);
        setSolicitudes([]);
        setContadorPendientes(0);
      } else if (!err.response && err.message?.includes('Network Error')) {
        // Error de red - backend no está disponible
        console.warn('Backend no disponible:', message);
        setSolicitudes([]);
        setContadorPendientes(0);
        // No mostrar error, es normal si el backend no está ejecutándose
      } else if (status >= 500) {
        // Error del servidor - esto sí es un problema
        setError(`Error del servidor: ${message}`);
        setSolicitudes([]);
        setContadorPendientes(0);
      } else if (status === 401) {
        // No autorizado - el usuario necesita hacer login
        console.log('Usuario no autorizado para ver solicitudes');
        setSolicitudes([]);
        setContadorPendientes(0);
      } else {
        // Otros errores - logear pero no mostrar error al usuario
        console.warn('Error de solicitud (no crítico):', message);
        setSolicitudes([]);
        setContadorPendientes(0);
      }
    } finally {
      setLoading(false);
    }
  }, [doctorId, user]);

  // Aprobar solicitud
  const aprobarSolicitud = useCallback(async (citaId: number) => {
    setLoading(true);
    try {
      const solicitudAprobada = await appointmentRequestsService.aprobarSolicitud(citaId);
      
      // Actualizar la lista local
      setSolicitudes(prev => 
        prev.map(sol => 
          sol.id === citaId 
            ? { ...sol, estado: 'aprobada' as const }
            : sol
        )
      );
      
      // Actualizar contador (restar una solicitud pendiente)
      setContadorPendientes(prev => Math.max(0, prev - 1));
      
      return solicitudAprobada;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar solicitud');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rechazar solicitud
  const rechazarSolicitud = useCallback(async (citaId: number, razonRechazo?: string) => {
    setLoading(true);
    try {
      const solicitudRechazada = await appointmentRequestsService.rechazarSolicitud(citaId, razonRechazo);
      
      // Actualizar la lista local
      setSolicitudes(prev => 
        prev.map(sol => 
          sol.id === citaId 
            ? { ...sol, estado: 'rechazada' as const, razonRechazo }
            : sol
        )
      );
      
      // Actualizar contador (restar una solicitud pendiente)
      setContadorPendientes(prev => Math.max(0, prev - 1));
      
      return solicitudRechazada;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar solicitud');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener solo las solicitudes pendientes
  const solicitudesPendientes = solicitudes.filter(sol => sol.estado === 'pendiente');

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  // Recargar solicitudes cada 30 segundos si hay solicitudes pendientes
  useEffect(() => {
    if (contadorPendientes === 0) return;

    const interval = setInterval(() => {
      cargarSolicitudes();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [cargarSolicitudes, contadorPendientes]);

  return {
    solicitudes,
    solicitudesPendientes,
    contadorPendientes,
    loading,
    error,
    cargarSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
  };
};
