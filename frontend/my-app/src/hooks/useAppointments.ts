import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/citas/mis-citas');
            setAppointments(response.data);
        } catch (err: any) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const createAppointment = async (data: any) => {
        const response = await api.post('/citas', data);
        setAppointments([...appointments, response.data]);
        return response.data;
    };

    const updateAppointment = async (id: any, data: any) => {
        const response = await api.patch(`/citas/${id}/estado`, data);
        setAppointments(appointments.map(apt => 
            apt.id === id ? response.data : apt
        ));
        return response.data;
    };

    const rescheduleAppointment = async (id: any, newDateTime: any) => {
        const response = await api.patch(
            `/citas/${id}/estado`,
            { fechaHora: newDateTime }
        );
        setAppointments(appointments.map(apt => 
            apt.id === id ? response.data : apt
        ));
        return response.data;
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return {
        appointments,
        loading,
        error,
        createAppointment,
        updateAppointment,
        rescheduleAppointment,
        refreshAppointments: fetchAppointments
    };
};
