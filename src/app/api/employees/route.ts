import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { employeeSchema } from "@/lib/validations";

export async function GET() {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const employees = await prisma.employee.findMany({
      where: {
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
        _count: {
          select: {
            appointments: {
              where: {
                deletedAt: null,
                date: { gte: new Date() },
                status: { in: ["PENDING", "CONFIRMED"] },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
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

    const { nombre, email, telefono, especialidades, avatar, bio } = parsed.data;

    if (email) {
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          businessId,
          email,
          deletedAt: null,
        },
      });

      if (existingEmployee) {
        return NextResponse.json(
          { error: "Ya existe un empleado con este correo electrónico" },
          { status: 409 }
        );
      }
    }

    const employee = await prisma.employee.create({
      data: {
        businessId,
        name: nombre,
        email: email || null,
        phone: telefono || null,
        specialties: especialidades,
        avatar: avatar || null,
        bio: bio || null,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error al crear empleado:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
