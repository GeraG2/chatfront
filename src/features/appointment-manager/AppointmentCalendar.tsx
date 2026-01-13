// File: src/features/appointment-manager/AppointmentCalendar.tsx

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { Appointment } from './AppointmentManager'; // Importamos el tipo
import { Box } from '@mui/material';

// Props que el calendario espera recibir de su padre
interface AppointmentCalendarProps {
  appointments: Appointment[];
  slotDuration: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  handleEventClick: (arg: EventClickArg) => void;
  handleDateSelect: (arg: DateSelectArg) => void;
  handleEventDrop: (arg: EventDropArg) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  slotDuration,
  businessHoursStart,
  businessHoursEnd,
  handleEventClick,
  handleDateSelect,
  handleEventDrop,
}) => {
  // Transformamos los datos de la API de Google al formato que FullCalendar espera
  const calendarEvents = appointments.map(app => ({
    id: app.id,
    title: app.summary,
    start: app.start?.dateTime,
    end: app.end?.dateTime,
  }));

  return (
    // --- INICIO DE LA MODIFICACIÓN DE ESTILO ---
    // Envolvemos el calendario en un Box para aplicar estilos personalizados
    // a través de las variables CSS que FullCalendar expone.
    <Box sx={{
      '.fc': { // Estilos generales del calendario
        '--fc-border-color': 'rgba(255, 255, 255, 0.2)',
        '--fc-day-header-bg-color': '#1e293b', // Fondo de la cabecera de días (más oscuro)
        '--fc-today-bg-color': 'rgba(99, 102, 241, 0.2)', // Fondo del día de hoy (índigo transparente)
        '--fc-event-bg-color': '#6366f1', // Color de los eventos (índigo)
        '--fc-event-border-color': '#4f46e5',
        color: '#5a626dff', // Color del texto general
      },
      '.fc .fc-button-primary': { // Estilos para los botones
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
        '&:hover': {
          backgroundColor: '#6366f1',
        }
      },
      '.fc .fc-day-header': { // Estilos para el texto de la cabecera de días
        color: '#94a3b8',
        fontWeight: 'bold',
      }
    }}>
    {/* --- FIN DE LA MODIFICACIÓN DE ESTILO --- */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotDuration={slotDuration}
        businessHours={{
          daysOfWeek: [ 1, 2, 3, 4, 5, 6, 0 ], // Lunes a Domingo
          startTime: businessHoursStart,
          endTime: businessHoursEnd,
        }}
        slotMinTime={businessHoursStart}
        slotMaxTime={businessHoursEnd}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        events={calendarEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        height="auto"
        locale="es"
        buttonText={{
            today:    'Hoy',
            month:    'Mes',
            week:     'Semana',
            day:      'Día',
        }}
      />
    </Box>
  );
};

export default AppointmentCalendar;