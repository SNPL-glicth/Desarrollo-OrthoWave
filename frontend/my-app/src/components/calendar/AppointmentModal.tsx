import React from 'react';
import { useForm } from 'react-hook-form';
import { EventInput, DateSelectArg } from '@fullcalendar/core';

interface AppointmentModalProps {
    show: boolean;
    onClose: () => void;
    selectedSlot: DateSelectArg | null;
    selectedEvent: EventInput | null;
    onSubmit: (data: any) => Promise<void>;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    show,
    onClose,
    selectedSlot,
    selectedEvent,
    onSubmit
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: selectedEvent ? {
            patientId: selectedEvent.extendedProps?.patientId,
            specialistId: selectedEvent.extendedProps?.specialistId,
            type: selectedEvent.title?.split(' - ')[1],
            notes: selectedEvent.extendedProps?.notes
        } : {}
    });

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">
                    {selectedEvent ? 'Editar Cita' : 'Nueva Cita'}
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Fecha y Hora
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300"
                            value={selectedSlot?.start.toLocaleString() || 
                                  selectedEvent?.start?.toLocaleString()}
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Paciente
                        </label>
                        <select
                            {...register('patientId', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300"
                        >
                            <option value="">Seleccionar paciente</option>
                            {/* Opciones de pacientes */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Especialista
                        </label>
                        <select
                            {...register('specialistId', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300"
                        >
                            <option value="">Seleccionar especialista</option>
                            {/* Opciones de especialistas */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tipo de Cita
                        </label>
                        <select
                            {...register('type', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300"
                        >
                            <option value="CONSULTA">Consulta</option>
                            <option value="CONTROL">Control</option>
                            <option value="EMERGENCIA">Emergencia</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Notas
                        </label>
                        <textarea
                            {...register('notes')}
                            className="mt-1 block w-full rounded-md border-gray-300"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            {selectedEvent ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 