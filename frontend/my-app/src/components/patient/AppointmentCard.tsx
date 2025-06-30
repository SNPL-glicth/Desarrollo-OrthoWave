import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentCardProps {
    appointment: any;
    onReschedule: () => void;
    onCancel: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    onReschedule,
    onCancel
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {appointment.service.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Dr. {appointment.specialist.name}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${getStatusStyle(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                </span>
            </div>

            <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                    {format(new Date(appointment.startTime), 
                           "EEEE d 'de' MMMM 'de' yyyy, HH:mm", 
                           { locale: es })}
                </span>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    onClick={onReschedule}
                    className="px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-md"
                >
                    Solicitar Reprogramación
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-green-100 text-green-800';
        case 'SCHEDULED':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default AppointmentCard; 