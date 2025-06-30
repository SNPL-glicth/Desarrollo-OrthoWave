import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePatientAppointments = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            const [upcomingRes, pastRes] = await Promise.all([
                axios.get('/api/patients/appointments/upcoming'),
                axios.get('/api/patients/appointments/history')
            ]);
            
            setUpcomingAppointments(upcomingRes.data);
            setPastAppointments(pastRes.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (appointmentId: string, reason: string) => {
        await axios.post(`/api/appointments/state/${appointmentId}/cancel`, { reason });
        await fetchAppointments();
    };

    const requestReschedule = async (appointmentId: string, reason: string) => {
        await axios.post(`/api/appointments/state/${appointmentId}/reschedule-request`, { reason });
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