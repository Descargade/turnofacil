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
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, getInitials, calculateEndTime } from "@/lib/utils";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
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

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingState {
  step: number;
  service: ServiceData | null;
  employee: EmployeeData | null;
  date: Date | null;
  timeSlot: string | null;
  customerInfo: CustomerInfo;
}

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Servicio",
  "Profesional",
  "Fecha y hora",
  "Tus datos",
  "Confirmación",
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
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [booking, setBooking] = useState<BookingState>({
    step: 1,
    service: null,
    employee: null,
    date: null,
    timeSlot: null,
    customerInfo: { name: "", email: "", phone: "", notes: "" },
  });

  const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/business/${businessSlug}`);
        if (!res.ok) throw new Error("No se encontró el negocio");
        const data = await res.json();
        setBusiness(data.business);
        setServices(data.services.filter((s: ServiceData) => s.isActive));
        setEmployees(
          data.employees.filter((e: EmployeeData) => e.isActive)
        );
        setExistingAppointments(data.existingAppointments || []);
      } catch {
        setError("No se pudo cargar la información del negocio. Verificá el enlace y intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [businessSlug]);

  const filteredEmployees = useMemo(() => {
    if (!booking.service) return employees;
    return employees.filter((emp) =>
      emp.services.some((s) => s.serviceId === booking.service!.id)
    );
  }, [employees, booking.service]);

  const generateTimeSlots = useCallback(
    (employeeId: string, date: Date): TimeSlot[] => {
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp) return [];

      const dayOfWeek = getDay(date);
      const avail = emp.availability.find(
        (a) => a.dayOfWeek === dayOfWeek && a.isActive
      );
      if (!avail) return [];

      const opening = business?.openingTime || avail.startTime;
      const closing = business?.closingTime || avail.endTime;
      const duration = booking.service?.duration || 30;

      const slots: TimeSlot[] = [];
      const [startH, startM] = opening.split(":").map(Number);
      const [endH, endM] = closing.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const dateStr = format(date, "yyyy-MM-dd");

      for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        const endTime = calculateEndTime(time, duration);

        const isBooked = existingAppointments.some(
          (appt) =>
            appt.employeeId === employeeId &&
            appt.date === dateStr &&
            appt.startTime < endTime &&
            appt.endTime > time
        );

        const isPast =
          isToday(date) &&
          isBefore(new Date(), new Date(`${dateStr}T${time}:00`));

        slots.push({
          time,
          available: !isBooked && !isPast,
        });
      }

      return slots;
    },
    [employees, business, booking.service, existingAppointments]
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(selectedWeekStart, i));
  }, [selectedWeekStart]);

  const availableDays = useMemo(() => {
    if (!booking.employee) return new Set<number>();
    return new Set(
      booking.employee.availability
        .filter((a) => a.isActive)
        .map((a) => a.dayOfWeek)
    );
  }, [booking.employee]);

  const timeSlots = useMemo(() => {
    if (!booking.employee || !booking.date) return [];
    return generateTimeSlots(booking.employee.id, booking.date);
  }, [booking.employee, booking.date, generateTimeSlots]);

  const canProceed = useMemo(() => {
    switch (booking.step) {
      case 1:
        return !!booking.service;
      case 2:
        return !!booking.employee;
      case 3:
        return !!booking.date && !!booking.timeSlot;
      case 4:
        return (
          booking.customerInfo.name.trim().length >= 2 &&
          booking.customerInfo.email.includes("@") &&
          booking.customerInfo.phone.trim().length >= 7
        );
      default:
        return false;
    }
  }, [booking]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceData[]> = {};
    for (const s of services) {
      const cat = s.category || "Otros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    return groups;
  }, [services]);

  function handleNext() {
    if (canProceed && booking.step < TOTAL_STEPS) {
      setBooking((prev) => ({ ...prev, step: prev.step + 1 }));
    }
  }

  function handleBack() {
    if (booking.step > 1) {
      setBooking((prev) => ({ ...prev, step: prev.step - 1 }));
    }
  }

  function handleSelectService(service: ServiceData) {
    setBooking((prev) => ({
      ...prev,
      service,
      employee: null,
      date: null,
      timeSlot: null,
    }));
  }

  function handleSelectEmployee(employee: EmployeeData) {
    setBooking((prev) => ({
      ...prev,
      employee,
      date: null,
      timeSlot: null,
    }));
  }

  function handleSelectDate(date: Date) {
    setBooking((prev) => ({
      ...prev,
      date,
      timeSlot: null,
    }));
  }

  function handleSelectTimeSlot(time: string) {
    setBooking((prev) => ({ ...prev, timeSlot: time }));
  }

  function handleCustomerInfoChange(
    field: keyof CustomerInfo,
    value: string
  ) {
    setBooking((prev) => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [field]: value },
    }));
  }

  async function handleBooking() {
    if (!booking.service || !booking.employee || !booking.date || !booking.timeSlot) return;

    setSubmitting(true);
    try {
      const endTime = calculateEndTime(
        booking.timeSlot,
        booking.service.duration
      );

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          serviceId: booking.service.id,
          employeeId: booking.employee.id,
          date: format(booking.date, "yyyy-MM-dd"),
          startTime: booking.timeSlot,
          endTime,
          customerName: booking.customerInfo.name,
          customerEmail: booking.customerInfo.email,
          customerPhone: booking.customerInfo.phone,
          notes: booking.customerInfo.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al reservar el turno");
      }

      await res.json();
      setBookingSuccess(true);

      router.push(
        `/${businessSlug}/reserva-exitosa?servicio=${encodeURIComponent(booking.service.name)}&empleado=${encodeURIComponent(booking.employee.name)}&fecha=${encodeURIComponent(format(booking.date, "EEEE d 'de' MMMM", { locale: es }))}&hora=${booking.timeSlot}`
      );
    } catch {
      setError("No se pudo reservar el turno. Intentá de nuevo más tarde.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-500" />
          <p className="mt-4 text-lg font-medium text-surface-600">
            Cargando información del negocio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h1 className="font-display text-xl font-semibold text-surface-900">
            Oops, algo salió mal
          </h1>
          <p className="mt-2 text-surface-500">
            {error || "No se encontró el negocio solicitado."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-display text-xl font-semibold text-surface-900">
            ¡Turno reservado exitosamente!
          </h1>
          <p className="mt-2 text-surface-500">
            Recibirás un email de confirmación con los detalles de tu turno.
          </p>
          <button
            onClick={() => router.push(`/${businessSlug}`)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = business.primaryColor || "#3b82f6";

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/30">
      {/* Header del negocio */}
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link href="/" className="inline-block">
            <span className="font-display text-xl font-bold text-brand-600">
              Turno
            </span>
            <span className="font-display text-xl font-bold text-accent-600">
              Fácil
            </span>
          </Link>
        </div>
      </header>

      {/* Branding del negocio */}
      <div className="border-b border-surface-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <Scissors className="h-7 w-7" />
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-surface-900">
                {business.name}
              </h1>
              {business.description && (
                <p className="text-sm text-surface-500 line-clamp-1">
                  {business.description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-surface-500">
            {business.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {business.address}
                {business.city ? `, ${business.city}` : ""}
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

      {/* Indicador de progreso */}
      <div className="sticky top-0 z-30 border-b border-surface-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">
              Paso {booking.step} de {TOTAL_STEPS}
            </span>
            <span className="text-xs font-medium text-brand-600">
              {STEP_LABELS[booking.step - 1]}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i < booking.step
                    ? "bg-brand-500"
                    : i === booking.step - 1
                      ? "bg-brand-300"
                      : "bg-surface-200"
                )}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium text-surface-400">
            {STEP_LABELS.map((label, i) => (
              <span
                key={i}
                className={cn(
                  "transition-colors",
                  i + 1 <= booking.step ? "text-brand-600" : ""
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="animate-fade-in">
          {/* Paso 1: Selección de servicio */}
          {booking.step === 1 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">
                Elegí tu servicio
              </h2>
              <p className="mt-1 text-sm text-surface-500">
                Seleccioná el servicio que deseás reservar
              </p>

              <div className="mt-6 space-y-6">
                {Object.entries(groupedServices).map(
                  ([category, categoryServices]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-surface-400">
                        {category}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {categoryServices.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleSelectService(service)}
                            className={cn(
                              "group relative rounded-xl border-2 p-4 text-left transition-all duration-200",
                              booking.service?.id === service.id
                                ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10"
                                : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm"
                            )}
                          >
                            {booking.service?.id === service.id && (
                              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <h4 className="pr-8 font-semibold text-surface-900">
                              {service.name}
                            </h4>
                            {service.description && (
                              <p className="mt-1 text-xs text-surface-500 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            <div className="mt-3 flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 text-surface-500">
                                <Clock className="h-3.5 w-3.5" />
                                {service.duration} min
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-surface-700">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(service.price)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Paso 2: Selección de empleado */}
          {booking.step === 2 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">
                Elegí tu profesional
              </h2>
              <p className="mt-1 text-sm text-surface-500">
                Seleccioná quién realizará el servicio
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className={cn(
                      "group relative rounded-xl border-2 p-4 text-left transition-all duration-200",
                      booking.employee?.id === employee.id
                        ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10"
                        : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm"
                    )}
                  >
                    {booking.employee?.id === employee.id && (
                      <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(employee.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-surface-900">
                          {employee.name}
                        </h4>
                        {employee.specialties.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {employee.specialties
                              .slice(0, 3)
                              .map((specialty) => (
                                <span
                                  key={specialty}
                                  className="inline-flex items-center rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-600"
                                >
                                  {specialty}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="rounded-xl border border-surface-200 bg-white p-8 text-center">
                  <User className="mx-auto h-10 w-10 text-surface-300" />
                  <p className="mt-3 text-sm text-surface-500">
                    No hay profesionales disponibles para este servicio.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Selección de fecha y hora */}
          {booking.step === 3 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">
                Elegí fecha y hora
              </h2>
              <p className="mt-1 text-sm text-surface-500">
                Seleccioná el día y horario que mejor te quede
              </p>

              {/* Selector de semana */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() =>
                    setSelectedWeekStart(
                      (prev) => addDays(prev, -7)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-600 transition-colors hover:bg-surface-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-surface-700">
                  {format(weekDays[0], "MMMM yyyy", { locale: es })}
                </span>
                <button
                  onClick={() =>
                    setSelectedWeekStart(
                      (prev) => addDays(prev, 7)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-600 transition-colors hover:bg-surface-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="mt-4 grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayNum = getDay(day);
                  const isAvailable = availableDays.has(dayNum);
                  const isPast = isBefore(day, new Date()) && !isToday(day);
                  const isSelected =
                    booking.date && isSameDay(day, booking.date);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => isAvailable && !isPast && handleSelectDate(day)}
                      disabled={!isAvailable || isPast}
                      className={cn(
                        "flex flex-col items-center rounded-xl p-2 text-center transition-all",
                        isSelected
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                          : isAvailable && !isPast
                            ? "bg-white text-surface-700 hover:bg-brand-50 border border-surface-200 hover:border-brand-300"
                            : "bg-surface-50 text-surface-300 cursor-not-allowed"
                      )}
                    >
                      <span className="text-[10px] font-medium uppercase">
                        {format(day, "EEE", { locale: es })}
                      </span>
                      <span className="mt-0.5 text-lg font-bold">
                        {format(day, "d")}
                      </span>
                      {isToday(day) && (
                        <span
                          className={cn(
                            "mt-0.5 h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-white" : "bg-brand-500"
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Slots de tiempo */}
              {booking.date && (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-surface-400">
                    Horarios disponibles para el{" "}
                    {format(booking.date, "EEEE d 'de' MMMM", {
                      locale: es,
                    })}
                  </h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() =>
                            slot.available && handleSelectTimeSlot(slot.time)
                          }
                          disabled={!slot.available}
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all",
                            booking.timeSlot === slot.time
                              ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/25"
                              : slot.available
                                ? "border-surface-200 bg-white text-surface-700 hover:border-brand-300 hover:bg-brand-50"
                                : "border-surface-100 bg-surface-50 text-surface-300 line-through cursor-not-allowed"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-surface-200 bg-white p-6 text-center">
                      <Info className="mx-auto h-8 w-8 text-surface-300" />
                      <p className="mt-2 text-sm text-surface-500">
                        No hay horarios disponibles para esta fecha.
                        Probá con otro día.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!booking.date && (
                <div className="mt-6 rounded-xl border border-dashed border-surface-300 bg-white/50 p-6 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-surface-300" />
                  <p className="mt-2 text-sm text-surface-500">
                    Seleccioná una fecha para ver los horarios disponibles
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Datos personales */}
          {booking.step === 4 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">
                Tus datos
              </h2>
              <p className="mt-1 text-sm text-surface-500">
                Completá tu información para confirmar la reserva
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre y apellido"
                    value={booking.customerInfo.name}
                    onChange={(e) =>
                      handleCustomerInfoChange("name", e.target.value)
                    }
                    className="w-full rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={booking.customerInfo.email}
                    onChange={(e) =>
                      handleCustomerInfoChange("email", e.target.value)
                    }
                    className="w-full rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    placeholder="+54 11 1234-5678"
                    value={booking.customerInfo.phone}
                    onChange={(e) =>
                      handleCustomerInfoChange("phone", e.target.value)
                    }
                    className="w-full rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    Notas adicionales
                  </label>
                  <textarea
                    placeholder="Algún detalle especial que debamos saber..."
                    value={booking.customerInfo.notes}
                    onChange={(e) =>
                      handleCustomerInfoChange("notes", e.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 5: Confirmación */}
          {booking.step === 5 && (
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">
                Confirmá tu reserva
              </h2>
              <p className="mt-1 text-sm text-surface-500">
                Revisá los datos antes de confirmar
              </p>

              <div className="mt-6 space-y-4">
                {/* Resumen */}
                <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Servicio</p>
                      <p className="font-semibold text-surface-900">
                        {booking.service?.name}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-surface-500">Duración</p>
                      <p className="font-semibold text-surface-900">
                        {booking.service?.duration} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-surface-100 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Profesional</p>
                      <p className="font-semibold text-surface-900">
                        {booking.employee?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-surface-100 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Fecha y hora</p>
                      <p className="font-semibold text-surface-900">
                        {booking.date &&
                          format(
                            booking.date,
                            "EEEE d 'de' MMMM",
                            { locale: es }
                          )}
                      </p>
                      <p className="text-sm text-surface-500">
                        {booking.timeSlot} -{" "}
                        {booking.service &&
                          booking.timeSlot &&
                          calculateEndTime(
                            booking.timeSlot,
                            booking.service.duration
                          )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-surface-100 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-surface-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Tus datos</p>
                      <p className="font-semibold text-surface-900">
                        {booking.customerInfo.name}
                      </p>
                      <p className="text-sm text-surface-500">
                        {booking.customerInfo.email} · {booking.customerInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm font-medium text-surface-500">
                      Total
                    </span>
                    <span className="text-xl font-bold text-surface-900">
                      {booking.service &&
                        formatCurrency(booking.service.price)}
                    </span>
                  </div>
                </div>

                {booking.customerInfo.notes && (
                  <div className="rounded-xl border border-surface-200 bg-white p-4">
                    <p className="text-xs font-medium text-surface-500">
                      Notas adicionales
                    </p>
                    <p className="mt-1 text-sm text-surface-700">
                      {booking.customerInfo.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Barra de navegación inferior */}
      <div className="sticky bottom-0 border-t border-surface-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          {booking.step > 1 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
          ) : (
            <div />
          )}

          {booking.step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all",
                canProceed
                  ? "bg-brand-600 shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-600/40 active:scale-[0.98]"
                  : "bg-surface-300 cursor-not-allowed shadow-none"
              )}
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleBooking}
              disabled={!canProceed || submitting}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all",
                canProceed && !submitting
                  ? "bg-success shadow-success/25 hover:bg-success/90 hover:shadow-success/40 active:scale-[0.98]"
                  : "bg-surface-300 cursor-not-allowed shadow-none"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reservando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Reservar turno
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
