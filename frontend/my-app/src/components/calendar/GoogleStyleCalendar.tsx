import React, { useEffect, useCallback, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarProps } from '../../types/calendar';
import { getCurrentDate, getCurrentTimeString, TIMEZONE } from '../../utils/dateUtils';
import CustomNowIndicator from './CustomNowIndicator';

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
  
  // Crear la fecha "ahora" en zona horaria de Colombia para FullCalendar
  const createColombiaTime = (): string => {
    // Obtener la fecha y hora actual en Colombia
    const now = new Date();
    const colombiaFormatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const colombiaDateTime = colombiaFormatter.format(now);
    console.log('🇨🇴 Hora Colombia para FullCalendar:', colombiaDateTime);
    
    return colombiaDateTime;
  };

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

  // Manejar cambios internos del calendario - SIMPLIFICADO
  const handleDatesSet = useCallback((arg: any) => {
    // Simplemente usar el primer día del rango visible
    const newDate = new Date(arg.start);
    
    console.log('GoogleStyleCalendar - handleDatesSet llamado con:', {
      start: arg.start,
      newDate: newDate.toLocaleDateString('es'),
      view: arg.view?.type
    });
    
    if (onDateChange) {
      console.log('GoogleStyleCalendar - Llamando onDateChange con:', newDate.toLocaleDateString('es'));
      onDateChange(newDate);
    }
  }, [onDateChange]);

  return (
    <div className="h-full relative">
      <FullCalendar
        key={`calendar-${config.initialDate?.toISOString()}-${config.view}`}
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={config.view}
        initialDate={config.initialDate}
        locale={esLocale}
        timeZone={config.timezone}
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
        // datesSet={handleDatesSet} // Temporalmente desactivado para debug
        // Configuración adicional para mejor apariencia
        aspectRatio={1.35}
        expandRows={true}
        stickyHeaderDates={false}
        // Formato personalizado para encabezados de día
        dayHeaderFormat={{
          weekday: 'long',
          omitCommas: true
        }}
        // Configuración de horarios
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:20:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: false,
          hour12: false
        }}
        allDaySlot={false}
        nowIndicator={true} // Reactivamos el indicador nativo
        now={createColombiaTime()} // Pasamos la hora de Colombia
        scrollTime="08:00:00"
        // Estilos personalizados para que se vea más como Google Calendar
        eventClassNames="google-calendar-event"
      />
    </div>
  );
};

export default GoogleStyleCalendar;
