import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { serviceSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("categoria");

    const where: Record<string, unknown> = {
      businessId,
      deletedAt: null,
    };

    if (category) {
      where.category = category;
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        employees: {
          select: {
            id: true,
            employee: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            employees: true,
            appointments: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
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
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { nombre, descripcion, duracion, precio, categoria } = parsed.data;

    const service = await prisma.service.create({
      data: {
        businessId,
        name: nombre,
        description: descripcion || null,
        duration: duracion,
        price: precio,
        category: categoria,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
