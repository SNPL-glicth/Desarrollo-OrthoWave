import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyAppointments: React.FC = () => {
    const navigate = useNavigate();

    const handleBookAppointment = () => {
        navigate('/appointments/new');
    };

    return (
        <div className="text-center py-8">
            <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-gray-600 mb-4">
                    No tienes citas programadas.
                </p>
            </div>
            
            <button
                onClick={handleBookAppointment}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                Agendar una cita
            </button>
        </div>
    );
};

export default MyAppointments; 