import React from 'react';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AppointmentHistory: React.FC = () => {
    const { pastAppointments } = usePatientAppointments();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Especialista
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Servicio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pastAppointments.map(appointment => (
                        <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {format(new Date(appointment.startTime), 
                                       "d 'de' MMMM 'de' yyyy, HH:mm", 
                                       { locale: es })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                Dr. {appointment.specialist.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {appointment.service.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${getStatusColor(appointment.status)}`}>
                                    {getStatusText(appointment.status)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 text-green-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        case 'NO_SHOW':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: string) => {
    const statusMap = {
        'COMPLETED': 'Completada',
        'CANCELLED': 'Cancelada',
        'NO_SHOW': 'No Asistió',
        'RESCHEDULED': 'Reprogramada'
    };
    return statusMap[status] || status;
};

export default AppointmentHistory; 