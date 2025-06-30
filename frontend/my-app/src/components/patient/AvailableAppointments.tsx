import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import { DayPicker } from 'react-day-picker';
import AppointmentConfirmationModal from './AppointmentConfirmationModal';
import 'react-day-picker/dist/style.css';

const AvailableAppointments: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const { availableSlots, loading, specialties } = useAvailableSlots(selectedDate, selectedSpecialty);

    const handleSlotSelection = (slot: any) => {
        setSelectedSlot(slot);
        setShowConfirmationModal(true);
    };

    const handleConfirmAppointment = async () => {
        try {
            // Aquí iría la llamada a la API para confirmar la cita
            console.log('Confirmando cita:', selectedSlot);
            // Después de confirmar exitosamente
            setShowConfirmationModal(false);
            // Redirigir a la página de mis citas o mostrar mensaje de éxito
        } catch (error) {
            console.error('Error al confirmar la cita:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Agendar Nueva Cita</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selector de Especialidad */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Selecciona Especialidad
                    </label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                    >
                        <option value="">Todas las especialidades</option>
                        {specialties.map(specialty => (
                            <option key={specialty.id} value={specialty.id}>
                                {specialty.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Calendario */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Selecciona Fecha
                    </label>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={es}
                        className="border rounded-md p-2"
                        fromDate={new Date()}
                        modifiers={{
                            available: (date) => {
                                return availableSlots.some(slot => 
                                    format(new Date(slot.date), 'yyyy-MM-dd') === 
                                    format(date, 'yyyy-MM-dd')
                                );
                            }
                        }}
                        modifiersStyles={{
                            available: { backgroundColor: '#dbeafe' }
                        }}
                    />
                </div>
            </div>

            {/* Horarios Disponibles */}
            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">
                        Horarios Disponibles para {format(selectedDate, "d 'de' MMMM", { locale: es })}
                    </h3>
                    
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleSlotSelection(slot)}
                                        className="p-4 text-center border rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="font-medium text-blue-600">
                                            {format(new Date(slot.startTime), 'HH:mm')}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Dr. {slot.specialist.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {slot.specialist.specialty}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-4">
                                    No hay horarios disponibles para esta fecha
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <AppointmentConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={handleConfirmAppointment}
                appointmentData={selectedSlot}
            />
        </div>
    );
};

export default AvailableAppointments; 