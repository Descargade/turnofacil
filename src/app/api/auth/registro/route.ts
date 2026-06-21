import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { nombre, email, password, telefono, nombreNegocio } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const slug = nombreNegocio
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingSlug = await prisma.business.findUnique({
      where: { slug },
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    const defaultPlan = await prisma.plan.findFirst({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    if (!defaultPlan) {
      return NextResponse.json(
        { error: "No hay planes disponibles. Contacte al administrador." },
        { status: 500 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: nombre,
          email,
          password: hashedPassword,
          phone: telefono || null,
          role: "BUSINESS_ADMIN",
        },
      });

      const business = await tx.business.create({
        data: {
          name: nombreNegocio,
          slug: finalSlug,
          ownerId: user.id,
          phone: telefono || null,
        },
      });

      await tx.subscription.create({
        data: {
          businessId: business.id,
          planId: defaultPlan.id,
          status: "TRIALING",
          trialEndsAt,
        },
      });

      return { user, business };
    });

    return NextResponse.json(
      {
        mensaje: "Cuenta creada exitosamente",
        usuario: {
          id: result.user.id,
          nombre: result.user.name,
          email: result.user.email,
        },
        negocio: {
          id: result.business.id,
          nombre: result.business.name,
          slug: result.business.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Intente de nuevo." },
      { status: 500 }
    );
  }
}
