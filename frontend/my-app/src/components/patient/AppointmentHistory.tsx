import React from 'react';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Cita } from '../../services/citasService';

const AppointmentHistory: React.FC = () => {
    const { pastAppointments, loading, error } = usePatientAppointments();
    const appointmentsList = pastAppointments || [];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Cargando historial...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error al cargar el historial: {error}</p>
            </div>
        );
    }

    if (appointmentsList.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No hay citas en el historial.</p>
                <p className="text-sm mt-2">Las citas completadas aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo de Consulta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duración
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {appointmentsList.map((appointment: Cita) => (
                        <tr key={appointment.id || Math.random()}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {format(new Date(appointment.fechaHora), 
                                       "d 'de' MMMM 'de' yyyy, HH:mm", 
                                       { locale: es })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                Dr. {appointment.doctor?.nombre || 'No disponible'} {appointment.doctor?.apellido || ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {appointment.tipoConsulta || 'No especificado'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${getStatusColor(appointment.estado)}`}>
                                    {getStatusText(appointment.estado)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {appointment.duracion || 30} min
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'completada':
            return 'bg-green-100 text-green-800';
        case 'cancelada':
            return 'bg-red-100 text-red-800';
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800';
        case 'confirmada':
            return 'bg-blue-100 text-blue-800';
        case 'no_asistio':
            return 'bg-orange-100 text-orange-800';
        case 'aprobada':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
        'completada': 'Completada',
        'cancelada': 'Cancelada',
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'no_asistio': 'No Asistió',
        'aprobada': 'Aprobada'
    };
    return statusMap[status?.toLowerCase()] || status || 'Desconocido';
};

export default AppointmentHistory; 