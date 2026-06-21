// ============================================================
// Tipos del sistema basados en el esquema Prisma
// ============================================================

// Enums
export type UserRole = "SUPER_ADMIN" | "BUSINESS_ADMIN" | "CUSTOMER";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "CANCELLED" | "PAST_DUE";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type NotificationType = "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";

// Interfaces base (coinciden con Prisma)
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  logo?: string | null;
  banner?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  timezone: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: string;
  features?: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  businessId: string;
  planId: string;
  status: SubscriptionStatus;
  trialEndsAt?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  businessId: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  specialties: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  currency: string;
  category?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Customer {
  id: string;
  businessId: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  employeeId: string;
  customerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  // Relaciones (opcional, para consultas con include)
  service?: Service;
  employee?: Employee;
  customer?: Customer;
}

export interface Notification {
  id: string;
  userId: string;
  businessId?: string | null;
  type: NotificationType;
  subject: string;
  message: string;
  status: NotificationStatus;
  metadata?: unknown;
  createdAt: Date;
  readAt?: Date | null;
}

export interface Setting {
  id: string;
  businessId: string;
  key: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedDate {
  id: string;
  businessId: string;
  employeeId?: string | null;
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  businessId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

// Interfaces de dominio
export interface DashboardMetrics {
  totalCitasHoy: number;
  citasPendientes: number;
  citasCompletadasMes: number;
  citasCanceladasMes: number;
  ingresosMes: number;
  ingresosAnterior: number;
  totalClientes: number;
  nuevosClientesMes: number;
  serviciosPopulares: { serviceId: string; name: string; cantidad: number }[];
  empleadosActivos: number;
  tasaAsistencia: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  status: AppointmentStatus;
  clientName: string;
  serviceName: string;
  employeeName: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  isActive?: boolean;
  children?: { title: string; href: string }[];
}
