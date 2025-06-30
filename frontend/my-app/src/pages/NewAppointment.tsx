import React from 'react';
import AppointmentWizard from '../components/appointment/AppointmentWizard';

const NewAppointmentPage: React.FC = () => {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Agendar Nueva Cita</h1>
            <AppointmentWizard />
        </div>
    );
};

export default NewAppointmentPage; 