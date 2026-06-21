"use client";

import { useState } from "react";
import {
  Search,
  UserCircle,
  Mail,
  Phone,
  CalendarCheck,
  Clock,
  StickyNote,
  Eye,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  lastVisit: string;
  notes: string;
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "María García",
    email: "maria@email.com",
    phone: "+54 11 1111-2222",
    totalAppointments: 15,
    lastVisit: "2025-06-18",
    notes: "Cliente frecuente, prefiere turnos por la mañana",
  },
  {
    id: "2",
    name: "Pedro Sánchez",
    email: "pedro@email.com",
    phone: "+54 11 2222-3333",
    totalAppointments: 8,
    lastVisit: "2025-06-17",
    notes: "",
  },
  {
    id: "3",
    name: "Laura Martínez",
    email: "laura@email.com",
    phone: "+54 11 3333-4444",
    totalAppointments: 22,
    lastVisit: "2025-06-19",
    notes: "Alérgica a ciertos productos, verificar antes de aplicar",
  },
  {
    id: "4",
    name: "Jorge López",
    email: "jorge@email.com",
    phone: "+54 11 4444-5555",
    totalAppointments: 3,
    lastVisit: "2025-05-20",
    notes: "",
  },
  {
    id: "5",
    name: "Camila Torres",
    email: "camila@email.com",
    phone: "+54 11 5555-6666",
    totalAppointments: 12,
    lastVisit: "2025-06-16",
    notes: "Siempre pide el mismo color de tinte",
  },
  {
    id: "6",
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "+54 11 6666-7777",
    totalAppointments: 0,
    lastVisit: "",
    notes: "Cliente nuevo, aún no asistió",
  },
];

export default function ClientesPage() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailDialogOpen(true);
  };

  const handleOpenNotes = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNotesText(customer.notes);
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = () => {
    setNotesDialogOpen(false);
    setSelectedCustomer(null);
    setNotesText("");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Administrá la base de datos de clientes
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:w-80"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">
              No hay clientes
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No se encontraron clientes con esa búsqueda"
                : "Los clientes aparecerán cuando se registren en tu negocio"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="text-center">Citas</TableHead>
                  <TableHead className="hidden sm:table-cell">Última visita</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                        {customer.totalAppointments}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(customer.lastVisit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenNotes(customer)}
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Detalle del cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cliente desde{" "}
                    {new Date().toLocaleDateString("es-AR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedCustomer.totalAppointments} citas realizadas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Última visita: {formatDate(selectedCustomer.lastVisit)}
                  </span>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Notas
                  </p>
                  <p className="text-sm">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Notas del cliente</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="customer-notes">Notas</Label>
            <Textarea
              id="customer-notes"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Anotaciones sobre el cliente..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveNotes}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
