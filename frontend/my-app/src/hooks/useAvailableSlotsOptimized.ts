import { useEffect, useMemo } from 'react';
import { useCitas } from '../contexts/CitasContext';

/**
 * Hook optimizado para obtener slots disponibles
 * Reemplaza el hook useAvailableSlots existente con mejor performance
 */
export const useAvailableSlotsOptimized = (selectedDate?: Date, specialtyId?: number) => {
  const { state, fetchAvailableSlots, fetchDoctors, fetchSpecialties } = useCitas();

  // Filtrar doctores por especialidad si se especifica
  const filteredDoctors = useMemo(() => {
    if (!specialtyId || specialtyId === 0) {
      return state.doctors;
    }
    
    const specialty = state.specialties.find(s => s.id === specialtyId.toString());
    if (!specialty) {
      return state.doctors;
    }
    
    return state.doctors.filter(doctor => 
      doctor.especialidad.toLowerCase().includes(specialty.name.toLowerCase())
    );
  }, [state.doctors, state.specialties, specialtyId]);

  // Obtener slots para todos los doctores filtrados
  useEffect(() => {
    if (!selectedDate || filteredDoctors.length === 0) {
      return;
    }

    // Obtener slots para cada doctor de forma paralela
    const fetchAllSlots = async () => {
      const promises = filteredDoctors.map(doctor => 
        fetchAvailableSlots(selectedDate, doctor.id)
      );
      
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error('Error al obtener slots:', error);
      }
    };

    fetchAllSlots();
  }, [selectedDate, filteredDoctors, fetchAvailableSlots]);

  // Cargar doctores y especialidades si no están cargados
  useEffect(() => {
    if (state.doctors.length === 0) {
      fetchDoctors();
    }
    if (state.specialties.length === 0) {
      fetchSpecialties();
    }
  }, [state.doctors.length, state.specialties.length, fetchDoctors, fetchSpecialties]);

  return {
    availableSlots: state.availableSlots,
    specialties: state.specialties,
    doctors: filteredDoctors,
    loading: state.loading,
    error: state.error
  };
};

/**
 * Hook optimizado para obtener slots de un doctor específico
 */
export const useAvailableSlotsForDoctor = (selectedDate?: Date, doctorId?: number) => {
  const { state, fetchAvailableSlots } = useCitas();

  useEffect(() => {
    if (selectedDate && doctorId) {
      fetchAvailableSlots(selectedDate, doctorId);
    }
  }, [selectedDate, doctorId, fetchAvailableSlots]);

  // Filtrar slots solo para el doctor especificado
  const doctorSlots = useMemo(() => {
    if (!doctorId) return state.availableSlots;
    
    return state.availableSlots.filter(slot => 
      slot.doctor.id === doctorId
    );
  }, [state.availableSlots, doctorId]);

  return {
    availableSlots: doctorSlots,
    loading: state.loading,
    error: state.error
  };
};

export default useAvailableSlotsOptimized;
