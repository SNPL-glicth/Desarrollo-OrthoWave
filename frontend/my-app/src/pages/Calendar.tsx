import React from 'react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';

const CalendarPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Calendario de Citas</h1>
            <div className="h-[calc(100vh-12rem)]">
                <AppointmentCalendar />
            </div>
        </div>
    );
};

export default CalendarPage; 