import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointments');
            setAppointments(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const createAppointment = async (data) => {
        const response = await axios.post('/api/appointments', data);
        setAppointments([...appointments, response.data]);
        return response.data;
    };

    const updateAppointment = async (id, data) => {
        const response = await axios.put(`/api/appointments/${id}`, data);
        setAppointments(appointments.map(apt => 
            apt.id === id ? response.data : apt
        ));
        return response.data;
    };

    const rescheduleAppointment = async (id, newDateTime) => {
        const response = await axios.post(
            `/api/appointments/state/${id}/reschedule`,
            { newDateTime }
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