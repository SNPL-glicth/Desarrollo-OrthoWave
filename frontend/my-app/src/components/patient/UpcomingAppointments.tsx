import React, { useState } from 'react';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import AppointmentCard from './AppointmentCard';
import RescheduleModal from './RescheduleModal';
import CancelModal from './CancelModal';

const UpcomingAppointments: React.FC = () => {
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const { upcomingAppointments, cancelAppointment, requestReschedule } = usePatientAppointments();

    const handleRescheduleRequest = async (appointmentId: string, reason: string) => {
        await requestReschedule(appointmentId, reason);
        setShowRescheduleModal(false);
    };

    const handleCancellation = async (appointmentId: string, reason: string) => {
        await cancelAppointment(appointmentId, reason);
        setShowCancelModal(false);
    };

    return (
        <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No tienes citas programadas
                </div>
            ) : (
                upcomingAppointments.map(appointment => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onReschedule={() => {
                            setSelectedAppointment(appointment);
                            setShowRescheduleModal(true);
                        }}
                        onCancel={() => {
                            setSelectedAppointment(appointment);
                            setShowCancelModal(true);
                        }}
                    />
                ))
            )}

            <RescheduleModal
                show={showRescheduleModal}
                appointment={selectedAppointment}
                onClose={() => setShowRescheduleModal(false)}
                onSubmit={handleRescheduleRequest}
            />

            <CancelModal
                show={showCancelModal}
                appointment={selectedAppointment}
                onClose={() => setShowCancelModal(false)}
                onSubmit={handleCancellation}
            />
        </div>
    );
};

export default UpcomingAppointments; 