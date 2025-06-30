import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface Specialist {
    id: string;
    name: string;
    specialty: string;
}

interface AvailableSlot {
    id: string;
    startTime: string;
    endTime: string;
    specialist: Specialist;
    date: string;
}

interface Specialty {
    id: string;
    name: string;
}

export const useAvailableSlots = (selectedDate?: Date, specialtyId?: string) => {
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simular datos para desarrollo
    useEffect(() => {
        setSpecialties([
            { id: '1', name: 'Ortodoncia' },
            { id: '2', name: 'Odontología General' },
            { id: '3', name: 'Endodoncia' }
        ]);
    }, []);

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!selectedDate) return;

            setLoading(true);
            try {
                // Simular llamada a la API
                const simulatedSlots = [
                    {
                        id: '1',
                        startTime: `${format(selectedDate, 'yyyy-MM-dd')}T09:00:00`,
                        endTime: `${format(selectedDate, 'yyyy-MM-dd')}T10:00:00`,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        specialist: {
                            id: '1',
                            name: 'Dr. García',
                            specialty: 'Ortodoncia'
                        }
                    },
                    // Añadir más slots simulados aquí
                ];
                
                setAvailableSlots(simulatedSlots);
                setError(null);
            } catch (err) {
                setError('Error al cargar horarios disponibles');
                setAvailableSlots([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [selectedDate, specialtyId]);

    return {
        availableSlots,
        specialties,
        loading,
        error
    };
}; 