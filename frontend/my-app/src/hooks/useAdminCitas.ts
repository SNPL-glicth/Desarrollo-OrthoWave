import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export interface Cita {
  id: number;
  pacienteId: number;
  doctorId: number;
  fechaHora: string;
  duracion: number;
  estado: 'pendiente' | 'confirmada' | 'aprobada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  tipoConsulta: 'primera_vez' | 'control' | 'seguimiento' | 'urgencia';
  motivoConsulta: string;
  notasDoctor?: string;
  notasPaciente?: string;
  costo?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  paciente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  doctor?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
}

interface UseAdminCitasReturn {
  citas: Cita[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
}

export const useAdminCitas = (): UseAdminCitasReturn => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadCitas = useCallback(async () => {
    if (!user || user.rol !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Cargando citas para admin...');
      
      // Para admin, intentamos obtener todas las citas del sistema
      // Podemos usar diferentes endpoints según lo que esté disponible
      const response = await api.get('/citas/todas'); // Endpoint para admin
      
      setCitas(response.data || []);
      setLastUpdate(new Date());
      console.log('Citas cargadas para admin:', response.data);
      
    } catch (err: any) {
      console.error('Error al cargar citas para admin:', err);
      
      // Si el endpoint no existe, intentamos con un enfoque alternativo
      if (err.response?.status === 404) {
        try {
          // Intentar con el endpoint de estadísticas que sabemos que funciona
          const statsResponse = await api.get('/dashboard/citas/estadisticas');
          console.log('Usando estadísticas en lugar de citas:', statsResponse.data);
          setCitas([]); // Por ahora, array vacío
          setLastUpdate(new Date());
        } catch (statsErr: any) {
          console.error('Error al cargar estadísticas:', statsErr);
          setError('No se pueden cargar las citas del sistema');
        }
      } else {
        setError(err.response?.data?.message || 'Error al cargar las citas');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadCitas();
  }, [loadCitas]);

  useEffect(() => {
    if (user) {
      loadCitas();
    }
  }, [user, loadCitas]);

  return {
    citas,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

export default useAdminCitas;
