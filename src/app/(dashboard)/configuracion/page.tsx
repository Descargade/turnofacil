"use client";

import { useState } from "react";
import { Save, Upload, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ConfiguracionPage() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    name: "Barbería & Estética Express",
    description: "Servicios de barbería, peluquería y estética profesional",
    phone: "+54 11 1234-5678",
    email: "info@barberiaexpress.com",
    address: "Av. Corrientes 1234",
    city: "Buenos Aires",
    province: "Buenos Aires",
    primaryColor: "#6366f1",
    secondaryColor: "#ec4899",
    openingTime: "09:00",
    closingTime: "19:00",
    timezone: "America/Argentina/Buenos_Aires",
    emailReminders: true,
    smsReminders: false,
    reminderHours: 24,
    whatsapp: "+54 11 1234-5678",
    instagram: "@barberiaexpress",
    facebook: "BarberiaExpressBA",
    website: "https://barberiaexpress.com",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Administrá la configuración de tu negocio
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del negocio</CardTitle>
              <CardDescription>
                Datos básicos que se muestran a tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="biz-name">Nombre del negocio *</Label>
                  <Input
                    id="biz-name"
                    value={config.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-email">Email</Label>
                  <Input
                    id="biz-email"
                    type="email"
                    value={config.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-desc">Descripción</Label>
                <Textarea
                  id="biz-desc"
                  value={config.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="biz-phone">Teléfono</Label>
                  <Input
                    id="biz-phone"
                    value={config.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-address">Dirección</Label>
                  <Input
                    id="biz-address"
                    value={config.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="biz-city">Ciudad</Label>
                  <Input
                    id="biz-city"
                    value={config.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-province">Provincia</Label>
                  <Input
                    id="biz-province"
                    value={config.province}
                    onChange={(e) => updateField("province", e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="mb-4 text-sm font-semibold">Redes sociales</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={config.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={config.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={config.facebook}
                      onChange={(e) => updateField("facebook", e.target.value)}
                      placeholder="Nombre de página"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio web</Label>
                    <Input
                      id="website"
                      value={config.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apariencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personalizá el look de tu página de reservas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo del negocio</Label>
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        Arrastrá un archivo o hacé click
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Banner</Label>
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        Arrastrá un archivo o hacé click
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-sm font-semibold">Colores</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Color principal</Label>
                    <div className="flex gap-2">
                      <input
                        id="primary-color"
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) =>
                          updateField("primaryColor", e.target.value)
                        }
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={config.primaryColor}
                        onChange={(e) =>
                          updateField("primaryColor", e.target.value)
                        }
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Color secundario</Label>
                    <div className="flex gap-2">
                      <input
                        id="secondary-color"
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) =>
                          updateField("secondaryColor", e.target.value)
                        }
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={config.secondaryColor}
                        onChange={(e) =>
                          updateField("secondaryColor", e.target.value)
                        }
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border p-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Vista previa
                  </p>
                  <div className="flex gap-2">
                    <div
                      className="h-8 w-20 rounded"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                    <div
                      className="h-8 w-20 rounded"
                      style={{ backgroundColor: config.secondaryColor }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de atención</CardTitle>
              <CardDescription>
                Definí el horario de apertura y cierre de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="opening">Hora de apertura</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="opening"
                      type="time"
                      value={config.openingTime}
                      onChange={(e) =>
                        updateField("openingTime", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing">Hora de cierre</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="closing"
                      type="time"
                      value={config.closingTime}
                      onChange={(e) =>
                        updateField("closingTime", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select
                    value={config.timezone}
                    onValueChange={(v) => updateField("timezone", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Argentina/Buenos_Aires">
                        Buenos Aires (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/Cordoba">
                        Córdoba (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/Mendoza">
                        Mendoza (GMT-3)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configurá los recordatorios automáticos para tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Recordatorios por email
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviar recordatorios automático por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={config.emailReminders}
                  onCheckedChange={(v) => updateField("emailReminders", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recordatorios por SMS</p>
                  <p className="text-xs text-muted-foreground">
                    Enviar recordatorios por mensaje de texto
                  </p>
                </div>
                <Switch
                  checked={config.smsReminders}
                  onCheckedChange={(v) => updateField("smsReminders", v)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="reminder-hours">
                  Enviar recordatorio (horas antes)
                </Label>
                <Select
                  value={String(config.reminderHours)}
                  onValueChange={(v) =>
                    updateField("reminderHours", parseInt(v))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="3">3 horas antes</SelectItem>
                    <SelectItem value="6">6 horas antes</SelectItem>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
