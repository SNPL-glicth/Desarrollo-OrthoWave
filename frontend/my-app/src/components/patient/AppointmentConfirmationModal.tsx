import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    appointmentData: {
        startTime: string;
        specialist: {
            name: string;
            specialty: string;
        };
    } | null;
    loading?: boolean;
}

const AppointmentConfirmationModal: React.FC<AppointmentConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    appointmentData,
    loading = false
}) => {
    if (!isOpen || !appointmentData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-4">
                    Confirmar Cita
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600">Fecha y Hora</p>
                        <p className="font-medium">
                            {format(new Date(appointmentData.startTime), 
                                "EEEE d 'de' MMMM 'de' yyyy, HH:mm", 
                                { locale: es }
                            )}
                        </p>
                    </div>
                    
                    <div>
                        <p className="text-sm text-gray-600">Especialista</p>
                        <p className="font-medium">Dr. {appointmentData.specialist.name}</p>
                        <p className="text-sm text-gray-500">{appointmentData.specialist.specialty}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <span>{loading ? 'Confirmando...' : 'Confirmar Cita'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentConfirmationModal; 