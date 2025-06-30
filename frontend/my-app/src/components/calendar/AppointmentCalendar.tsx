import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { AppointmentModal } from './AppointmentModal';
import { useAppointments } from '../../hooks/useAppointments';
import { getEventColor } from '../../utils/calendarUtils';

const AppointmentCalendar: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
    
    const { 
        appointments, 
        createAppointment, 
        updateAppointment,
        rescheduleAppointment 
    } = useAppointments();

    const events: EventInput[] = appointments.map(appointment => ({
        id: appointment.id.toString(),
        title: `${appointment.patient.name} - ${appointment.type}`,
        start: appointment.startTime,
        end: appointment.endTime,
        backgroundColor: getEventColor(appointment.status),
        extendedProps: {
            status: appointment.status,
            patientId: appointment.patient.id,
            specialistId: appointment.specialist.id
        }
    }));

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectedSlot(selectInfo);
        setShowModal(true);
    };

    const handleEventDrop = async (dropInfo: EventDropArg) => {
        try {
            const appointmentId = parseInt(dropInfo.event.id);
            await rescheduleAppointment(appointmentId, dropInfo.event.start!);
        } catch (error) {
            console.error('Error al reprogramar la cita:', error);
            dropInfo.revert();
        }
    };

    return (
        <div className="h-full bg-white rounded-lg shadow p-4">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventDrop={handleEventDrop}
                eventClick={(info) => {
                    setSelectedEvent(info.event);
                    setShowModal(true);
                }}
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }}
                allDaySlot={false}
                locale="es"
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '08:00',
                    endTime: '18:00',
                }}
            />

            <AppointmentModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedSlot(null);
                    setSelectedEvent(null);
                }}
                selectedSlot={selectedSlot}
                selectedEvent={selectedEvent}
                onSubmit={async (data) => {
                    if (selectedEvent) {
                        await updateAppointment(parseInt(selectedEvent.id!), data);
                    } else {
                        await createAppointment(data);
                    }
                    setShowModal(false);
                }}
            />
        </div>
    );
};

export default AppointmentCalendar; 