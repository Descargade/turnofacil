"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Search,
  Clock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  isActive: boolean;
  availability: Record<string, { start: string; end: string; active: boolean }>;
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Carlos Ruiz",
    email: "carlos@email.com",
    phone: "+54 11 1234-5678",
    specialties: ["Corte masculino", "Barba"],
    isActive: true,
    availability: {
      Lunes: { start: "09:00", end: "18:00", active: true },
      Martes: { start: "09:00", end: "18:00", active: true },
      Miércoles: { start: "09:00", end: "18:00", active: true },
      Jueves: { start: "09:00", end: "18:00", active: true },
      Viernes: { start: "09:00", end: "18:00", active: true },
      Sábado: { start: "09:00", end: "14:00", active: true },
      Domingo: { start: "00:00", end: "00:00", active: false },
    },
  },
  {
    id: "2",
    name: "Ana López",
    email: "ana@email.com",
    phone: "+54 11 2345-6789",
    specialties: ["Corte femenino", "Tinte", "Peinado"],
    isActive: true,
    availability: {
      Lunes: { start: "10:00", end: "19:00", active: true },
      Martes: { start: "10:00", end: "19:00", active: true },
      Miércoles: { start: "10:00", end: "19:00", active: true },
      Jueves: { start: "10:00", end: "19:00", active: true },
      Viernes: { start: "10:00", end: "19:00", active: true },
      Sábado: { start: "10:00", end: "15:00", active: true },
      Domingo: { start: "00:00", end: "00:00", active: false },
    },
  },
  {
    id: "3",
    name: "Sofía Hernández",
    email: "sofia@email.com",
    phone: "+54 11 3456-7890",
    specialties: ["Corte femenino", "Tinte", "Tratamiento capilar"],
    isActive: false,
    availability: {
      Lunes: { start: "09:00", end: "17:00", active: true },
      Martes: { start: "09:00", end: "17:00", active: true },
      Miércoles: { start: "09:00", end: "17:00", active: true },
      Jueves: { start: "09:00", end: "17:00", active: true },
      Viernes: { start: "09:00", end: "17:00", active: true },
      Sábado: { start: "00:00", end: "00:00", active: false },
      Domingo: { start: "00:00", end: "00:00", active: false },
    },
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialties: [] as string[],
};

export default function EquipoPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setForm({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        specialties: employee.specialties,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editingId) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, name: form.name, email: form.email, phone: form.phone, specialties: form.specialties }
            : e
        )
      );
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialties: form.specialties,
        isActive: true,
        availability: Object.fromEntries(
          daysOfWeek.map((day) => [
            day,
            { start: "09:00", end: "18:00", active: day !== "Domingo" },
          ])
        ),
      };
      setEmployees((prev) => [...prev, newEmployee]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
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
    const activeDays = Object.entries(emp.availability).filter(
      ([, v]) => v.active
    );
    return `${activeDays.length} días/semana`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipo</h1>
          <p className="text-muted-foreground">
            Gestioná los empleados y su disponibilidad
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
              <Button onClick={handleSave}>
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

      {filteredEmployees.length === 0 ? (
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
                  onClick={() => handleOpenDialog(employee)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(employee.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
