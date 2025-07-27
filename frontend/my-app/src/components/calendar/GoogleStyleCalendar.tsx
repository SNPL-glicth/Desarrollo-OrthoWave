import React, { useState, useEffect } from 'react';
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

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={config.view}
      locale={esLocale}
      events={events}
      weekends={config.features.weekends}
      editable={config.features.dragAndDrop}
      selectable={config.features.selection}
      selectMirror
      dayMaxEvents
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      businessHours={{
        daysOfWeek: config.businessHours.daysOfWeek,
        startTime: config.businessHours.start,
        endTime: config.businessHours.end,
      }}
      select={handleDateSelect}
      eventContent={renderEventContent}
      eventClick={handleEventClick}
      eventDrop={handleEventDrop}
      datesSet={handleDateChange}
    />
  );
};

export default GoogleStyleCalendar;
