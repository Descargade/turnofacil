"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Scissors, Clock, DollarSign, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

const categories = ["Barbería", "Peluquería", "Tatuaje", "Odontología", "Otro"];

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

const initialServices: Service[] = [
  {
    id: "1",
    name: "Corte de cabello",
    description: "Corte masculino o femenino incluyendo lavado y secado",
    duration: 30,
    price: 3500,
    category: "Barbería",
    isActive: true,
  },
  {
    id: "2",
    name: "Barba completa",
    description: "Afeitado y diseño de barba con toallas calientes",
    duration: 20,
    price: 2500,
    category: "Barbería",
    isActive: true,
  },
  {
    id: "3",
    name: "Tinte de cabello",
    description: "Coloración completa con productos premium",
    duration: 90,
    price: 8000,
    category: "Peluquería",
    isActive: true,
  },
  {
    id: "4",
    name: "Corte + Barba",
    description: "Paquete completo de corte y barba",
    duration: 45,
    price: 5000,
    category: "Barbería",
    isActive: true,
  },
  {
    id: "5",
    name: "Tatuaje pequeño",
    description: "Tatuaje de hasta 5cm en diseño libre",
    duration: 60,
    price: 10000,
    category: "Tatuaje",
    isActive: false,
  },
];

const emptyForm: Omit<Service, "id"> = {
  name: "",
  description: "",
  duration: 30,
  price: 0,
  category: "Barbería",
  isActive: true,
};

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [filter, setFilter] = useState<string>("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, "id">>(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((s) => {
    const matchesCategory = filter === "Todos" || s.category === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setForm({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        isActive: service.isActive,
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
      setServices((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
    } else {
      const newService: Service = {
        ...form,
        id: Date.now().toString(),
      };
      setServices((prev) => [...prev, newService]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios que ofrecés en tu negocio
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
              Nuevo servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar servicio" : "Nuevo servicio"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modificá los datos del servicio"
                  : "Completá los datos para crear un nuevo servicio"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Corte de cabello"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descripción del servicio..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    step={5}
                    value={form.duration}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={100}
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        price: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {editingId ? "Guardar cambios" : "Crear servicio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filter === "Todos" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("Todos")}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">
              No hay servicios
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? "No se encontraron servicios con esa búsqueda"
                : "Empezá agregando tu primer servicio"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo servicio
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {service.category}
                    </CardDescription>
                  </div>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="mb-3 text-sm text-muted-foreground">
                  {service.description || "Sin descripción"}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>${service.price.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(service)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(service.id)}
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
