"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Scissors,
  Download,
  Home,
  ArrowRight,
} from "lucide-react";

export default function ReservaExitosaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessSlug = params.businessSlug as string;

  const servicio = searchParams.get("servicio") || "";
  const empleado = searchParams.get("empleado") || "";
  const fecha = searchParams.get("fecha") || "";
  const hora = searchParams.get("hora") || "";

  function handleDownloadICS() {
    if (!servicio || !empleado || !fecha || !hora) return;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TurnoFácil//Reserva//ES",
      "BEGIN:VEVENT",
      `DTSTART:20260101T${hora.replace(":", "")}00`,
      `SUMMARY:${servicio} - ${empleado}`,
      `DESCRIPTION:Reserva en TurnoFácil\\nServicio: ${servicio}\\nProfesional: ${empleado}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `turno-${servicio.toLowerCase().replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-success/5">
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
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

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="animate-fade-in-up text-center">
          <div className="relative mx-auto mb-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-14 w-14 text-success" />
            </div>
            <div className="absolute inset-0 mx-auto h-24 w-24 animate-ping rounded-full bg-success/10 opacity-30" />
          </div>

          <h1 className="font-display text-2xl font-bold text-surface-900 sm:text-3xl">
            ¡Turno reservado exitosamente!
          </h1>
          <p className="mt-3 text-surface-500">
            Recibirás un email de confirmación con todos los detalles de tu reserva.
          </p>

          {(servicio || empleado || fecha || hora) && (
            <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl shadow-surface-900/5">
              <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4">
                <h2 className="text-sm font-semibold text-white/90">
                  Resumen de tu reserva
                </h2>
              </div>

              <div className="divide-y divide-surface-100 p-6">
                {servicio && (
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-surface-500">Servicio</p>
                      <p className="font-semibold text-surface-900">
                        {servicio}
                      </p>
                    </div>
                  </div>
                )}

                {empleado && (
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-surface-500">Profesional</p>
                      <p className="font-semibold text-surface-900">
                        {empleado}
                      </p>
                    </div>
                  </div>
                )}

                {fecha && (
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-50 text-surface-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-surface-500">Fecha</p>
                      <p className="font-semibold capitalize text-surface-900">
                        {fecha}
                      </p>
                    </div>
                  </div>
                )}

                {hora && (
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-surface-500">Horario</p>
                      <p className="font-semibold text-surface-900">{hora}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-white px-5 py-2.5 text-sm font-medium text-surface-700 shadow-sm transition-colors hover:bg-surface-50"
            >
              <Download className="h-4 w-4" />
              Agregar al calendario
            </button>

            <button
              onClick={() => router.push(`/${businessSlug}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/40"
            >
              <Home className="h-4 w-4" />
              Volver al inicio
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 rounded-xl border border-surface-200 bg-surface-50 p-4">
            <p className="text-xs text-surface-500">
              ¿Necesitás cancelar o modificar tu turno? Contactá directamente al negocio
              o gestiona tu cuenta desde tu perfil.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
