"use client";

import { useState } from "react";
import { Plus, Search, Clock, User, Scissors, CheckCircle2, XCircle, RotateCcw, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatusFilter = "todos" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface Appointment {
  id: string;
  date: string;
  time: string;
  client: string;
  service: string;
  employee: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  price: number;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: "2025-06-20",
    time: "09:00",
    client: "María García",
    service: "Corte de cabello",
    employee: "Ana López",
    status: "CONFIRMED",
    price: 3500,
  },
  {
    id: "2",
    date: "2025-06-20",
    time: "09:30",
    client: "Pedro Sánchez",
    service: "Barba completa",
    employee: "Carlos Ruiz",
    status: "PENDING",
    price: 2500,
  },
  {
    id: "3",
    date: "2025-06-20",
    time: "10:00",
    client: "Laura Martínez",
    service: "Tinte",
    employee: "Sofía Hernández",
    status: "CONFIRMED",
    price: 8000,
  },
  {
    id: "4",
    date: "2025-06-20",
    time: "10:30",
    client: "Jorge López",
    service: "Corte + Barba",
    employee: "Carlos Ruiz",
    status: "COMPLETED",
    price: 5000,
  },
  {
    id: "5",
    date: "2025-06-20",
    time: "11:00",
    client: "Camila Torres",
    service: "Manicure",
    employee: "Ana López",
    status: "CANCELLED",
    price: 2000,
  },
  {
    id: "6",
    date: "2025-06-21",
    time: "14:00",
    client: "Lucía Fernández",
    service: "Corte femenino",
    employee: "Ana López",
    status: "PENDING",
    price: 4500,
  },
  {
    id: "7",
    date: "2025-06-22",
    time: "15:00",
    client: "Martín Silva",
    service: "Tatuaje pequeño",
    employee: "Sofía Hernández",
    status: "PENDING",
    price: 10000,
  },
  {
    id: "8",
    date: "2025-06-19",
    time: "09:00",
    client: "Juan Pérez",
    service: "Corte de cabello",
    employee: "Carlos Ruiz",
    status: "COMPLETED",
    price: 3500,
  },
  {
    id: "9",
    date: "2025-06-19",
    time: "11:00",
    client: "Ana Torres",
    service: "Tinte",
    employee: "Sofía Hernández",
    status: "NO_SHOW",
    price: 8000,
  },
];

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }
> = {
  PENDING: {
    variant: "secondary",
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMED: {
    variant: "default",
    label: "Confirmada",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    variant: "default",
    label: "Completada",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    variant: "destructive",
    label: "Cancelada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  NO_SHOW: {
    variant: "destructive",
    label: "No asistió",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

const filterLabels: Record<StatusFilter, string> = {
  todos: "Todos",
  PENDING: "Pendientes",
  CONFIRMED: "Confirmadas",
  COMPLETED: "Completadas",
  CANCELLED: "Canceladas",
  NO_SHOW: "No asistió",
};

export default function TurnosPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client: "",
    service: "",
    employee: "",
    date: "",
    time: "",
  });

  const filtered = appointments.filter((apt) => {
    const matchesStatus =
      activeFilter === "todos" || apt.status === activeFilter;
    const matchesSearch =
      apt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.employee.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (
    id: string,
    newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.client || !newAppointment.date || !newAppointment.time) return;
    const apt: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      status: "PENDING",
      price: 0,
    };
    setAppointments((prev) => [...prev, apt]);
    setDialogOpen(false);
    setNewAppointment({ client: "", service: "", employee: "", date: "", time: "" });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const counts = {
    todos: appointments.length,
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
    NO_SHOW: appointments.filter((a) => a.status === "NO_SHOW").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turnos</h1>
          <p className="text-muted-foreground">
            Administrá todas las citas de tu negocio
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo turno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo turno</DialogTitle>
              <DialogDescription>
                Completá los datos para programar un turno
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Input
                  placeholder="Nombre del cliente"
                  value={newAppointment.client}
                  onChange={(e) =>
                    setNewAppointment((p) => ({ ...p, client: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Servicio</Label>
                <Select
                  value={newAppointment.service}
                  onValueChange={(v) =>
                    setNewAppointment((p) => ({ ...p, service: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corte de cabello">Corte de cabello</SelectItem>
                    <SelectItem value="Barba completa">Barba completa</SelectItem>
                    <SelectItem value="Tinte">Tinte</SelectItem>
                    <SelectItem value="Corte + Barba">Corte + Barba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select
                  value={newAppointment.employee}
                  onValueChange={(v) =>
                    setNewAppointment((p) => ({ ...p, employee: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ana López">Ana López</SelectItem>
                    <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                    <SelectItem value="Sofía Hernández">Sofía Hernández</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment((p) => ({ ...p, time: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment}>Crear turno</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as StatusFilter)}
        >
          <TabsList>
            {(Object.keys(filterLabels) as StatusFilter[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {filterLabels[key]} ({counts[key]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-8 sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">No hay turnos</h3>
            <p className="text-sm text-muted-foreground">
              No se encontraron turnos con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Servicio</TableHead>
                  <TableHead className="hidden lg:table-cell">Empleado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="text-sm">
                      {formatDate(apt.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {apt.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                          {apt.client
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{apt.client}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      <div className="flex items-center gap-1">
                        <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                        {apt.service}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {apt.employee}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[apt.status].className}
                      >
                        {statusConfig[apt.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {apt.status === "PENDING" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            title="Confirmar"
                            onClick={() => handleStatusChange(apt.id, "CONFIRMED")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            title="Completar"
                            onClick={() => handleStatusChange(apt.id, "COMPLETED")}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            title="Cancelar"
                            onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
