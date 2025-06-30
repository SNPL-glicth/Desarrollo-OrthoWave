import React from 'react';
import { Link } from 'react-router-dom';

const UserInfo: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-blue-600">U</span>
                </div>
                <div className="ml-4">
                    <h2 className="text-xl font-semibold">Usuario</h2>
                    <p className="text-gray-600">paciente@ortowhave.co</p>
                </div>
            </div>
            
            <div className="mt-6 space-y-4">
                <Link
                    to="/appointments/new"
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Agendar Nueva Cita
                </Link>
                <Link
                    to="/my-appointments"
                    className="block w-full text-center border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                    Ver Mis Citas
                </Link>
            </div>
        </div>
    );
};

export default UserInfo; 