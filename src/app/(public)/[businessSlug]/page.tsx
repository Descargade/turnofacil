"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isToday,
  isBefore,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  User,
  Calendar,
  Scissors,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { cn, formatCurrency, getInitials, calculateEndTime } from "@/lib/utils";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  gallery: string[];
  bookingQuestions: {
    id: string;
    text: string;
    type: "text" | "select" | "yes_no";
    options?: string[];
    required: boolean;
  }[];
  primaryColor: string | null;
  secondaryColor: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  openingTime: string | null;
  closingTime: string | null;
}

interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
  isActive: boolean;
}

interface EmployeeData {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  specialties: string[];
  isActive: boolean;
  services: { serviceId: string }[];
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const TOTAL_STEPS = 6;
const STEP_LABELS = ["Servicio", "Profesional", "Fecha y hora", "Tus datos", "Preguntas", "Confirmación"];

const mockReviews = [
  { name: "Martín G.", rating: 5, text: "Excelente atención, muy profesional." },
  { name: "Luciana P.", rating: 5, text: "El mejor salón de la zona." },
  { name: "Diego R.", rating: 4, text: "Muy buen servicio y puntuales." },
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.businessSlug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<
    { employeeId: string; date: string; startTime: string; endTime: string }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/business/" + businessSlug);
        if (!res.ok) throw new Error("No se encontró el negocio");
        const data = await res.json();
        if (cancelled) return;
        setBusiness(data.business || null);
        setServices(Array.isArray(data.services) ? data.services.filter((s: ServiceData) => s.isActive) : []);
        setEmployees(Array.isArray(data.employees) ? data.employees.filter((e: EmployeeData) => e.isActive) : []);
        setExistingAppointments(Array.isArray(data.existingAppointments) ? data.existingAppointments : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [businessSlug]);

  const filteredEmployees = useMemo(() => {
    if (!selectedService) return employees;
    return employees.filter((emp) => emp.services.some((s) => s.serviceId === selectedService.id));
  }, [employees, selectedService]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceData[]> = {};
    for (const s of services) {
      const cat = s.category || "Otros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    return groups;
  }, [services]);

  const generateTimeSlots = useCallback(
    (employeeId: string, date: Date): TimeSlot[] => {
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp) return [];
      const dayOfWeek = getDay(date);
      const avail = emp.availability.find((a) => a.dayOfWeek === dayOfWeek && a.isActive);
      if (!avail) return [];
      const opening = business?.openingTime || avail.startTime;
      const closing = business?.closingTime || avail.endTime;
      const duration = selectedService?.duration || 30;
      const [startH, startM] = opening.split(":").map(Number);
      const [endH, endM] = closing.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const dateStr = format(date, "yyyy-MM-dd");
      const slots: TimeSlot[] = [];
      for (let m = startMin; m + duration <= endMin; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const time = String(h).padStart(2, "0") + ":" + String(min).padStart(2, "0");
        const endTime = calculateEndTime(time, duration);
        const isBooked = existingAppointments.some(
          (a) => a.employeeId === employeeId && a.date === dateStr && a.startTime < endTime && a.endTime > time
        );
        const now = new Date();
        const slotDate = new Date(dateStr + "T" + time + ":00");
        const isPast = isToday(date) && now > slotDate;
        slots.push({ time, available: !isBooked && !isPast });
      }
      return slots;
    },
    [employees, business, selectedService, existingAppointments]
  );

  const availableDays = useMemo(() => {
    if (!selectedEmployee) return new Set<number>();
    return new Set(selectedEmployee.availability.filter((a) => a.isActive).map((a) => a.dayOfWeek));
  }, [selectedEmployee]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const timeSlots = useMemo(() => {
    if (!selectedEmployee || !selectedDate) return [];
    return generateTimeSlots(selectedEmployee.id, selectedDate);
  }, [selectedEmployee, selectedDate, generateTimeSlots]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!selectedService;
      case 2: return !!selectedEmployee;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return customerName.trim().length >= 2 && customerEmail.includes("@") && customerPhone.trim().length >= 7;
      case 5: {
        if (!business?.bookingQuestions) return true;
        const required = business.bookingQuestions.filter((q) => q.required);
        return required.every((q) => questionAnswers[q.text]?.trim().length > 0);
      }
      default: return false;
    }
  }, [step, selectedService, selectedEmployee, selectedDate, selectedTime, customerName, customerEmail, customerPhone, business, questionAnswers]);

  const primaryColor = business?.primaryColor || "#3b82f6";
  const hasGallery = business?.gallery && business.gallery.length > 0;
  const hasQuestions = business?.bookingQuestions && business.bookingQuestions.length > 0;

  async function handleBooking() {
    if (!selectedService || !selectedEmployee || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const endTime = calculateEndTime(selectedTime, selectedService.duration);
      const res = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          serviceId: selectedService.id,
          employeeId: selectedEmployee.id,
          date: format(selectedDate, "yyyy-MM-dd"),
          startTime: selectedTime,
          endTime,
          customerName,
          customerEmail,
          customerPhone,
          notes: customerNotes,
          questionAnswers,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al reservar");
      }
      router.push(
        "/" + businessSlug + "/reserva-exitosa?servicio=" + encodeURIComponent(selectedService.name) +
        "&empleado=" + encodeURIComponent(selectedEmployee.name) +
        "&fecha=" + encodeURIComponent(format(selectedDate, "EEEE d 'de' MMMM", { locale: es })) +
        "&hora=" + selectedTime
      );
    } catch {
      setError("No se pudo reservar el turno. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-500" />
          <p className="mt-4 text-lg font-medium text-surface-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100 px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-error" />
          <h1 className="font-display text-xl font-semibold text-surface-900">Algo salió mal</h1>
          <p className="mt-2 text-surface-500">{error || "No se encontró el negocio."}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/30">
      {business.banner && (
        <div className="relative h-40 overflow-hidden sm:h-52">
          <img src={business.banner} alt={business.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="border-b border-surface-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <Scissors className="h-7 w-7" />
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-surface-900">{business.name}</h1>
              {business.description && <p className="text-sm text-surface-500 line-clamp-1">{business.description}</p>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-surface-500">
            {business.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {business.address}{business.city ? ", " + business.city : ""}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {business.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-surface-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Paso {step} de {TOTAL_STEPS}</span>
            <span className="text-xs font-medium" style={{ color: primaryColor }}>{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", i < step ? "bg-current" : i === step - 1 ? "opacity-60" : "bg-surface-200")}
                style={i < step ? { color: primaryColor } : {}}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium text-surface-400">
            {STEP_LABELS.map((label, i) => (
              <span key={i} className={cn(i + 1 <= step ? "font-semibold" : "")} style={i + 1 <= step ? { color: primaryColor } : {}}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="animate-fade-in">

          {step === 1 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Elegí tu servicio</h2>
              <p className="mt-1 text-sm text-surface-500">Seleccioná el servicio que deseás reservar</p>

              {services.length === 0 ? (
                <div className="mt-6 rounded-xl border border-surface-200 bg-white p-8 text-center">
                  <Scissors className="mx-auto h-10 w-10 text-surface-300" />
                  <p className="mt-3 text-sm text-surface-500">No hay servicios disponibles en este momento.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-surface-400">{category}</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {categoryServices.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => { setSelectedService(service); setSelectedEmployee(null); setSelectedDate(null); setSelectedTime(null); }}
                            className={cn(
                              "group relative rounded-xl border-2 p-4 text-left transition-all duration-200",
                              selectedService?.id === service.id
                                ? "border-current shadow-md"
                                : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm"
                            )}
                            style={selectedService?.id === service.id ? { borderColor: primaryColor, backgroundColor: primaryColor + "08" } : {}}
                          >
                            {selectedService?.id === service.id && (
                              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <h4 className="pr-8 font-semibold text-surface-900">{service.name}</h4>
                            {service.description && <p className="mt-1 text-xs text-surface-500 line-clamp-2">{service.description}</p>}
                            <div className="mt-3 flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 text-surface-500"><Clock className="h-3.5 w-3.5" />{service.duration} min</span>
                              <span className="flex items-center gap-1 font-semibold text-surface-700"><DollarSign className="h-3.5 w-3.5" />{formatCurrency(service.price)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasGallery && (
                <div className="mt-8 rounded-2xl border border-surface-100 bg-white p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Nuestros trabajos</h3>
                    <span className="text-[10px] text-surface-300">{galleryIndex + 1}/{business.gallery.length}</span>
                  </div>
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-xl bg-surface-100 aspect-[16/9]">
                      <img src={business.gallery[galleryIndex]} alt={"Trabajo " + (galleryIndex + 1)} className="h-full w-full object-cover" />
                      {business.gallery.length > 1 && (
                        <>
                          <button onClick={() => setGalleryIndex((p) => (p === 0 ? business.gallery.length - 1 : p - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button onClick={() => setGalleryIndex((p) => (p === business.gallery.length - 1 ? 0 : p + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    {business.gallery.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                        {business.gallery.map((img, i) => (
                          <button key={i} onClick={() => setGalleryIndex(i)} className={cn("h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all", i === galleryIndex ? "border-current shadow-md opacity-100" : "border-transparent opacity-50 hover:opacity-75")} style={i === galleryIndex ? { borderColor: primaryColor } : {}}>
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Elegí tu profesional</h2>
              <p className="mt-1 text-sm text-surface-500">Seleccioná quién realizará el servicio</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {filteredEmployees.map((emp) => (
                  <button key={emp.id} onClick={() => { setSelectedEmployee(emp); setSelectedDate(null); setSelectedTime(null); }} className={cn("group relative rounded-xl border-2 p-4 text-left transition-all duration-200", selectedEmployee?.id === emp.id ? "border-current shadow-md" : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm")} style={selectedEmployee?.id === emp.id ? { borderColor: primaryColor, backgroundColor: primaryColor + "08" } : {}}>
                    {selectedEmployee?.id === emp.id && (
                      <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                        {emp.avatar ? <img src={emp.avatar} alt={emp.name} className="h-12 w-12 rounded-full object-cover" /> : getInitials(emp.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-surface-900">{emp.name}</h4>
                        {emp.specialties.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {emp.specialties.slice(0, 3).map((s) => (
                              <span key={s} className="inline-flex items-center rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-600">{s}</span>
                            ))}
                          </div>
                        )}
                        {emp.bio && <p className="mt-1.5 text-xs text-surface-400 line-clamp-2 italic">{emp.bio}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {filteredEmployees.length === 0 && (
                <div className="rounded-xl border border-surface-200 bg-white p-8 text-center">
                  <User className="mx-auto h-10 w-10 text-surface-300" />
                  <p className="mt-3 text-sm text-surface-500">No hay profesionales disponibles para este servicio.</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Elegí fecha y hora</h2>
              <p className="mt-1 text-sm text-surface-500">Seleccioná el día y horario</p>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setWeekStart((p) => addDays(p, -7))} className="rounded-lg border border-surface-200 bg-white p-2 hover:bg-surface-50"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm font-medium text-surface-700">{format(weekStart, "MMMM yyyy", { locale: es })}</span>
                <button onClick={() => setWeekStart((p) => addDays(p, 7))} className="rounded-lg border border-surface-200 bg-white p-2 hover:bg-surface-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayNum = getDay(day);
                  const isAvailable = availableDays.has(dayNum);
                  const isPast = isBefore(day, new Date()) && !isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button key={day.toISOString()} onClick={() => { if (isAvailable && !isPast) { setSelectedDate(day); setSelectedTime(null); } }} disabled={!isAvailable || isPast} className={cn("flex flex-col items-center rounded-xl p-2 text-center transition-all", isSelected ? "text-white shadow-md" : isAvailable && !isPast ? "bg-white text-surface-700 hover:bg-brand-50 border border-surface-200 hover:border-brand-300" : "bg-surface-50 text-surface-300 cursor-not-allowed")} style={isSelected ? { backgroundColor: primaryColor } : {}}>
                      <span className="text-[10px] font-medium uppercase">{format(day, "EEE", { locale: es })}</span>
                      <span className="mt-0.5 text-lg font-bold">{format(day, "d")}</span>
                      {isToday(day) && <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", isSelected ? "bg-white" : "")} style={!isSelected ? { backgroundColor: primaryColor } : {}} />}
                    </button>
                  );
                })}
              </div>
              {selectedDate && (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-surface-400">Horarios para el {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                      {timeSlots.map((slot) => (
                        <button key={slot.time} onClick={() => slot.available && setSelectedTime(slot.time)} disabled={!slot.available} className={cn("rounded-lg border px-2 py-2.5 text-sm font-medium transition-all", selectedTime === slot.time ? "text-white shadow-md" : slot.available ? "border-surface-200 bg-white text-surface-700 hover:border-brand-300 hover:bg-brand-50" : "border-surface-100 bg-surface-50 text-surface-300 cursor-not-allowed")} style={selectedTime === slot.time ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-500">No hay horarios disponibles para esta fecha.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Tus datos</h2>
              <p className="mt-1 text-sm text-surface-500">Completá tu información de contacto</p>
              <div className="mt-6 space-y-4 rounded-xl border border-surface-200 bg-white p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Nombre completo *</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tu nombre" className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Email *</label>
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="tu@email.com" className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Teléfono *</label>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="11 2345-6789" className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Notas (opcional)</label>
                  <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Algún pedido especial..." rows={3} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>
            </div>
          )}

          {step === 5 && hasQuestions && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Preguntas adicionales</h2>
              <p className="mt-1 text-sm text-surface-500">Respondé para que podamos prepararte mejor</p>
              <div className="mt-6 space-y-4 rounded-xl border border-surface-200 bg-white p-5">
                {business.bookingQuestions.map((q) => (
                  <div key={q.id}>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">
                      {q.text}{q.required && " *"}
                    </label>
                    {q.type === "text" && (
                      <input type="text" value={questionAnswers[q.text] || ""} onChange={(e) => setQuestionAnswers((p) => ({ ...p, [q.text]: e.target.value }))} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    )}
                    {q.type === "yes_no" && (
                      <div className="flex gap-3">
                        {["Sí", "No"].map((opt) => (
                          <button key={opt} onClick={() => setQuestionAnswers((p) => ({ ...p, [q.text]: opt }))} className={cn("rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all", questionAnswers[q.text] === opt ? "border-current" : "border-surface-200 bg-white hover:border-surface-300")} style={questionAnswers[q.text] === opt ? { borderColor: primaryColor, backgroundColor: primaryColor + "08", color: primaryColor } : {}}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === "select" && q.options && (
                      <select value={questionAnswers[q.text] || ""} onChange={(e) => setQuestionAnswers((p) => ({ ...p, [q.text]: e.target.value }))} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                        <option value="">Seleccionar...</option>
                        {q.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && !hasQuestions && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Revisá tu turno</h2>
              <p className="mt-1 text-sm text-surface-500">Verificá que todo esté correcto</p>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Confirmá tu turno</h2>
              <p className="mt-1 text-sm text-surface-500">Revisá los datos antes de reservar</p>
              <div className="mt-6 rounded-xl border border-surface-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-surface-600"><Scissors className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-surface-500">Servicio</p>
                    <p className="font-semibold text-surface-900">{selectedService?.name}</p>
                    <p className="text-sm text-surface-500">{selectedService?.duration} min · {selectedService && formatCurrency(selectedService.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-surface-600"><User className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-surface-500">Profesional</p>
                    <p className="font-semibold text-surface-900">{selectedEmployee?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-surface-600"><Calendar className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-surface-500">Fecha y hora</p>
                    <p className="font-semibold text-surface-900">{selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</p>
                    <p className="text-sm text-surface-500">{selectedTime} - {selectedTime && selectedService && calculateEndTime(selectedTime, selectedService.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-surface-600"><User className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-surface-500">Tus datos</p>
                    <p className="font-semibold text-surface-900">{customerName}</p>
                    <p className="text-sm text-surface-500">{customerEmail} · {customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-surface-100 pt-4">
                  <span className="text-sm font-medium text-surface-500">Total</span>
                  <span className="text-xl font-bold text-surface-900">{selectedService && formatCurrency(selectedService.price)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="mt-12 border-t border-surface-100 pt-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-surface-400">Lo que dicen nuestros clientes</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {mockReviews.map((review, i) => (
                <div key={i} className="rounded-xl border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={cn("h-3.5 w-3.5", j < review.rating ? "fill-amber-400 text-amber-400" : "text-surface-200")} />
                    ))}
                  </div>
                  <p className="text-sm text-surface-600">{review.text}</p>
                  <p className="mt-2 text-xs font-medium text-surface-400">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && business.address && (
          <div className="mt-8 border-t border-surface-100 pt-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-surface-400">Ubicación</h3>
            <div className="overflow-hidden rounded-xl border border-surface-200">
              <iframe
                title="Ubicación del negocio"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={"https://www.google.com/maps?q=" + encodeURIComponent(business.address + (business.city ? ", " + business.city : "")) + "&output=embed"}
              />
              <div className="bg-white p-3">
                <p className="flex items-center gap-1.5 text-sm text-surface-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {business.address}{business.city ? ", " + business.city : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="sticky bottom-0 border-t border-surface-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          {step > 1 ? (
            <button onClick={() => setStep((p) => p - 1)} className="inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50">
              <ArrowLeft className="h-4 w-4" />Atrás
            </button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <button onClick={() => { if (canProceed) setStep((p) => p + 1); }} disabled={!canProceed} className={cn("inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all", canProceed ? "shadow-brand-600/25 hover:shadow-brand-600/40 active:scale-[0.98]" : "bg-surface-300 cursor-not-allowed shadow-none")} style={canProceed ? { backgroundColor: primaryColor } : {}}>
              Siguiente<ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleBooking} disabled={!canProceed || submitting} className={cn("inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all", canProceed && !submitting ? "bg-success shadow-success/25 hover:bg-success/90 active:scale-[0.98]" : "bg-surface-300 cursor-not-allowed shadow-none")}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Reservando...</> : <><Check className="h-4 w-4" />Reservar turno</>}
            </button>
          )}
        </div>
      </div>

      <footer className="border-t border-surface-100 bg-surface-50 py-4">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs text-surface-400">Hecho con <Link href="/" className="font-semibold text-surface-500 hover:text-brand-600 transition-colors">TurnoFácil</Link></p>
        </div>
      </footer>
    </div>
  );
}
