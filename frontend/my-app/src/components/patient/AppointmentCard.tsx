import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Cita } from '../../services/citasService';

interface AppointmentCardProps {
    appointment: Cita;
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
                        {appointment.tipoConsulta || 'Consulta médica'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Dr. {appointment.doctor?.nombre || 'No disponible'} {appointment.doctor?.apellido || ''}
                    </p>
                    {appointment.motivoConsulta && (
                        <p className="text-sm text-gray-600 mt-1">
                            {appointment.motivoConsulta}
                        </p>
                    )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${getStatusStyle(appointment.estado)}`}>
                    {getStatusText(appointment.estado)}
                </span>
            </div>

            <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                    {format(new Date(appointment.fechaHora), 
                           "EEEE d 'de' MMMM 'de' yyyy, HH:mm", 
                           { locale: es })}
                </span>
            </div>

            {appointment.duracion && (
                <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Duración: {appointment.duracion} minutos</span>
                </div>
            )}

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
    switch (status?.toLowerCase()) {
        case 'confirmada':
            return 'bg-green-100 text-green-800';
        case 'aprobada':
            return 'bg-blue-100 text-blue-800';
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelada':
            return 'bg-red-100 text-red-800';
        case 'completada':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
        'confirmada': 'Confirmada',
        'aprobada': 'Aprobada',
        'pendiente': 'Pendiente',
        'cancelada': 'Cancelada',
        'completada': 'Completada',
        'no_asistio': 'No Asistió'
    };
    return statusMap[status?.toLowerCase()] || status || 'Desconocido';
};

export default AppointmentCard;
