import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTASection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-blue-600 text-white py-12">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">
                    ¿Necesitas una cita?
                </h2>
                <p className="mb-8">
                    Agenda tu cita de manera rápida y sencilla
                </p>
                <button
                    onClick={() => navigate('/appointments/new')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                    Agendar Ahora
                </button>
            </div>
        </div>
    );
};

export default CTASection; 