import React from 'react';
import AvailableAppointments from '../../components/patient/AvailableAppointments';

const BookAppointment: React.FC = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Agendar Nueva Cita</h1>
                <div className="bg-white rounded-lg shadow">
                    <AvailableAppointments />
                </div>
            </div>
        </div>
    );
};

export default BookAppointment; 