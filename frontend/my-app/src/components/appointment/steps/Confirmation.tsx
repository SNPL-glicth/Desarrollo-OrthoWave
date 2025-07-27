import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConfirmationProps {
    formData: any;
    updateFormData: (data: any) => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
    formData,
    updateFormData
}) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Confirmar Cita</h3>
                <p className="text-gray-600 mb-6">
                    Por favor, revisa los detalles de tu cita antes de confirmar:
                </p>
                
                {/* Detalles de la cita */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    {/* Paciente */}
                    <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                                P
                            </span>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">
                                Paciente: {formData.patientId || 'No seleccionado'}
                            </h4>
                            <p className="text-sm text-gray-600">
                                ID: {formData.patientId}
                            </p>
                        </div>
                    </div>

                    {/* Especialista */}
                    <div className="border-t pt-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold text-sm">
                                    Dr
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Especialista: {formData.specialistId || 'No seleccionado'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    ID: {formData.specialistId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fecha y hora */}
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha y Hora
                                </label>
                                <p className="text-gray-900">
                                    {formData.dateTime ? 
                                        format(formData.dateTime, 'EEEE, dd \'de\' MMMM \'de\' yyyy \'a las\' HH:mm', { locale: es }) : 
                                        'No seleccionada'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Servicio */}
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Servicio
                        </label>
                        <p className="text-gray-900">{formData.serviceId || 'No seleccionado'}</p>
                    </div>

                    {/* Notas */}
                    {formData.notes && (
                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas adicionales
                            </label>
                            <p className="text-gray-900">{formData.notes}</p>
                        </div>
                    )}
                </div>

                {/* Información importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-yellow-800 mb-2">
                        Información importante:
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Llega 15 minutos antes de tu cita</li>
                        <li>• Trae una identificación válida</li>
                        <li>• Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
                        <li>• Recibirás un recordatorio por email y SMS</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
