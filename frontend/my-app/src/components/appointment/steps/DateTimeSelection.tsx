import React, { useState, useEffect } from 'react';
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCurrentColombiaDate } from '../../../utils/dateUtils';

interface DateTimeSelectionProps {
    formData: any;
    updateFormData: (data: any) => void;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
    formData,
    updateFormData
}) => {
    const [selectedDate, setSelectedDate] = useState<Date>(formData.dateTime || getCurrentColombiaDate());
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('');

    // Generar horarios disponibles (ejemplo: 8:00 AM - 5:00 PM)
    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        for (let hour = 8; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({
                    time,
                    available: Math.random() > 0.3 // Simulación de disponibilidad
                });
            }
        }
        return slots;
    };

    useEffect(() => {
        // Cargar horarios disponibles para la fecha seleccionada
        setAvailableSlots(generateTimeSlots());
    }, [selectedDate, formData.specialistId]);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime('');
        updateFormData({ dateTime: null });
    };

    const handleTimeSelect = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours, minutes, 0, 0);
        
        // Validación: evitar seleccionar fechas/horas pasadas usando hora de Colombia
        const nowColombia = getCurrentColombiaDate();
        if (dateTime <= nowColombia) {
            alert(`No se puede seleccionar una fecha y hora en el pasado. Hora actual de Colombia: ${nowColombia.toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
            return;
        }
        
        setSelectedTime(time);
        updateFormData({ dateTime });
    };

    const generateDateOptions = () => {
        const dates = [];
        const today = getCurrentColombiaDate();
        
        for (let i = 0; i < 14; i++) {
            const date = addDays(today, i);
            dates.push(date);
        }
        
        return dates;
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Seleccionar Fecha y Hora</h3>
                
                {/* Selección de fecha */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Fecha</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {generateDateOptions().map((date) => (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateChange(date)}
                                className={`p-3 text-sm rounded-lg border transition-colors ${
                                    selectedDate?.toDateString() === date.toDateString()
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                <div className="font-medium">
                                    {format(date, 'EEE', { locale: es })}
                                </div>
                                <div className="text-xs">
                                    {format(date, 'dd/MM', { locale: es })}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selección de hora */}
                <div>
                    <label className="block text-sm font-medium mb-2">Hora disponible</label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                        {availableSlots.map((slot) => (
                            <button
                                key={slot.time}
                                onClick={() => slot.available && handleTimeSelect(slot.time)}
                                disabled={!slot.available}
                                className={`p-2 text-sm rounded-lg border transition-colors ${
                                    selectedTime === slot.time
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : slot.available
                                        ? 'bg-white border-gray-300 hover:border-blue-300'
                                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Información seleccionada */}
            {selectedTime && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Fecha y hora seleccionada:</h4>
                    <p className="text-blue-700">
                        {format(selectedDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })} a las {selectedTime}
                    </p>
                </div>
            )}
        </div>
    );
};
