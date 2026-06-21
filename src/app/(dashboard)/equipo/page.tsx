"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Search,
  Clock,
  Save,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const allSpecialties = [
  "Corte masculino",
  "Corte femenino",
  "Barba",
  "Tinte",
  "Peinado",
  "Tatuaje",
  "Colorimetría",
  "Tratamiento capilar",
];

const daysOfWeek = [
  { key: "Lunes", index: 1 },
  { key: "Martes", index: 2 },
  { key: "Miércoles", index: 3 },
  { key: "Jueves", index: 4 },
  { key: "Viernes", index: 5 },
  { key: "Sábado", index: 6 },
  { key: "Domingo", index: 0 },
];

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialties: string[];
  isActive: boolean;
  availability: Availability[];
  _count?: { appointments: number };
}

const defaultAvailability: Record<number, { start: string; end: string; active: boolean }> = {
  0: { start: "00:00", end: "00:00", active: false },
  1: { start: "09:00", end: "18:00", active: true },
  2: { start: "09:00", end: "18:00", active: true },
  3: { start: "09:00", end: "18:00", active: true },
  4: { start: "09:00", end: "18:00", active: true },
  5: { start: "09:00", end: "18:00", active: true },
  6: { start: "09:00", end: "14:00", active: true },
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialties: [] as string[],
};

export default function EquipoPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityForm, setAvailabilityForm] = useState<
    Record<number, { start: string; end: string; active: boolean }>
  >(defaultAvailability);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Error al cargar empleados");
      const data = await res.json();
      setEmployees(data);
    } catch {
      console.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.email && e.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setForm({
        name: employee.name,
        email: employee.email || "",
        phone: employee.phone || "",
        specialties: employee.specialties,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!form.name.trim()) return;

    try {
      if (editingId) {
        const res = await fetch(`/api/employees/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: form.name,
            email: form.email || undefined,
            telefono: form.phone || undefined,
            especialidades: form.specialties,
          }),
        });
        if (!res.ok) throw new Error("Error al actualizar empleado");
      } else {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: form.name,
            email: form.email || undefined,
            telefono: form.phone || undefined,
            especialidades: form.specialties,
          }),
        });
        if (!res.ok) throw new Error("Error al crear empleado");
      }
      await fetchEmployees();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      console.error("Error al guardar empleado");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar este empleado?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar empleado");
      await fetchEmployees();
    } catch {
      console.error("Error al eliminar empleado");
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getScheduleSummary = (emp: Employee) => {
    const activeDays = emp.availability.filter((a) => a.isActive);
    return `${activeDays.length} días/semana`;
  };

  const openAvailabilityDialog = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
    const form: Record<number, { start: string; end: string; active: boolean }> = {};
    for (const day of daysOfWeek) {
      const avail = employee.availability.find((a) => a.dayOfWeek === day.index);
      if (avail) {
        form[day.index] = { start: avail.startTime, end: avail.endTime, active: avail.isActive };
      } else {
        form[day.index] = defaultAvailability[day.index];
      }
    }
    setAvailabilityForm(form);
    setAvailabilityDialogOpen(true);
  };

  const toggleDay = (dayIndex: number) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], active: !prev[dayIndex].active },
    }));
  };

  const updateDayTime = (dayIndex: number, field: "start" | "end", value: string) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], [field]: value },
    }));
  };

  const handleSaveAvailability = async () => {
    if (!selectedEmployeeId) return;

    setSavingAvailability(true);
    try {
      const disponibilidad = daysOfWeek.map((day) => ({
        diaSemana: day.index,
        horaInicio: availabilityForm[day.index].start,
        horaFin: availabilityForm[day.index].end,
        activo: availabilityForm[day.index].active,
      }));

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empleadoId: selectedEmployeeId,
          disponibilidad,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar disponibilidad");
      }

      await fetchEmployees();
      setAvailabilityDialogOpen(false);
      setSelectedEmployeeId(null);
    } catch {
      console.error("Error al guardar disponibilidad");
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipo</h1>
          <p className="text-muted-foreground">
            Gestioná los empleados y su disponibilidad horaria
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar empleado" : "Nuevo empleado"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modificá los datos del empleado"
                  : "Completá los datos para agregar un empleado"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="emp-name">Nombre completo *</Label>
                <Input
                  id="emp-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Carlos Ruiz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-email">Email</Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="correo@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-phone">Teléfono</Label>
                <Input
                  id="emp-phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidades</Label>
                <div className="flex flex-wrap gap-2">
                  {allSpecialties.map((spec) => (
                    <Badge
                      key={spec}
                      variant={
                        form.specialties.includes(spec) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleSpecialty(spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveEmployee}>
                {editingId ? "Guardar cambios" : "Agregar empleado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empleados..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">
              No hay empleados
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? "No se encontraron empleados con esa búsqueda"
                : "Empezá agregando tu primer empleado"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo empleado
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {employee.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={employee.isActive ? "default" : "secondary"}
                      >
                        {employee.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <div className="space-y-1">
                  {employee.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {employee.email}
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {employee.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {getScheduleSummary(employee)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.specialties.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAvailabilityDialog(employee)}
                >
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  Horarios
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(employee)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de disponibilidad */}
      <Dialog
        open={availabilityDialogOpen}
        onOpenChange={(open) => {
          setAvailabilityDialogOpen(open);
          if (!open) setSelectedEmployeeId(null);
        }}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disponibilidad horaria</DialogTitle>
            <DialogDescription>
              Configurá los días y horarios en que el empleado trabaja
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {daysOfWeek.map((day) => {
              const dayForm = availabilityForm[day.index];
              return (
                <div
                  key={day.index}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    dayForm.active
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day.index)}
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      dayForm.active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                  >
                    {dayForm.active && (
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="w-24 text-sm font-medium">{day.key}</span>
                  {dayForm.active ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="time"
                        value={dayForm.start}
                        onChange={(e) =>
                          updateDayTime(day.index, "start", e.target.value)
                        }
                        className="w-[110px] h-8 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={dayForm.end}
                        onChange={(e) =>
                          updateDayTime(day.index, "end", e.target.value)
                        }
                        className="w-[110px] h-8 text-xs"
                      />
                    </div>
                  ) : (
                    <span className="ml-auto text-xs text-muted-foreground">
                      No trabaja
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAvailabilityDialogOpen(false);
                setSelectedEmployeeId(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveAvailability} disabled={savingAvailability}>
              {savingAvailability ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar horarios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
