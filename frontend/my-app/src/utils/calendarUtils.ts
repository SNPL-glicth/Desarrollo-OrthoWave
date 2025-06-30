import { AppointmentStatus } from '../types';

export const getEventColor = (status: AppointmentStatus): string => {
    switch (status) {
        case 'SCHEDULED':
            return '#3B82F6'; // blue-500
        case 'CONFIRMED':
            return '#10B981'; // emerald-500
        case 'WAITING':
            return '#F59E0B'; // amber-500
        case 'IN_PROGRESS':
            return '#6366F1'; // indigo-500
        case 'COMPLETED':
            return '#059669'; // emerald-600
        case 'CANCELLED':
            return '#EF4444'; // red-500
        case 'RESCHEDULED':
            return '#8B5CF6'; // violet-500
        case 'NO_SHOW':
            return '#DC2626'; // red-600
        default:
            return '#6B7280'; // gray-500
    }
}; 