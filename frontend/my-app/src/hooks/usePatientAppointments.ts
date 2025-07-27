import { useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/auth.service';

export const usePatientAppointments = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const response = await api.get(`/citas/paciente/${user.id}`);
            const allAppointments = response.data;
            
            const now = new Date();
            const upcoming = allAppointments.filter((apt: any) => 
                new Date(apt.fechaHora) > now && apt.estado !== 'cancelada'
            );
            const past = allAppointments.filter((apt: any) => 
                new Date(apt.fechaHora) <= now || apt.estado === 'completada'
            );
            
            setUpcomingAppointments(upcoming);
            setPastAppointments(past);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las citas');
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
