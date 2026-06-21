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
  Plus,
  Trash2,
  GripVertical,
  MessageCircleQuestion,
  ImageIcon,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { ImageUpload, GalleryUpload } from "@/components/ui/image-upload";

interface BookingQuestion {
  id: string;
  text: string;
  type: "text" | "select" | "yes_no";
  options?: string[];
  required: boolean;
}

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
  gallery: string[];
  bookingQuestions: BookingQuestion[];
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

const emptyQuestion: Omit<BookingQuestion, "id"> = {
  text: "",
  type: "text",
  options: [],
  required: true,
};

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [newOption, setNewOption] = useState("");

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
    gallery: [],
    bookingQuestions: [],
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
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          bookingQuestions: Array.isArray(data.bookingQuestions)
            ? data.bookingQuestions
            : [],
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
          gallery: config.gallery,
          bookingQuestions: config.bookingQuestions,
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

  const updateField = (field: keyof BusinessData, value: unknown) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const copyBookingUrl = () => {
    const url = `${window.location.origin}/${config.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function addQuestion() {
    if (!newQuestion.text.trim()) return;
    const q: BookingQuestion = {
      ...newQuestion,
      id: Date.now().toString(),
      options: newQuestion.type === "select" ? newQuestion.options : [],
    };
    setConfig((prev) => ({
      ...prev,
      bookingQuestions: [...prev.bookingQuestions, q],
    }));
    setNewQuestion(emptyQuestion);
  }

  function removeQuestion(id: string) {
    setConfig((prev) => ({
      ...prev,
      bookingQuestions: prev.bookingQuestions.filter((q) => q.id !== id),
    }));
  }

  function addOptionToQuestion() {
    if (!newOption.trim()) return;
    setNewQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption.trim()],
    }));
    setNewOption("");
  }

  function removeOptionFromQuestion(index: number) {
    setNewQuestion((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index),
    }));
  }

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
            Administrá tu negocio y diseñá tu página de reservas
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

      {/* URL pública */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
          <div>
            <p className="text-sm font-semibold">Tu página de reservas</p>
            <p className="text-xs text-muted-foreground">
              Compartí este enlace con tus clientes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-background px-3 py-1.5 text-xs font-medium border">
              /{config.slug}
            </code>
            <Button variant="outline" size="sm" onClick={copyBookingUrl}>
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
          <TabsTrigger value="galeria">Galería</TabsTrigger>
          <TabsTrigger value="preguntas">Preguntas</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del negocio</CardTitle>
              <CardDescription>
                Datos básicos que ven tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del negocio *</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={config.email || ""}
                    onChange={(e) => updateField("email", e.target.value || null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={config.description || ""}
                  onChange={(e) => updateField("description", e.target.value || null)}
                  rows={3}
                  placeholder="Ej: Servicios de barbería y peluquería profesional"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={config.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value || null)}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    value={config.address || ""}
                    onChange={(e) => updateField("address", e.target.value || null)}
                    placeholder="Av. Corrientes 1234"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    value={config.city || ""}
                    onChange={(e) => updateField("city", e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input
                    value={config.province || ""}
                    onChange={(e) => updateField("province", e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código postal</Label>
                  <Input
                    value={config.postalCode || ""}
                    onChange={(e) => updateField("postalCode", e.target.value || null)}
                  />
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h3 className="mb-4 text-sm font-semibold">Redes sociales</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={config.whatsapp || ""}
                      onChange={(e) => updateField("whatsapp", e.target.value || null)}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={config.instagram || ""}
                      onChange={(e) => updateField("instagram", e.target.value || null)}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input
                      value={config.facebook || ""}
                      onChange={(e) => updateField("facebook", e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sitio web</Label>
                    <Input
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
                Subí imágenes desde tu dispositivo y elegí los colores de tu marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUpload
                  label="Logo del negocio"
                  value={config.logo}
                  onChange={(v) => updateField("logo", v)}
                  aspect="square"
                />
                <ImageUpload
                  label="Banner / portada"
                  value={config.banner}
                  onChange={(v) => updateField("banner", v)}
                  aspect="wide"
                />
              </div>
              <Separator />
              <div>
                <h3 className="mb-4 text-sm font-semibold">Colores de tu marca</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Color principal</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => updateField("primaryColor", e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => updateField("primaryColor", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color secundario</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => updateField("secondaryColor", e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => updateField("secondaryColor", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border p-4">
                  <p className="mb-2 text-xs text-muted-foreground">Vista previa de colores</p>
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

        {/* GALERÍA */}
        <TabsContent value="galeria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Galería de trabajos
              </CardTitle>
              <CardDescription>
                Mostrá fotos de tus mejores trabajos. Aparecen como carrusel en tu página de reservas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GalleryUpload
                value={config.gallery}
                onChange={(v) => updateField("gallery", v)}
                max={12}
              />
              {config.gallery.length === 0 && (
                <div className="mt-4 rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">
                    Todavía no subiste fotos. Agregá imágenes de tus trabajos para que los clientes vean tu calidad.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREGUNTAS */}
        <TabsContent value="preguntas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5" />
                Preguntas personalizadas
              </CardTitle>
              <CardDescription>
                Agregá preguntas que los clientes deben responder al reservar (ej: "¿Tenés alergias?", "¿Es la primera vez?")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.bookingQuestions.length > 0 && (
                <div className="space-y-2">
                  {config.bookingQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.text}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">
                            {q.type === "text" ? "Texto libre" : q.type === "yes_no" ? "Sí/No" : "Opción múltiple"}
                          </Badge>
                          {q.required && (
                            <Badge variant="secondary" className="text-[10px]">Obligatoria</Badge>
                          )}
                          {q.options && q.options.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {q.options.length} opciones
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-semibold">Agregar nueva pregunta</p>
                <Input
                  value={newQuestion.text}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, text: e.target.value }))
                  }
                  placeholder="Ej: ¿Tenés alguna alergia que debamos saber?"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo de respuesta</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(v: "text" | "select" | "yes_no") =>
                        setNewQuestion((prev) => ({ ...prev, type: v, options: [] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto libre</SelectItem>
                        <SelectItem value="yes_no">Sí / No</SelectItem>
                        <SelectItem value="select">Opción múltiple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Obligatoria</Label>
                    <div className="flex items-center gap-2 h-9">
                      <button
                        type="button"
                        onClick={() =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            required: !prev.required,
                          }))
                        }
                        className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          newQuestion.required
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {newQuestion.required && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                      <span className="text-sm">
                        {newQuestion.required ? "Sí" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {newQuestion.type === "select" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Opciones</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Escribí una opción"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addOptionToQuestion();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOptionToQuestion}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newQuestion.options && newQuestion.options.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {newQuestion.options.map((opt, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeOptionFromQuestion(i)}
                          >
                            {opt} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={addQuestion}
                  disabled={!newQuestion.text.trim()}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Agregar pregunta
                </Button>
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
                Horario general del negocio (cada empleado puede tener los suyos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Hora de apertura</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={config.openingTime || "09:00"}
                      onChange={(e) => updateField("openingTime", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hora de cierre</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={config.closingTime || "19:00"}
                      onChange={(e) => updateField("closingTime", e.target.value)}
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
                      <SelectItem value="America/Cordoba">Córdoba (GMT-3)</SelectItem>
                      <SelectItem value="America/Mendoza">Mendoza (GMT-3)</SelectItem>
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
              <div className="overflow-hidden rounded-xl border-2 border-surface-200 bg-white shadow-lg">
                {/* Banner */}
                {config.banner && (
                  <div className="h-32 overflow-hidden bg-surface-100">
                    <img src={config.banner} alt="Banner" className="h-full w-full object-cover" />
                  </div>
                )}

                {/* Branding */}
                <div className="border-b border-surface-100 bg-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {config.logo ? (
                        <img src={config.logo} alt="Logo" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <Star className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-surface-900">
                        {config.name || "Tu negocio"}
                      </h2>
                      {config.description && (
                        <p className="text-xs text-surface-500 line-clamp-1">{config.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Galería preview */}
                {config.gallery.length > 0 && (
                  <div className="border-b border-surface-100 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-surface-400">Nuestros trabajos</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {config.gallery.slice(0, 4).map((img, i) => (
                        <div key={i} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {config.gallery.length > 4 && (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-surface-100 text-xs font-medium text-surface-500">
                          +{config.gallery.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Simulación paso 1 */}
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold text-surface-500">Paso 1 de 5 · Servicio</p>
                  <div className="mt-1 mb-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        style={{ backgroundColor: i === 1 ? primaryColor : "#e5e7eb" }}
                      />
                    ))}
                  </div>
                  <h3 className="font-display text-sm font-bold text-surface-900">Elegí tu servicio</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["Corte masculino", "Barba", "Corte femenino", "Tinte"].map((name, i) => (
                      <div
                        key={name}
                        className="rounded-lg border-2 p-3 text-left"
                        style={
                          i === 0
                            ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                            : { borderColor: "#e5e7eb" }
                        }
                      >
                        <p className="text-xs font-semibold text-surface-900">{name}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-surface-500">
                          <span>{[30, 20, 45, 60][i]} min</span>
                          <span className="font-medium text-surface-700">
                            ${[3000, 2000, 5000, 8000][i].toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preguntas preview */}
                {config.bookingQuestions.length > 0 && (
                  <div className="border-t border-surface-100 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-surface-400">
                      Tus clientes responderán
                    </p>
                    {config.bookingQuestions.slice(0, 2).map((q) => (
                      <div key={q.id} className="mb-1 flex items-center gap-2 text-xs text-surface-600">
                        <MessageCircleQuestion className="h-3 w-3 text-muted-foreground" />
                        {q.text}
                        {q.required && <span className="text-destructive">*</span>}
                      </div>
                    ))}
                  </div>
                )}
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
