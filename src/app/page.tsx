"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  BarChart3,
  Shield,
  Bell,
  Check,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Calendario inteligente",
    description:
      "Vista diaria, semanal y mensual con drag-and-drop. Detectá conflictos de horarios al instante y optimizá la disponibilidad de cada profesional.",
  },
  {
    icon: Globe,
    title: "Reservas online 24/7",
    description:
      "Tus clientes reservan cuando quieran, desde cualquier dispositivo. Sin llamadas, sin esperas. Tu agenda se llena mientras dormís.",
  },
  {
    icon: Bell,
    title: "Recordatorios automáticos",
    description:
      "Reducí las inasistencias con recordatorios por email y SMS. Configurá el tiempo de anticipación y personalizá los mensajes.",
  },
  {
    icon: Users,
    title: "Gestión de equipo",
    description:
      "Administrá múltiples profesionales, sus horarios, permisos y comisiones. Cada uno tiene su propia agenda y perfil.",
  },
  {
    icon: BarChart3,
    title: "Reportes y métricas",
    description:
      "Dashboards con ingresos, ocupación, clientes frecuentes y tendencias. Tomá decisiones basadas en datos reales.",
  },
  {
    icon: Shield,
    title: "Multi-tenant seguro",
    description:
      "Cada negocio opera de forma completamente aislada. Tus datos están protegidos con encriptación de extremo a extremo.",
  },
];

const pricingTiers = [
  {
    name: "Gratis",
    description: "Ideal para probar la plataforma",
    price: "ARS 0",
    period: "por 14 días",
    features: [
      "1 profesional",
      "Hasta 50 turnos/mes",
      "Calendario básico",
      "Recordatorios por email",
      "Soporte por email",
    ],
    cta: "Comenzar gratis",
    highlighted: false,
  },
  {
    name: "Profesional",
    description: "Para negocios en crecimiento",
    price: "ARS 15.000",
    period: "/mes",
    features: [
      "Hasta 10 profesionales",
      "Turnos ilimitados",
      "Reservas online 24/7",
      "Recordatorios por email y SMS",
      "Reportes avanzados",
      "Gestión de clientes",
      "Soporte prioritario",
    ],
    cta: "Elegir Profesional",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Para grandes operaciones",
    price: "Personalizado",
    period: "",
    features: [
      "Profesionales ilimitados",
      "Multi-sucursal",
      "API completa",
      "Integraciones custom",
      "Soporte dedicado 24/7",
      "SLA garantizado",
      "Capacitación incluida",
    ],
    cta: "Contactar ventas",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "Martín González",
    business: "Barbería El Corte",
    location: "Buenos Aires",
    quote:
      "Desde que uso TurnoFácil, mis inasistencias bajaron un 60%. Mis clientes aman poder reservar por WhatsApp a cualquier hora.",
    rating: 5,
  },
  {
    name: "Luciana Fernández",
    business: "Studio LF Tattoos",
    location: "Córdoba",
    quote:
      "La gestión de equipo es increíble. Antes perdía horas armando horarios, ahora todo se administra solo. ¡Me dio mi vida de vuelta!",
    rating: 5,
  },
  {
    name: "Dr. Carlos Mendoza",
    business: "Consultorio Odontológico",
    location: "Rosario",
    quote:
      "Los recordatorios automáticos eliminaron las faltas. El reporte de métricas me ayudó a duplicar la facturación en 3 meses.",
    rating: 5,
  },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-surface-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-display text-xl font-bold text-brand-600">
            Turno
          </span>
          <span className="font-display text-xl font-bold text-accent-600">
            Fácil
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#funcionalidades"
            className="text-sm font-medium text-surface-600 transition-colors hover:text-brand-600"
          >
            Funcionalidades
          </a>
          <a
            href="#precios"
            className="text-sm font-medium text-surface-600 transition-colors hover:text-brand-600"
          >
            Precios
          </a>
          <a
            href="#testimonios"
            className="text-sm font-medium text-surface-600 transition-colors hover:text-brand-600"
          >
            Testimonios
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/registro"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/40"
          >
            Comenzar gratis
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-surface-600 hover:bg-surface-100 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-surface-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <a
              href="#funcionalidades"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
              onClick={() => setMobileOpen(false)}
            >
              Funcionalidades
            </a>
            <a
              href="#precios"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
              onClick={() => setMobileOpen(false)}
            >
              Precios
            </a>
            <a
              href="#testimonios"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
              onClick={() => setMobileOpen(false)}
            >
              Testimonios
            </a>
            <hr className="my-2 border-surface-200" />
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/registro"
              className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-accent-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand-50/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Plataforma #1 en gestión de turnos
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl animate-fade-in-up">
            Gestiona tus turnos de{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              forma inteligente
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-500 animate-fade-in-up delay-100">
            La plataforma SaaS que automatiza reservas, recordatorios y la
            gestión de tu negocio. Ideal para peluquerías, barberías, estudios
            de tatuaje y consultorios odontológicos.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up delay-200">
            <Link
              href="/auth/registro"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-300 bg-white px-8 py-3.5 text-base font-semibold text-surface-700 shadow-sm transition-all hover:border-surface-400 hover:bg-surface-50"
            >
              <Zap className="h-4 w-4 text-brand-500" />
              Ver demo
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-surface-400 animate-fade-in-up delay-300">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Configuración en 5 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Soporte en español
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl animate-fade-in-up delay-500">
          <div className="rounded-2xl border border-surface-200 bg-white p-2 shadow-2xl shadow-brand-900/10">
            <div className="rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 p-8 sm:p-12">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-xs font-medium text-surface-500">
                      09:00
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-surface-800">
                    Corte + Barba
                  </p>
                  <p className="text-xs text-surface-400">Martín G.</p>
                </div>
                <div className="rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-brand-400" />
                    <span className="text-xs font-medium text-surface-500">
                      10:30
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-surface-800">
                    Tatuaje brazo
                  </p>
                  <p className="text-xs text-surface-400">Luciana F.</p>
                </div>
                <div className="rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-accent-400" />
                    <span className="text-xs font-medium text-surface-500">
                      11:00
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-surface-800">
                    Limpieza dental
                  </p>
                  <p className="text-xs text-surface-400">Dr. Mendoza</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="col-span-2 rounded-lg bg-white/60 p-4 backdrop-blur-sm sm:col-span-1">
                  <p className="text-2xl font-bold text-brand-600">87%</p>
                  <p className="text-xs text-surface-500">Ocupación hoy</p>
                </div>
                <div className="col-span-2 rounded-lg bg-white/60 p-4 backdrop-blur-sm sm:col-span-1">
                  <p className="text-2xl font-bold text-success">+23%</p>
                  <p className="text-xs text-surface-500">vs. mes anterior</p>
                </div>
                <div className="col-span-2 rounded-lg bg-white/60 p-4 backdrop-blur-sm sm:col-span-1">
                  <p className="text-2xl font-bold text-accent-600">142</p>
                  <p className="text-xs text-surface-500">Turnos este mes</p>
                </div>
                <div className="col-span-2 rounded-lg bg-white/60 p-4 backdrop-blur-sm sm:col-span-1">
                  <p className="text-2xl font-bold text-surface-700">4.9</p>
                  <p className="text-xs text-surface-500">
                    <Star className="mb-0.5 inline h-3 w-3 fill-warning text-warning" />{" "}
                    Satisfacción
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 h-12 w-3/4 -translate-x-1/2 rounded-full bg-brand-900/10 blur-xl" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Funcionalidades
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-surface-900 sm:text-4xl">
            Todo lo que necesitás para gestionar tu negocio
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Herramientas poderosas diseñadas para profesionales que valoran su
            tiempo y el de sus clientes.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-surface-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5 hover:-translate-y-1"
            >
              <div className="mb-5 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-surface-900">
                {feature.title}
              </h3>
              <p className="mt-2 leading-relaxed text-surface-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="precios" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Precios
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-surface-900 sm:text-4xl">
            Precios simples y transparentes
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Elegí el plan que mejor se adapte a tu negocio. Todos incluyen
            14 días gratis.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "border-brand-600 bg-white shadow-xl shadow-brand-900/10 scale-[1.02]"
                  : "border-surface-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-brand-600/30">
                    Más popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-surface-900">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-surface-500">
                  {tier.description}
                </p>
              </div>

              <div className="mt-6">
                <span className="font-display text-4xl font-extrabold text-surface-900">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="ml-1 text-sm text-surface-500">
                    {tier.period}
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        tier.highlighted ? "text-brand-600" : "text-success"
                      }`}
                    />
                    <span className="text-sm text-surface-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.name === "Enterprise" ? "/contacto" : "/auth/registro"}
                className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-600/40"
                    : "border border-surface-300 text-surface-700 hover:border-surface-400 hover:bg-surface-50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Testimonios
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-surface-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Miles de profesionales ya confían en TurnoFácil para gestionar su
            negocio.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-warning text-warning"
                  />
                ))}
              </div>
              <blockquote className="leading-relaxed text-surface-600">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-surface-500">
                    {testimonial.business} · {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 px-8 py-16 sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Comienza a transformar tu negocio hoy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Unite a miles de profesionales que ya gestionan sus turnos de
              forma inteligente. Probá gratis durante 14 días.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/registro"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-xl transition-all hover:bg-brand-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Comenzar gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
              >
                Hablar con ventas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-200 bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="font-display text-xl font-bold text-brand-600">
                Turno
              </span>
              <span className="font-display text-xl font-bold text-accent-600">
                Fácil
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-surface-500">
              La plataforma SaaS más completa para la gestión de turnos en
              negocios de servicios profesionales.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://twitter.com/turnofacil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-400 transition-colors hover:border-brand-200 hover:text-brand-600"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/turnofacil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-400 transition-colors hover:border-brand-200 hover:text-brand-600"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/turnofacil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-400 transition-colors hover:border-brand-200 hover:text-brand-600"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-900">
              Producto
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="#funcionalidades"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Funcionalidades
                </a>
              </li>
              <li>
                <a
                  href="#precios"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Precios
                </a>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-900">Soporte</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/ayuda"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="/documentacion"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Documentación
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/estado"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Estado del sistema
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-900">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/terminos"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-surface-500 hover:text-brand-600"
                >
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-surface-200 pt-8 text-center">
          <p className="text-sm text-surface-400">
            © {currentYear} TurnoFácil. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
