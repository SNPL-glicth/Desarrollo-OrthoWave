import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/citas/mis-citas');
            setAppointments(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const createAppointment = async (data) => {
        const response = await api.post('/citas', data);
        setAppointments([...appointments, response.data]);
        return response.data;
    };

    const updateAppointment = async (id, data) => {
        const response = await api.patch(`/citas/${id}/estado`, data);
        setAppointments(appointments.map(apt => 
            apt.id === id ? response.data : apt
        ));
        return response.data;
    };

    const rescheduleAppointment = async (id, newDateTime) => {
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
