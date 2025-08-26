import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import doctorAvailabilityService, { 
  DoctorAvailability, 
  TimeSlot 
} from '../services/doctorAvailabilityService';
import { 
  getCurrentColombiaDate,
  isDateInPastColombia,
  isTimeInPastColombia,
  isDateTimeInPastColombia
} from '../utils/timezoneUtils';

export interface SlotSelection {
  doctorId: number;
  date: string;
  time: string;
  isAvailable: boolean;
}

export interface IndependentSlot {
  // Propiedades del sistema legacy
  time: string; // "08:00"
  isAvailable: boolean;
  isOccupied: boolean;
  appointmentId?: number;
  duration?: number;
  
  // Propiedades del nuevo sistema
  startTime: string;
  endTime: string;
  
  // Propiedades adicionales
  doctorId: number;
  date: string;
  displayTime: string;
  key: string; // Unique identifier for the slot
}

interface UseIndependentSlotsOptions {
  doctorId?: number;
  viewType: 'day' | 'week' | 'month';
  selectedDate?: Date;
}

// Helper function to add minutes to time string
const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

export const useIndependentSlots = ({
  doctorId,
  viewType,
  selectedDate
}: UseIndependentSlotsOptions) => {
  const [availabilityData, setAvailabilityData] = useState<Map<string, DoctorAvailability>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);

  // Generate date range based on view type
  const dateRange = useMemo(() => {
    if (!selectedDate) return [];

    switch (viewType) {
      case 'day':
        return [selectedDate];
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case 'month':
        // For month view, we only need the selected date for slot details
        return selectedDate ? [selectedDate] : [];
      default:
        return [];
    }
  }, [selectedDate, viewType]);

  // Generate unique key for slot
  const generateSlotKey = useCallback((doctorId: number, date: string, time: string) => {
    return `${doctorId}-${date}-${time}`;
  }, []);

  // Fetch availability for the current date range
  const fetchAvailability = useCallback(async () => {
    if (!doctorId || dateRange.length === 0) {
      setAvailabilityData(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return doctorAvailabilityService.getDoctorAvailability(doctorId, dateStr);
      });

      const results = await Promise.all(promises);
      const newAvailabilityMap = new Map<string, DoctorAvailability>();

      results.forEach(availability => {
        const key = `${availability.doctorId}-${availability.date}`;
        newAvailabilityMap.set(key, availability);
      });

      setAvailabilityData(newAvailabilityMap);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Error al obtener disponibilidad');
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateRange]);

  // Load availability when dependencies change
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Get slots for a specific date
  const getSlotsForDate = useCallback((date: Date): IndependentSlot[] => {
    if (!doctorId) return [];

    const dateStr = format(date, 'yyyy-MM-dd');
    const key = `${doctorId}-${dateStr}`;
    const availability = availabilityData.get(key);

    if (!availability) return [];

    return availability.slots.map(slot => ({
      // Propiedades del sistema legacy
      time: slot.time,
      isAvailable: slot.isAvailable,
      isOccupied: slot.isOccupied,
      appointmentId: slot.appointmentId,
      duration: slot.duration,
      
      // Propiedades del nuevo sistema (generar desde el time)
      startTime: slot.time,
      endTime: addMinutesToTime(slot.time, slot.duration || 60),
      
      // Propiedades adicionales
      doctorId,
      date: dateStr,
      displayTime: slot.time,
      key: generateSlotKey(doctorId, dateStr, slot.time)
    }));
  }, [doctorId, availabilityData, generateSlotKey]);

  // Get all slots for current view
  const allSlots = useMemo(() => {
    const slots: IndependentSlot[] = [];
    
    dateRange.forEach(date => {
      const daySlots = getSlotsForDate(date);
      slots.push(...daySlots);
    });

    return slots;
  }, [dateRange, getSlotsForDate]);

  // Get available slots only
  const availableSlots = useMemo(() => {
    return allSlots.filter(slot => slot.isAvailable);
  }, [allSlots]);

  // Select a slot
  const selectSlot = useCallback((slot: IndependentSlot) => {
    if (!slot.isAvailable) return false;

    setSelectedSlot({
      doctorId: slot.doctorId,
      date: slot.date,
      time: slot.time,
      isAvailable: slot.isAvailable
    });

    return true;
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  // Check if a slot is selected
  const isSlotSelected = useCallback((slot: IndependentSlot) => {
    if (!selectedSlot) return false;

    return (
      selectedSlot.doctorId === slot.doctorId &&
      selectedSlot.date === slot.date &&
      selectedSlot.time === slot.time
    );
  }, [selectedSlot]);

  // Get slot by key
  const getSlotByKey = useCallback((key: string): IndependentSlot | null => {
    return allSlots.find(slot => slot.key === key) || null;
  }, [allSlots]);

  // Check slot availability in real-time
  const recheckSlotAvailability = useCallback(async (slot: IndependentSlot) => {
    try {
      const isAvailable = await doctorAvailabilityService.isSlotAvailable(
        slot.doctorId,
        slot.date,
        slot.time
      );

      // Update the slot in our local state
      const key = `${slot.doctorId}-${slot.date}`;
      const availability = availabilityData.get(key);
      
      if (availability) {
        const updatedSlots = availability.slots.map(s => 
          s.time === slot.time ? { ...s, isAvailable, isOccupied: !isAvailable } : s
        );

        const updatedAvailability = { ...availability, slots: updatedSlots };
        const newMap = new Map(availabilityData);
        newMap.set(key, updatedAvailability);
        setAvailabilityData(newMap);
      }

      return isAvailable;
    } catch (error) {
      console.error('Error rechecking slot availability:', error);
      return false;
    }
  }, [availabilityData]);

  // Refresh availability data
  const refresh = useCallback(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    // Data
    allSlots,
    availableSlots,
    selectedSlot,
    loading,
    error,
    
    // Actions
    selectSlot,
    clearSelection,
    getSlotsForDate,
    getSlotByKey,
    isSlotSelected,
    recheckSlotAvailability,
    refresh,
    
    // Utility
    generateSlotKey
  };
};

export default useIndependentSlots;
