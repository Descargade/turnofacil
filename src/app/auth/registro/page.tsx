"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Calendar, ArrowRight, Eye, EyeOff, Check } from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    nombreNegocio: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput | "terms", string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!acceptedTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: "Debés aceptar los términos y condiciones",
      }));
      return;
    }

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof RegisterInput | "terms", string>
      > = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const data = await response.json();
        setGeneralError(
          data.error || data.message || "Error al crear la cuenta. Intentá de nuevo."
        );
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setGeneralError("Error de conexión. Intentá de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-surface-200/60 bg-white/80 p-8 shadow-2xl shadow-brand-900/5 backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">
              <span className="text-brand-600">Turno</span>
              <span className="text-accent-600">Fácil</span>
            </span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-surface-900">
            Creá tu cuenta
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Empezá a gestionar tus turnos hoy mismo
          </p>
        </div>

        {generalError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="mb-2 block text-sm font-semibold text-surface-700"
            >
              Nombre completo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-surface-50/50 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
                errors.nombre ? "border-red-400" : "border-surface-200"
              }`}
            />
            {errors.nombre && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-surface-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-surface-50/50 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
                errors.email ? "border-red-400" : "border-surface-200"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="mb-2 block text-sm font-semibold text-surface-700"
            >
              Teléfono{" "}
              <span className="text-surface-400 font-normal">(opcional)</span>
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="+54 11 1234-5678"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-surface-50/50 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
                errors.telefono ? "border-red-400" : "border-surface-200"
              }`}
            />
            {errors.telefono && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.telefono}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="nombreNegocio"
              className="mb-2 block text-sm font-semibold text-surface-700"
            >
              Nombre del negocio
            </label>
            <input
              id="nombreNegocio"
              name="nombreNegocio"
              type="text"
              placeholder="Mi Peluquería"
              value={formData.nombreNegocio}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-surface-50/50 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
                errors.nombreNegocio ? "border-red-400" : "border-surface-200"
              }`}
            />
            {errors.nombreNegocio && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.nombreNegocio}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-surface-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-surface-50/50 px-4 py-3 pr-11 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
                    errors.password ? "border-red-400" : "border-surface-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-surface-700"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-surface-50/50 px-4 py-3 pr-11 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
                    errors.confirmPassword ? "border-red-400" : "border-surface-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <div className="relative mt-0.5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                }}
                className="peer h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500/20"
              />
              {acceptedTerms && (
                <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white" />
              )}
            </div>
            <label htmlFor="terms" className="text-sm text-surface-600 leading-relaxed">
              Acepto los{" "}
              <Link
                href="/terminos"
                target="_blank"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                política de privacidad
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs font-medium text-red-600">{errors.terms}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-brand-600/40 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creando cuenta...
              </>
            ) : (
              <>
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-surface-100 pt-6 text-center">
          <p className="text-sm text-surface-500">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
