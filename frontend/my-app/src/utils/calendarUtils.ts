import { AppointmentStatus } from '../types';

export const getEventColor = (status: AppointmentStatus): string => {
    switch (status) {
        case 'scheduled':
            return '#3B82F6'; // blue-500
        case 'confirmed':
            return '#10B981'; // emerald-500
        case 'in_progress':
            return '#6366F1'; // indigo-500
        case 'completed':
            return '#059669'; // emerald-600
        case 'cancelled':
            return '#EF4444'; // red-500
        case 'no_show':
            return '#DC2626'; // red-600
        default:
            return '#6B7280'; // gray-500
    }
};
