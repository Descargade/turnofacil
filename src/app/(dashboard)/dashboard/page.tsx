"use client";

import {
  CalendarCheck,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Clock,
  UserPlus,
  Scissors,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    title: "Citas hoy",
    value: "12",
    change: "+2 desde ayer",
    icon: CalendarCheck,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Ingresos del mes",
    value: "$48.500",
    change: "+12% vs mes anterior",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Clientes activos",
    value: "156",
    change: "+8 nuevos este mes",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Tasa de asistencia",
    value: "94%",
    change: "+2% vs mes anterior",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

const upcomingAppointments = [
  {
    id: "1",
    client: "María García",
    service: "Corte de cabello",
    employee: "Ana López",
    time: "09:00",
    date: "Hoy",
  },
  {
    id: "2",
    client: "Pedro Sánchez",
    service: "Barba completa",
    employee: "Carlos Ruiz",
    time: "09:30",
    date: "Hoy",
  },
  {
    id: "3",
    client: "Laura Martínez",
    service: "Tinte",
    employee: "Sofía Hernández",
    time: "10:00",
    date: "Hoy",
  },
  {
    id: "4",
    client: "Jorge López",
    service: "Corte + Barba",
    employee: "Carlos Ruiz",
    time: "10:30",
    date: "Hoy",
  },
  {
    id: "5",
    client: "Camila Torres",
    service: "Manicure",
    employee: "Ana López",
    time: "11:00",
    date: "Hoy",
  },
];

const recentActivity = [
  { text: "María García confirmó su cita de las 09:00", time: "Hace 5 min" },
  { text: "Nuevo cliente registrado: Pedro Sánchez", time: "Hace 15 min" },
  { text: "Cita completada: Corte de cabello - Juan Pérez", time: "Hace 1 hora" },
  { text: "Servicio actualizado: Barba completa", time: "Hace 2 horas" },
  { text: "Carlos Ruiz canceló su disponibilidad del viernes", time: "Hace 3 horas" },
];

const revenueData = [
  { month: "Ene", value: 35000 },
  { month: "Feb", value: 42000 },
  { month: "Mar", value: 38000 },
  { month: "Abr", value: 45000 },
  { month: "May", value: 52000 },
  { month: "Jun", value: 48500 },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.value));

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu negocio - {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${metric.bg}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Próximas citas</CardTitle>
              <CardDescription>Las próximas 5 citas programadas</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{apt.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.service} • {apt.employee}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{apt.time}</p>
                    <Badge variant="outline" className="text-xs">
                      {statusLabels.PENDING}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="outline">
                <CalendarCheck className="h-4 w-4" />
                Nueva cita
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <UserPlus className="h-4 w-4" />
                Nuevo cliente
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Scissors className="h-4 w-4" />
                Nuevo servicio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {revenueData.map((d) => (
                  <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm">{activity.text}</p>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
