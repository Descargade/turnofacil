import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { employeeSchema } from "@/lib/validations";

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

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
      include: {
        services: {
          select: {
            id: true,
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true,
                category: true,
              },
            },
          },
        },
        availability: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true,
          },
          orderBy: { dayOfWeek: "asc" },
        },
        appointments: {
          where: {
            deletedAt: null,
            date: { gte: new Date() },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          take: 20,
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
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

    const existing = await prisma.employee.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = employeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { nombre, email, telefono, especialidades, avatar, bio, servicioIds } = parsed.data;

    if (email && email !== existing.email) {
      const duplicateEmail = await prisma.employee.findFirst({
        where: {
          businessId,
          email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "Ya existe un empleado con este correo electrónico" },
          { status: 409 }
        );
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: nombre,
        email: email || null,
        phone: telefono || null,
        specialties: especialidades,
        avatar: avatar !== undefined ? (avatar || null) : existing.avatar,
        bio: bio !== undefined ? (bio || null) : existing.bio,
      },
    });

    if (servicioIds !== undefined) {
      await prisma.employeeService.deleteMany({ where: { employeeId: id } });
      if (servicioIds.length > 0) {
        await prisma.employeeService.createMany({
          data: servicioIds.map((serviceId) => ({ employeeId: id, serviceId })),
        });
      }
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
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

    const existing = await prisma.employee.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    const hasActiveAppointments = await prisma.appointment.findFirst({
      where: {
        employeeId: id,
        deletedAt: null,
        date: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (hasActiveAppointments) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el empleado porque tiene citas activas programadas",
        },
        { status: 409 }
      );
    }

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ mensaje: "Empleado eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
