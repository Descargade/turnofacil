"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  getDay,
  setHours,
  setMinutes,
} from "date-fns";
import { es } from "date-fns/locale";

type ViewMode = "diaria" | "semanal" | "mensual";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  clientName: string;
  serviceName: string;
  employeeName: string;
}

const today = new Date();

const mockAppointments: CalendarEvent[] = [
  {
    id: "1",
    title: "Corte de cabello",
    start: setMinutes(setHours(today, 9), 0),
    end: setMinutes(setHours(today, 9), 30),
    status: "CONFIRMED",
    clientName: "María García",
    serviceName: "Corte de cabello",
    employeeName: "Ana López",
  },
  {
    id: "2",
    title: "Barba completa",
    start: setMinutes(setHours(today, 9), 30),
    end: setMinutes(setHours(today, 9), 50),
    status: "PENDING",
    clientName: "Pedro Sánchez",
    serviceName: "Barba completa",
    employeeName: "Carlos Ruiz",
  },
  {
    id: "3",
    title: "Tinte",
    start: setMinutes(setHours(today, 10), 0),
    end: setMinutes(setHours(today, 11), 30),
    status: "CONFIRMED",
    clientName: "Laura Martínez",
    serviceName: "Tinte",
    employeeName: "Sofía Hernández",
  },
  {
    id: "4",
    title: "Corte + Barba",
    start: setMinutes(setHours(today, 10), 30),
    end: setMinutes(setHours(today, 11), 15),
    status: "COMPLETED",
    clientName: "Jorge López",
    serviceName: "Corte + Barba",
    employeeName: "Carlos Ruiz",
  },
  {
    id: "5",
    title: "Manicure",
    start: setMinutes(setHours(today, 11), 0),
    end: setMinutes(setHours(today, 12), 0),
    status: "PENDING",
    clientName: "Camila Torres",
    serviceName: "Manicure",
    employeeName: "Ana López",
  },
  {
    id: "6",
    title: "Corte femenino",
    start: setMinutes(setHours(addDays(today, 1), 14), 0),
    end: setMinutes(setHours(addDays(today, 1), 14), 45),
    status: "CONFIRMED",
    clientName: "Lucía Fernández",
    serviceName: "Corte femenino",
    employeeName: "Ana López",
  },
  {
    id: "7",
    title: "Tatuaje pequeño",
    start: setMinutes(setHours(addDays(today, 2), 15), 0),
    end: setMinutes(setHours(addDays(today, 2), 16), 0),
    status: "PENDING",
    clientName: "Martín Silva",
    serviceName: "Tatuaje pequeño",
    employeeName: "Sofía Hernández",
  },
];

const statusConfig: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  PENDING: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Pendiente" },
  CONFIRMED: { color: "text-blue-700", bg: "bg-blue-100", label: "Confirmada" },
  COMPLETED: { color: "text-green-700", bg: "bg-green-100", label: "Completada" },
  CANCELLED: { color: "text-red-700", bg: "bg-red-100", label: "Cancelada" },
};

const hours = Array.from({ length: 12 }, (_, i) => i + 8);

export default function CalendarioPage() {
  const [view, setView] = useState<ViewMode>("semanal");
  const [currentDate, setCurrentDate] = useState(today);
  const [employeeFilter, setEmployeeFilter] = useState<string>("todos");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;

  const employees = ["todos", ...new Set(mockAppointments.map((a) => a.employeeName))];

  const filteredAppointments = mockAppointments.filter(
    (a) => employeeFilter === "todos" || a.employeeName === employeeFilter
  );

  const getAppointmentsForDay = (day: Date) =>
    filteredAppointments.filter((a) => isSameDay(a.start, day));

  const getAppointmentsForHour = (day: Date, hour: number) =>
    filteredAppointments.filter((a) => {
      const aHour = a.start.getHours();
      return isSameDay(a.start, day) && aHour === hour;
    });

  const navigatePrev = () => {
    if (view === "semanal") setCurrentDate((d) => subWeeks(d, 1));
    else if (view === "diaria") setCurrentDate((d) => addDays(d, -1));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    if (view === "semanal") setCurrentDate((d) => addWeeks(d, 1));
    else if (view === "diaria") setCurrentDate((d) => addDays(d, 1));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const goToday = () => setCurrentDate(today);

  const headerLabel =
    view === "semanal"
      ? `${format(weekStart, "d MMM", { locale: es })} - ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}`
      : view === "diaria"
        ? format(currentDate, "EEEE d 'de' MMMM yyyy", { locale: es })
        : format(currentDate, "MMMM yyyy", { locale: es });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Vista de tus citas programadas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por empleado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los empleados</SelectItem>
              {employees
                .filter((e) => e !== "todos")
                .map((emp) => (
                  <SelectItem key={emp} value={emp}>
                    {emp}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold capitalize">{headerLabel}</h2>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday}>
              Hoy
            </Button>
            <div className="flex rounded-md border">
              {(["diaria", "semanal", "mensual"] as ViewMode[]).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                  onClick={() => setView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {view === "semanal" && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
                  <div className="border-r p-2" />
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`border-r p-2 text-center text-sm ${
                        isSameDay(day, today)
                          ? "bg-primary/10 font-semibold text-primary"
                          : ""
                      }`}
                    >
                      <div className="text-xs text-muted-foreground">
                        {format(day, "EEE", { locale: es })}
                      </div>
                      <div className="text-lg">{format(day, "d")}</div>
                    </div>
                  ))}
                </div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[60px_repeat(7,1fr)] border-b"
                  >
                    <div className="border-r p-2 text-right text-xs text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    {weekDays.map((day) => {
                      const dayAppts = getAppointmentsForHour(day, hour);
                      return (
                        <div
                          key={day.toISOString() + hour}
                          className="relative min-h-[60px] border-r p-1"
                        >
                          {dayAppts.map((apt) => (
                            <div
                              key={apt.id}
                              className={`mb-0.5 cursor-pointer rounded p-1 text-[10px] leading-tight ${statusConfig[apt.status].bg} ${statusConfig[apt.status].color}`}
                            >
                              <div className="font-semibold truncate">
                                {apt.clientName}
                              </div>
                              <div className="truncate opacity-75">
                                {format(apt.start, "HH:mm")} -{" "}
                                {format(apt.end, "HH:mm")}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "diaria" && (
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                {hours.map((hour) => {
                  const dayAppts = getAppointmentsForHour(currentDate, hour);
                  return (
                    <div
                      key={hour}
                      className="flex border-b"
                    >
                      <div className="w-16 shrink-0 border-r p-2 text-right text-xs text-muted-foreground">
                        {String(hour).padStart(2, "0")}:00
                      </div>
                      <div className="relative min-h-[80px] flex-1 p-2">
                        {dayAppts.map((apt) => (
                          <div
                            key={apt.id}
                            className={`mb-1 rounded-lg p-3 ${statusConfig[apt.status].bg} ${statusConfig[apt.status].color}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">
                                {apt.clientName}
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                {statusConfig[apt.status].label}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-xs opacity-75">
                              <span className="flex items-center gap-1">
                                <Scissors className="h-3 w-3" />
                                {apt.serviceName}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {apt.employeeName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(apt.start, "HH:mm")} -{" "}
                                {format(apt.end, "HH:mm")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "mensual" && (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-px bg-muted">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                  (day) => (
                    <div
                      key={day}
                      className="bg-card p-2 text-center text-xs font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  )
                )}
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="bg-card p-2" />
                ))}
                {monthDays.map((day) => {
                  const dayAppts = getAppointmentsForDay(day);
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[80px] bg-card p-1 ${
                        isToday ? "ring-2 ring-primary ring-inset" : ""
                      }`}
                    >
                      <div
                        className={`mb-1 text-right text-xs ${
                          isToday
                            ? "font-bold text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5">
                        {dayAppts.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className={`truncate rounded px-1 py-0.5 text-[9px] ${statusConfig[apt.status].bg} ${statusConfig[apt.status].color}`}
                          >
                            {format(apt.start, "HH:mm")} {apt.clientName}
                          </div>
                        ))}
                        {dayAppts.length > 3 && (
                          <div className="text-[9px] text-muted-foreground text-center">
                            +{dayAppts.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
