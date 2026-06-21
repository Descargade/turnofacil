import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      image: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.deletedAt) return null;
  return user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role && session.user.role !== "SUPER_ADMIN") {
    throw new Error("No tiene permisos para realizar esta acción");
  }

  return session;
}

export async function getBusinessId() {
  const session = await requireAuth();
  if (session.user.role === "SUPER_ADMIN") {
    return null;
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!business) {
    throw new Error("No se encontró un negocio asociado a su cuenta");
  }

  return business.id;
}
