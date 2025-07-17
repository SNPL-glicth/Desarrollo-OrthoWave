import { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';

interface Doctor {
    id: number;
    nombre: string;
    apellido: string;
    especialidad: string;
}

interface AvailableSlot {
    hora: string;
    doctor: Doctor;
    fecha: string;
}

interface Specialty {
    id: string;
    name: string;
}

export const useAvailableSlots = (selectedDate?: Date, doctorId?: number) => {
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener especialidades disponibles
    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const response = await api.get('/dashboard/citas/especialidades');
                const specialtiesData = response.data.map((especialidad: string, index: number) => ({
                    id: (index + 1).toString(),
                    name: especialidad
                }));
                setSpecialties(specialtiesData);
            } catch (err) {
                console.error('Error al cargar especialidades:', err);
            }
        };

        fetchSpecialties();
    }, []);

    // Obtener doctores disponibles
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/perfil-medico/doctores-disponibles');
                setDoctors(response.data);
            } catch (err) {
                console.error('Error al cargar doctores:', err);
            }
        };

        fetchDoctors();
    }, []);

    // Obtener horarios disponibles
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!selectedDate || !doctorId) return;

            setLoading(true);
            try {
                const fecha = format(selectedDate, 'yyyy-MM-dd');
                const response = await api.get('/citas/disponibilidad', {
                    params: {
                        doctorId,
                        fecha,
                        duracion: 60
                    }
                });
                
                const doctor = doctors.find(d => d.id === doctorId);
                const horariosDisponibles = response.data.map((hora: string) => ({
                    hora,
                    doctor: doctor || { id: doctorId, nombre: 'Doctor', apellido: 'Desconocido', especialidad: 'General' },
                    fecha
                }));
                
                setAvailableSlots(horariosDisponibles);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar horarios disponibles');
                setAvailableSlots([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [selectedDate, doctorId, doctors]);

    return {
        availableSlots,
        specialties,
        doctors,
        loading,
        error
    };
};
