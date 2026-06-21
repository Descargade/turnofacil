import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { serviceSchema } from "@/lib/validations";

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

    const service = await prisma.service.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
      include: {
        employees: {
          select: {
            id: true,
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                specialties: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
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

    const existing = await prisma.service.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { nombre, descripcion, duracion, precio, categoria } = parsed.data;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: nombre,
        description: descripcion || null,
        duration: duracion,
        price: precio,
        category: categoria,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
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

    const existing = await prisma.service.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const hasActiveAppointments = await prisma.appointment.findFirst({
      where: {
        serviceId: id,
        deletedAt: null,
        date: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (hasActiveAppointments) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el servicio porque tiene citas activas programadas",
        },
        { status: 409 }
      );
    }

    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ mensaje: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
