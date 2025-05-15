"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";

// Configuración de localización para el calendario
const locales = {
  es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Mensajes en español
const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango",
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: string;
  allDay: boolean;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  currentUserId: string;
}

export function CalendarView({ events, currentUserId }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Personalizar el estilo de los eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    // Verificar si el evento pertenece al usuario actual
    const isCurrentUser = event.employeeId === currentUserId;

    const style = {
      backgroundColor: isCurrentUser ? "#3182ce" : "#718096", // azul para usuario actual, gris para otros
      borderRadius: "0.25rem",
      opacity: 0.8,
      color: "white",
      border: "none",
      display: "block",
      padding: "0.25rem 0.5rem",
    };

    return {
      style,
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="h-[700px] flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          messages={messages}
          culture="es"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={["month", "week", "day"]}
        />
      </div>

      {selectedEvent && (
        <div className="w-full md:w-64">
          <Card>
            <CardContent className="py-4">
              <h3 className="font-medium mb-2">{selectedEvent.title}</h3>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  Desde: {format(selectedEvent.start, "PPP", { locale: es })}
                </p>
                <p className="text-muted-foreground">
                  Hasta: {format(selectedEvent.end, "PPP", { locale: es })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
