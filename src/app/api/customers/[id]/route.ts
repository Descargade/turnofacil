import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { customerSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
      include: {
        appointments: {
          where: { deletedAt: null },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 50,
        },
        _count: {
          select: {
            appointments: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const { id } = await params;

    const existing = await prisma.customer.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { nombre, email, telefono, notas } = parsed.data;

    if (email && email !== existing.email) {
      const duplicateEmail = await prisma.customer.findFirst({
        where: {
          businessId,
          email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "Ya existe un cliente con este correo electrónico" },
          { status: 409 }
        );
      }
    }

    if (telefono && telefono !== existing.phone) {
      const duplicatePhone = await prisma.customer.findFirst({
        where: {
          businessId,
          phone: telefono,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicatePhone) {
        return NextResponse.json(
          { error: "Ya existe un cliente con este número de teléfono" },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: nombre,
        email: email || null,
        phone: telefono || null,
        notes: notas || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const { id } = await params;

    const existing = await prisma.customer.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const hasActiveAppointments = await prisma.appointment.findFirst({
      where: {
        customerId: id,
        deletedAt: null,
        date: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (hasActiveAppointments) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el cliente porque tiene citas activas programadas",
        },
        { status: 409 }
      );
    }

    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ mensaje: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
