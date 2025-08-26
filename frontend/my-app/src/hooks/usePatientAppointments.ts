import { useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/auth.service';
import { citasService, Cita } from '../services/citasService';

export const usePatientAppointments = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState<Cita[]>([]);
    const [pastAppointments, setPastAppointments] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Usar el servicio de citas que funciona correctamente
            const allAppointments: Cita[] = await citasService.obtenerCitasPorPaciente(user.id);
            
            const now = new Date();
            const upcoming = allAppointments.filter((apt: Cita) => 
                new Date(apt.fechaHora) > now && apt.estado !== 'cancelada'
            );
            const past = allAppointments.filter((apt: Cita) => 
                new Date(apt.fechaHora) <= now || apt.estado === 'completada'
            );
            
            setUpcomingAppointments(upcoming);
            setPastAppointments(past);
        } catch (err: any) {
            console.error('Error al obtener citas del paciente:', err);
            // Si hay error de servicio, usar API directamente como fallback
            try {
                const response = await api.get(`/citas/paciente/${authService.getCurrentUser()?.id}`);
                const allAppointments: Cita[] = response.data || [];
                
                const now = new Date();
                const upcoming = allAppointments.filter((apt: Cita) => 
                    new Date(apt.fechaHora) > now && apt.estado !== 'cancelada'
                );
                const past = allAppointments.filter((apt: Cita) => 
                    new Date(apt.fechaHora) <= now || apt.estado === 'completada'
                );
                
                setUpcomingAppointments(upcoming);
                setPastAppointments(past);
            } catch (fallbackErr: any) {
                console.error('Error en API fallback:', fallbackErr);
                setError(fallbackErr.message || 'Error al cargar las citas');
                // Establecer arrays vacíos en caso de error
                setUpcomingAppointments([]);
                setPastAppointments([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (appointmentId: string, reason: string) => {
        await api.patch(`/citas/${appointmentId}/estado`, { 
            estado: 'cancelada',
            motivoCancelacion: reason 
        });
        await fetchAppointments();
    };

    const requestReschedule = async (appointmentId: string, reason: string) => {
        await api.patch(`/citas/${appointmentId}/estado`, { 
            estado: 'pendiente',
            motivoCancelacion: reason 
        });
        await fetchAppointments();
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return {
        upcomingAppointments,
        pastAppointments,
        loading,
        error,
        cancelAppointment,
        requestReschedule,
        refreshAppointments: fetchAppointments
    };
};
