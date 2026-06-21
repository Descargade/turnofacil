"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Clock,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Scissors,
  MapPin,
  Phone,
  Palette,
} from "lucide-react";
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

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  logo: string | null;
  banner: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  openingTime: string | null;
  closingTime: string | null;
  timezone: string | null;
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const [config, setConfig] = useState<BusinessData>({
    id: "",
    name: "",
    slug: "",
    description: null,
    phone: null,
    email: null,
    address: null,
    city: null,
    province: null,
    postalCode: null,
    logo: null,
    banner: null,
    primaryColor: "#6366f1",
    secondaryColor: "#ec4899",
    whatsapp: null,
    instagram: null,
    facebook: null,
    website: null,
    openingTime: "09:00",
    closingTime: "19:00",
    timezone: "America/Argentina/Buenos_Aires",
  });

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch("/api/business");
        if (!res.ok) throw new Error("Error al cargar negocio");
        const data = await res.json();
        setConfig({
          id: data.id,
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          city: data.city || null,
          province: data.province || null,
          postalCode: data.postalCode || null,
          logo: data.logo || null,
          banner: data.banner || null,
          primaryColor: data.primaryColor || "#6366f1",
          secondaryColor: data.secondaryColor || "#ec4899",
          whatsapp: data.whatsapp || null,
          instagram: data.instagram || null,
          facebook: data.facebook || null,
          website: data.website || null,
          openingTime: data.openingTime || "09:00",
          closingTime: data.closingTime || "19:00",
          timezone: data.timezone || "America/Argentina/Buenos_Aires",
        });
      } catch {
        setError("No se pudieron cargar los datos del negocio");
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: config.name,
          descripcion: config.description || "",
          telefono: config.phone || "",
          email: config.email || "",
          direccion: config.address || "",
          ciudad: config.city || "",
          provincia: config.province || "",
          codigoPostal: config.postalCode || "",
          colorPrincipal: config.primaryColor,
          colorSecundario: config.secondaryColor,
          logo: config.logo || "",
          banner: config.banner || "",
          whatsapp: config.whatsapp || "",
          instagram: config.instagram || "",
          facebook: config.facebook || "",
          website: config.website || "",
          horarioApertura: config.openingTime,
          horarioCierre: config.closingTime,
          timezone: config.timezone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BusinessData, value: string | null) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const copyBookingUrl = () => {
    const url = `${window.location.origin}/${config.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const primaryColor = config.primaryColor || "#6366f1";
  const secondaryColor = config.secondaryColor || "#ec4899";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Administrá la configuración y apariencia de tu negocio
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* URL pública de reservas */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
          <div>
            <p className="text-sm font-semibold">Tu página de reservas</p>
            <p className="text-xs text-muted-foreground">
              Compartí este enlace con tus clientes para que agenden turnos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-background px-3 py-1.5 text-xs font-medium border">
              /{config.slug}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBookingUrl}
            >
              {copied ? (
                <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/${config.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                Ver
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
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
                    value={config.email || ""}
                    onChange={(e) => updateField("email", e.target.value || null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-desc">Descripción</Label>
                <Textarea
                  id="biz-desc"
                  value={config.description || ""}
                  onChange={(e) => updateField("description", e.target.value || null)}
                  rows={3}
                  placeholder="Ej: Servicios de barbería y peluquería profesional"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="biz-phone">Teléfono</Label>
                  <Input
                    id="biz-phone"
                    value={config.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value || null)}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-address">Dirección</Label>
                  <Input
                    id="biz-address"
                    value={config.address || ""}
                    onChange={(e) => updateField("address", e.target.value || null)}
                    placeholder="Av. Corrientes 1234"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="biz-city">Ciudad</Label>
                  <Input
                    id="biz-city"
                    value={config.city || ""}
                    onChange={(e) => updateField("city", e.target.value || null)}
                    placeholder="Buenos Aires"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-province">Provincia</Label>
                  <Input
                    id="biz-province"
                    value={config.province || ""}
                    onChange={(e) => updateField("province", e.target.value || null)}
                    placeholder="Buenos Aires"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-postal">Código postal</Label>
                  <Input
                    id="biz-postal"
                    value={config.postalCode || ""}
                    onChange={(e) => updateField("postalCode", e.target.value || null)}
                    placeholder="C1043"
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
                      value={config.whatsapp || ""}
                      onChange={(e) => updateField("whatsapp", e.target.value || null)}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={config.instagram || ""}
                      onChange={(e) => updateField("instagram", e.target.value || null)}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={config.facebook || ""}
                      onChange={(e) => updateField("facebook", e.target.value || null)}
                      placeholder="Nombre de página"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio web</Label>
                    <Input
                      id="website"
                      value={config.website || ""}
                      onChange={(e) => updateField("website", e.target.value || null)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APARIENCIA */}
        <TabsContent value="apariencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia de la página de reservas</CardTitle>
              <CardDescription>
                Personalizá el look de tu página pública
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo del negocio (URL)</Label>
                  <Input
                    value={config.logo || ""}
                    onChange={(e) => updateField("logo", e.target.value || null)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  {config.logo && (
                    <div className="mt-2 flex h-20 items-center justify-center rounded-lg border bg-muted/30 p-2">
                      <img
                        src={config.logo}
                        alt="Logo"
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Banner / imagen de portada (URL)</Label>
                  <Input
                    value={config.banner || ""}
                    onChange={(e) => updateField("banner", e.target.value || null)}
                    placeholder="https://ejemplo.com/banner.jpg"
                  />
                  {config.banner && (
                    <div className="mt-2 h-20 overflow-hidden rounded-lg border bg-muted/30">
                      <img
                        src={config.banner}
                        alt="Banner"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-sm font-semibold">Colores de tu marca</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Color principal</Label>
                    <div className="flex gap-2">
                      <input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) =>
                          updateField("primaryColor", e.target.value)
                        }
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={primaryColor}
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
                        value={secondaryColor}
                        onChange={(e) =>
                          updateField("secondaryColor", e.target.value)
                        }
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={secondaryColor}
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
                    Vista previa de colores
                  </p>
                  <div className="flex gap-2">
                    <div
                      className="h-8 w-24 rounded-md text-xs text-white flex items-center justify-center font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Principal
                    </div>
                    <div
                      className="h-8 w-24 rounded-md text-xs text-white flex items-center justify-center font-medium"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Secundario
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HORARIOS */}
        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de atención</CardTitle>
              <CardDescription>
                Definí el horario general de tu negocio (los empleados pueden tener horarios propios)
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
                      value={config.openingTime || "09:00"}
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
                      value={config.closingTime || "19:00"}
                      onChange={(e) =>
                        updateField("closingTime", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select
                    value={config.timezone || "America/Argentina/Buenos_Aires"}
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
                      <SelectItem value="America/Argentina/Tucuman">
                        Tucumán (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/Argentina/Salta">
                        Salta (GMT-3)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREVIEW */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista previa de tu página de reservas
              </CardTitle>
              <CardDescription>
                Así es como ven tu página los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simulación de la booking page */}
              <div className="overflow-hidden rounded-xl border-2 border-surface-200 bg-white shadow-lg">
                {/* Header TurnoFácil */}
                <div className="border-b border-surface-200 bg-white/80 px-4 py-3">
                  <span className="font-display text-lg font-bold" style={{ color: primaryColor }}>
                    Turno
                  </span>
                  <span className="font-display text-lg font-bold text-amber-500">
                    Fácil
                  </span>
                </div>

                {/* Banner */}
                {config.banner && (
                  <div className="h-32 overflow-hidden bg-surface-100">
                    <img
                      src={config.banner}
                      alt="Banner"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Branding del negocio */}
                <div className="border-b border-surface-100 bg-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {config.logo ? (
                        <img
                          src={config.logo}
                          alt="Logo"
                          className="h-12 w-12 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <Scissors className={`h-6 w-6 ${config.logo ? "hidden" : ""}`} />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-surface-900">
                        {config.name || "Tu negocio"}
                      </h2>
                      {config.description && (
                        <p className="text-xs text-surface-500 line-clamp-1">
                          {config.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-surface-500">
                    {config.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {config.address}{config.city ? `, ${config.city}` : ""}
                      </span>
                    )}
                    {config.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {config.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulación del paso 1 */}
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold text-surface-500">Paso 1 de 5 · Servicio</p>
                  <div className="mt-1 mb-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor: i === 1 ? primaryColor : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <h3 className="font-display text-sm font-bold text-surface-900">
                    Elegí tu servicio
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["Corte masculino", "Barba", "Corte femenino", "Tinte"].map(
                      (name, i) => (
                        <div
                          key={name}
                          className={`rounded-lg border-2 p-3 text-left transition-all ${
                            i === 0
                              ? "border-current bg-current/5 shadow-sm"
                              : "border-surface-200 bg-white"
                          }`}
                          style={i === 0 ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : {}}
                        >
                          <p className="text-xs font-semibold text-surface-900">{name}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-surface-500">
                            <span>{[30, 20, 45, 60][i]} min</span>
                            <span className="font-medium text-surface-700">
                              ${[3000, 2000, 5000, 8000][i].toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${config.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    Abrir página real
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={copyBookingUrl}>
                  {copied ? (
                    <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="mr-1 h-3.5 w-3.5" />
                  )}
                  {copied ? "Copiado" : "Copiar enlace"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
