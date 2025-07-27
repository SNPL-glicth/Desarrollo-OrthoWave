import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { citasService, Cita } from '../services/citasService';
import { authService } from '../services/auth.service';
import api from '../services/api';

// Tipos para el contexto
interface CitaState {
  citas: Cita[];
  availableSlots: AvailableSlot[];
  doctors: Doctor[];
  specialties: Specialty[];
  loading: boolean;
  error: string | null;
  lastFetch: number;
  cache: Map<string, { data: any; timestamp: number }>;
}

interface AvailableSlot {
  hora: string;
  doctor: Doctor;
  fecha: string;
  id?: string;
  startTime?: string;
  specialist?: Doctor;
}

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  name?: string;
  specialty?: string;
}

interface Specialty {
  id: string;
  name: string;
}

// Acciones del reducer
type CitaAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CITAS'; payload: Cita[] }
  | { type: 'SET_AVAILABLE_SLOTS'; payload: AvailableSlot[] }
  | { type: 'SET_DOCTORS'; payload: Doctor[] }
  | { type: 'SET_SPECIALTIES'; payload: Specialty[] }
  | { type: 'UPDATE_CACHE'; payload: { key: string; data: any } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'ADD_CITA'; payload: Cita }
  | { type: 'UPDATE_CITA'; payload: Cita }
  | { type: 'REMOVE_CITA'; payload: number };

// Estado inicial
const initialState: CitaState = {
  citas: [],
  availableSlots: [],
  doctors: [],
  specialties: [],
  loading: false,
  error: null,
  lastFetch: 0,
  cache: new Map()
};

// Reducer
const citaReducer = (state: CitaState, action: CitaAction): CitaState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CITAS':
      return { ...state, citas: action.payload, lastFetch: Date.now(), loading: false };
    case 'SET_AVAILABLE_SLOTS':
      return { ...state, availableSlots: action.payload, loading: false };
    case 'SET_DOCTORS':
      return { ...state, doctors: action.payload };
    case 'SET_SPECIALTIES':
      return { ...state, specialties: action.payload };
    case 'UPDATE_CACHE':
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, { 
        data: action.payload.data, 
        timestamp: Date.now() 
      });
      return { ...state, cache: newCache };
    case 'CLEAR_CACHE':
      return { ...state, cache: new Map() };
    case 'ADD_CITA':
      return { ...state, citas: [...state.citas, action.payload] };
    case 'UPDATE_CITA':
      return {
        ...state,
        citas: state.citas.map(cita =>
          cita.id === action.payload.id ? action.payload : cita
        )
      };
    case 'REMOVE_CITA':
      return {
        ...state,
        citas: state.citas.filter(cita => cita.id !== action.payload)
      };
    default:
      return state;
  }
};

// Context
interface CitaContextType {
  state: CitaState;
  // Métodos para citas
  fetchCitas: () => Promise<void>;
  createCita: (citaData: any) => Promise<Cita>;
  updateCita: (id: number, data: any) => Promise<Cita>;
  deleteCita: (id: number) => Promise<void>;
  // Métodos para disponibilidad
  fetchAvailableSlots: (date?: Date, doctorId?: number) => Promise<void>;
  fetchDoctors: () => Promise<void>;
  fetchSpecialties: () => Promise<void>;
  // Métodos de utilidad
  clearCache: () => void;
  invalidateCache: (key?: string) => void;
}

const CitaContext = createContext<CitaContextType | undefined>(undefined);

// Provider
export const CitaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(citaReducer, initialState);
  
  // Referencias para debounce y abort controllers
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  
  // Configuración de cache
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  const DEBOUNCE_DELAY = 300; // 300ms

  // Utilidad para verificar si el cache es válido
  const isCacheValid = useCallback((key: string): boolean => {
    const cached = state.cache.get(key);
    return cached ? Date.now() - cached.timestamp < CACHE_DURATION : false;
  }, [state.cache, CACHE_DURATION]);

  // Utilidad para obtener datos del cache
  const getCached = useCallback((key: string): any => {
    const cached = state.cache.get(key);
    return cached?.data || null;
  }, [state.cache]);

  // Limpiar cache
  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  // Invalidar cache específico
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      dispatch({ type: 'UPDATE_CACHE', payload: { key: '', data: newCache } });
    } else {
      clearCache();
    }
  }, [state.cache, clearCache]);

  // Cancelar peticiones pendientes
  const cancelPendingRequests = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Fetch citas con cache y optimización
  const fetchCitas = useCallback(async () => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const cacheKey = `citas_${user.id}_${user.rol}`;
    
    // Verificar cache
    if (isCacheValid(cacheKey)) {
      const cachedCitas = getCached(cacheKey);
      if (cachedCitas) {
        dispatch({ type: 'SET_CITAS', payload: cachedCitas });
        return;
      }
    }

    // Cancelar peticiones anteriores
    cancelPendingRequests();
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();
      
      const citas = await citasService.recargarCitas(
        Number(user.id),
        user.rol || 'paciente',
        abortControllerRef.current.signal
      );

      // Actualizar cache
      dispatch({ type: 'UPDATE_CACHE', payload: { key: cacheKey, data: citas } });
      dispatch({ type: 'SET_CITAS', payload: citas });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  }, [isCacheValid, getCached, cancelPendingRequests]);

  // Fetch disponibilidad con debounce
  const fetchAvailableSlots = useCallback(async (date?: Date, doctorId?: number) => {
    if (!date || !doctorId) {
      dispatch({ type: 'SET_AVAILABLE_SLOTS', payload: [] });
      return;
    }

    const cacheKey = `slots_${doctorId}_${date.toISOString().split('T')[0]}`;
    
    // Verificar cache
    if (isCacheValid(cacheKey)) {
      const cachedSlots = getCached(cacheKey);
      if (cachedSlots) {
        dispatch({ type: 'SET_AVAILABLE_SLOTS', payload: cachedSlots });
        return;
      }
    }

    // Cancelar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Implementar debounce
    timeoutRef.current = setTimeout(async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const fecha = date.toISOString().split('T')[0];
        const response = await api.get('/citas/disponibilidad', {
          params: { doctorId, fecha, duracion: 60 }
        });
        
        const doctor = state.doctors.find(d => d.id === doctorId);
        const slots = response.data.map((hora: string) => ({
          hora,
          doctor: doctor || { id: doctorId, nombre: 'Doctor', apellido: 'Desconocido', especialidad: 'General' },
          fecha,
          id: `${doctorId}_${fecha}_${hora}`,
          startTime: `${fecha}T${hora}:00`,
          specialist: doctor
        }));

        // Actualizar cache
        dispatch({ type: 'UPDATE_CACHE', payload: { key: cacheKey, data: slots } });
        dispatch({ type: 'SET_AVAILABLE_SLOTS', payload: slots });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        dispatch({ type: 'SET_AVAILABLE_SLOTS', payload: [] });
      }
    }, DEBOUNCE_DELAY);
  }, [state.doctors, isCacheValid, getCached]);

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    const cacheKey = 'doctors';
    
    if (isCacheValid(cacheKey)) {
      const cachedDoctors = getCached(cacheKey);
      if (cachedDoctors) {
        dispatch({ type: 'SET_DOCTORS', payload: cachedDoctors });
        return;
      }
    }

    try {
      const response = await api.get('/perfil-medico/doctores-disponibles');
      const doctors = response.data;
      
      dispatch({ type: 'UPDATE_CACHE', payload: { key: cacheKey, data: doctors } });
      dispatch({ type: 'SET_DOCTORS', payload: doctors });
    } catch (error: any) {
      console.error('Error al cargar doctores:', error);
    }
  }, [isCacheValid, getCached]);

  // Fetch specialties
  const fetchSpecialties = useCallback(async () => {
    const cacheKey = 'specialties';
    
    if (isCacheValid(cacheKey)) {
      const cachedSpecialties = getCached(cacheKey);
      if (cachedSpecialties) {
        dispatch({ type: 'SET_SPECIALTIES', payload: cachedSpecialties });
        return;
      }
    }

    try {
      const response = await api.get('/dashboard/citas/especialidades');
      const specialties = response.data.map((especialidad: string, index: number) => ({
        id: (index + 1).toString(),
        name: especialidad
      }));
      
      dispatch({ type: 'UPDATE_CACHE', payload: { key: cacheKey, data: specialties } });
      dispatch({ type: 'SET_SPECIALTIES', payload: specialties });
    } catch (error: any) {
      console.error('Error al cargar especialidades:', error);
    }
  }, [isCacheValid, getCached]);

  // Crear cita
  const createCita = useCallback(async (citaData: any): Promise<Cita> => {
    try {
      const nuevaCita = await citasService.crearCita(citaData);
      dispatch({ type: 'ADD_CITA', payload: nuevaCita });
      
      // Invalidar cache relevante
      const user = authService.getCurrentUser();
      if (user) {
        invalidateCache(`citas_${user.id}_${user.rol}`);
      }
      
      return nuevaCita;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [invalidateCache]);

  // Actualizar cita
  const updateCita = useCallback(async (id: number, data: any): Promise<Cita> => {
    try {
      const citaActualizada = await citasService.actualizarEstadoCita(id, data);
      dispatch({ type: 'UPDATE_CITA', payload: citaActualizada });
      
      // Invalidar cache
      const user = authService.getCurrentUser();
      if (user) {
        invalidateCache(`citas_${user.id}_${user.rol}`);
      }
      
      return citaActualizada;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [invalidateCache]);

  // Eliminar cita
  const deleteCita = useCallback(async (id: number): Promise<void> => {
    try {
      await citasService.eliminarCita(id);
      dispatch({ type: 'REMOVE_CITA', payload: id });
      
      // Invalidar cache
      const user = authService.getCurrentUser();
      if (user) {
        invalidateCache(`citas_${user.id}_${user.rol}`);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [invalidateCache]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, [fetchDoctors, fetchSpecialties]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cancelPendingRequests();
    };
  }, [cancelPendingRequests]);

  const contextValue: CitaContextType = {
    state,
    fetchCitas,
    createCita,
    updateCita,
    deleteCita,
    fetchAvailableSlots,
    fetchDoctors,
    fetchSpecialties,
    clearCache,
    invalidateCache
  };

  return (
    <CitaContext.Provider value={contextValue}>
      {children}
    </CitaContext.Provider>
  );
};

// Hook para usar el contexto
export const useCitas = (): CitaContextType => {
  const context = useContext(CitaContext);
  if (!context) {
    throw new Error('useCitas debe ser usado dentro de un CitaProvider');
  }
  return context;
};

export default CitaContext;
