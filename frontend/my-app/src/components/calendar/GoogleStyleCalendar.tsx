import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatDate } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarEvent, CalendarConfig, CalendarProps } from '../../types/calendar';

const GoogleStyleCalendar: React.FC<CalendarProps> = ({
  events,
  config,
  onEventClick,
  onEventDrop,
  onViewChange,
  onDateChange,
  onDateSelect,
  className = '',
}) => {
  const calendarRef = React.useRef<any>(null);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventData = events.find(event => event.id === clickInfo.event.id);
    if (eventData && onEventClick) {
      onEventClick(eventData);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  const handleDateChange = (arg: any) => {
    if (onDateChange) {
      onDateChange(arg.start);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const eventData = events.find(event => event.id === dropInfo.event.id);
    if (eventData && onEventDrop) {
      onEventDrop(eventData, dropInfo.event.start!, dropInfo.event.end!);
    }
  };

  const renderEventContent = (eventContent: EventContentArg) => (
    <>
      <b>{eventContent.timeText}</b>
      <i>{eventContent.event.title}</i>
    </>
  );

  // Convertir eventos CalendarEvent a formato FullCalendar
  const fullCalendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor || event.backgroundColor,
    textColor: event.textColor || '#ffffff',
    allDay: event.allDay || false,
    editable: event.editable !== false && config.features.dragAndDrop,
    extendedProps: event.extendedProps || {},
  }));

  // Sync the calendar with external navigation
  useEffect(() => {
    if (calendarRef.current && config.initialDate) {
      const calendarApi = calendarRef.current.getApi();
      
      // Cambiar vista si es diferente
      if (calendarApi.view.type !== config.view) {
        calendarApi.changeView(config.view);
      }
      
      // Ir a la fecha si es diferente
      const currentCalendarDate = calendarApi.getDate();
      const targetDate = new Date(config.initialDate);
      
      // Comparar fechas normalizadas para evitar actualizaciones innecesarias
      const currentNormalized = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate());
      const targetNormalized = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      if (currentNormalized.getTime() !== targetNormalized.getTime()) {
        calendarApi.gotoDate(targetDate);
      }
    }
  }, [config.view, config.initialDate]);

  // Manejar cambios internos del calendario y sincronizar con el estado externo
  const handleDatesSet = useCallback((arg: any) => {
    // Solo actualizar si la fecha realmente cambió para evitar loops
    const newDate = new Date(arg.start);
    
    // Ajustar la fecha basada en la vista
    if (config.view === 'dayGridMonth') {
      // Para vista mensual, obtener el primer día visible del mes
      const firstDay = new Date(arg.start);
      // Buscar el primer día que esté en el mes actual
      const endDay = new Date(arg.end);
      let targetDate = new Date(firstDay);
      
      // Si el primer día visible no está en el mes actual, buscar el primer día del mes actual
      while (targetDate < endDay) {
        if (targetDate.getDate() >= 1 && targetDate.getDate() <= 15) {
          break;
        }
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      // Usar el día 15 del mes visible para representar el mes
      targetDate.setDate(15);
      newDate.setTime(targetDate.getTime());
    } else if (config.view === 'timeGridWeek') {
      // Para vista semanal, usar el lunes de esa semana
      const monday = new Date(arg.start);
      const dayOfWeek = monday.getDay();
      const daysToAdd = dayOfWeek === 0 ? 1 : (1 - dayOfWeek + 7) % 7;
      monday.setDate(monday.getDate() + daysToAdd);
      newDate.setTime(monday.getTime());
    }
    
    if (onDateChange) {
      onDateChange(newDate);
    }
  }, [config.view, onDateChange]);

  return (
    <div className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={config.view}
        locale={esLocale}
        events={fullCalendarEvents}
        weekends={config.features.weekends}
        editable={config.features.dragAndDrop}
        selectable={config.features.selection}
        selectMirror
        dayMaxEvents
        height="auto"
        headerToolbar={false} // Deshabilitamos el header interno para usar solo el navbar personalizado
        businessHours={{
          daysOfWeek: config.businessHours.daysOfWeek,
          startTime: config.businessHours.start,
          endTime: config.businessHours.end,
        }}
        select={handleDateSelect}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        datesSet={handleDatesSet}
        // Configuración adicional para mejor apariencia
        aspectRatio={1.35}
        expandRows={true}
        stickyHeaderDates={false}
        // Formato personalizado para encabezados de día
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric',
          omitCommas: true
        }}
        // Configuración de horarios
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: false,
          hour12: false
        }}
        allDaySlot={false}
        nowIndicator={true}
        scrollTime="08:00:00"
        // Estilos personalizados para que se vea más como Google Calendar
        eventClassNames="google-calendar-event"
      />
    </div>
  );
};

export default GoogleStyleCalendar;
