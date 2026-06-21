import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingrese un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre es demasiado largo"),
    email: z.string().email("Ingrese un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string().min(1, "Confirme su contraseña"),
    telefono: z
      .string()
      .regex(/^\+?\d{7,15}$/, "Ingrese un número de teléfono válido")
      .optional()
      .or(z.literal("")),
    nombreNegocio: z
      .string()
      .min(2, "El nombre del negocio debe tener al menos 2 caracteres")
      .max(100, "El nombre del negocio es demasiado largo"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const serviceSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  descripcion: z
    .string()
    .max(500, "La descripción es demasiado larga")
    .optional()
    .or(z.literal("")),
  duracion: z
    .number("La duración debe ser un número")
    .int("La duración debe ser un número entero")
    .min(5, "La duración mínima es 5 minutos")
    .max(480, "La duración máxima es 480 minutos (8 horas)"),
  precio: z
    .number("El precio debe ser un número")
    .min(0, "El precio no puede ser negativo")
    .max(9999999, "El precio es demasiado alto"),
  categoria: z
    .string()
    .min(1, "La categoría es obligatoria")
    .max(50, "La categoría es demasiado larga"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const employeeSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z.string().email("Ingrese un email válido"),
  telefono: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Ingrese un número de teléfono válido")
    .optional()
    .or(z.literal("")),
  especialidades: z
    .array(z.string())
    .min(1, "Seleccione al menos una especialidad"),
  avatar: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "La biografía es demasiado larga").optional().or(z.literal("")),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const appointmentSchema = z.object({
  servicioId: z.string().min(1, "Seleccione un servicio"),
  empleadoId: z.string().min(1, "Seleccione un empleado"),
  clienteId: z.string().min(1, "Seleccione un cliente"),
  fecha: z.string().min(1, "Seleccione una fecha"),
  horaInicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ingrese una hora válida (HH:MM)"),
  notas: z
    .string()
    .max(500, "Las notas son demasiado largas")
    .optional()
    .or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const businessSettingsSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  descripcion: z
    .string()
    .max(500, "La descripción es demasiado larga")
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Ingrese un número de teléfono válido")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Ingrese un email válido").optional().or(z.literal("")),
  direccion: z
    .string()
    .max(200, "La dirección es demasiado larga")
    .optional()
    .or(z.literal("")),
  colorPrincipal: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Ingrese un color hexadecimal válido")
    .optional()
    .or(z.literal("")),
  timezone: z.string().min(1, "Seleccione una zona horaria"),
  recordatoriosEmail: z.boolean(),
  recordatoriosSMS: z.boolean(),
  horasAntelacionRecordatorio: z
    .number()
    .int()
    .min(1, "Mínimo 1 hora")
    .max(72, "Máximo 72 horas"),
  politicaCancelacion: z
    .string()
    .max(500, "La política es demasiado larga")
    .optional()
    .or(z.literal("")),
  formatoHora: z.enum(["12H", "24H"]),
  idioma: z.string().min(1, "Seleccione un idioma"),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

export const customerSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z.string().email("Ingrese un email válido"),
  telefono: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Ingrese un número de teléfono válido")
    .optional()
    .or(z.literal("")),
  notas: z
    .string()
    .max(500, "Las notas son demasiado largas")
    .optional()
    .or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
