"use client";

import { useState } from "react";
import {
  Check,
  X,
  CreditCard,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const currentPlan = {
  name: "Plan Profesional",
  price: 12999,
  interval: "mensual",
  status: "ACTIVE" as const,
  trialEndsAt: null as string | null,
  currentPeriodStart: "2025-06-01",
  currentPeriodEnd: "2025-06-30",
};

const plans = [
  {
    name: "Básico",
    price: 4999,
    features: [
      { text: "Hasta 50 citas/mes", included: true },
      { text: "1 empleado", included: true },
      { text: "Calendario básico", included: true },
      { text: "Recordatorios por email", included: false },
      { text: "Página de reservas", included: false },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    name: "Profesional",
    price: 12999,
    popular: true,
    features: [
      { text: "Citas ilimitadas", included: true },
      { text: "Hasta 10 empleados", included: true },
      { text: "Calendario avanzado", included: true },
      { text: "Recordatorios por email y SMS", included: true },
      { text: "Página de reservas", included: true },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    name: "Empresarial",
    price: 24999,
    features: [
      { text: "Citas ilimitadas", included: true },
      { text: "Empleados ilimitados", included: true },
      { text: "Calendario avanzado", included: true },
      { text: "Recordatorios por email y SMS", included: true },
      { text: "Página de reservas personalizada", included: true },
      { text: "Soporte prioritario 24/7", included: true },
    ],
  },
];

const billingHistory = [
  {
    id: "1",
    date: "2025-06-01",
    amount: 12999,
    status: "Pagado",
    invoice: "#INV-006",
  },
  {
    id: "2",
    date: "2025-05-01",
    amount: 12999,
    status: "Pagado",
    invoice: "#INV-005",
  },
  {
    id: "3",
    date: "2025-04-01",
    amount: 12999,
    status: "Pagado",
    invoice: "#INV-004",
  },
  {
    id: "4",
    date: "2025-03-01",
    amount: 4999,
    status: "Pagado",
    invoice: "#INV-003",
  },
];

export default function SuscripcionPage() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const trialDaysLeft = currentPlan.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(currentPlan.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">
          Gestioná tu plan y facturación
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan actual</CardTitle>
              <CardDescription>
                Detalles de tu suscripción activa
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Activo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ${currentPlan.price.toLocaleString("es-AR")}
            </span>
            <span className="text-muted-foreground">
              /{currentPlan.interval}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentPlan.name} — Próximo cobro el{" "}
            {formatDate(currentPlan.currentPeriodEnd)}
          </p>

          {currentPlan.trialEndsAt && trialDaysLeft > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <Clock className="h-4 w-4" />
              Período de prueba: {trialDaysLeft} día
              {trialDaysLeft !== 1 ? "s" : ""} restante
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Cambiar plan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancelar suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Planes disponibles</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-md" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Plan actual</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    ${plan.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /mes
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={
                          feature.included
                            ? ""
                            : "text-muted-foreground/50"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={
                    plan.name === currentPlan.name ? "outline" : "default"
                  }
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name
                    ? "Plan actual"
                    : plan.price < currentPlan.price
                      ? "Degradar"
                      : "Mejorar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de facturación</CardTitle>
              <CardDescription>Tus facturas y pagos anteriores</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Descargar todo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">
                    {formatDate(item.date)}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {item.invoice}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ${item.amount.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar suscripción?</DialogTitle>
            <DialogDescription>
              Si cancelás tu suscripción, perderás acceso a todas las funciones
              premium al final del período de facturación actual.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
              <div className="text-sm">
                <p className="font-medium">Al cancelar perderás:</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Acceso al calendario avanzado</li>
                  <li>• Recordatorios automáticos</li>
                  <li>• Página de reservas pública</li>
                  <li>• Reportes e estadísticas</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Mantener suscripción
            </Button>
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(false)}
            >
              Sí, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
