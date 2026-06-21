import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { customerSchema } from "@/lib/validations";

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
    const search = searchParams.get("busqueda");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      businessId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              appointments: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
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
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { nombre, email, telefono, notas } = parsed.data;

    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          businessId,
          email,
          deletedAt: null,
        },
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Ya existe un cliente con este correo electrónico" },
          { status: 409 }
        );
      }
    }

    if (telefono) {
      const existingByPhone = await prisma.customer.findFirst({
        where: {
          businessId,
          phone: telefono,
          deletedAt: null,
        },
      });

      if (existingByPhone) {
        return NextResponse.json(
          { error: "Ya existe un cliente con este número de teléfono" },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        businessId,
        name: nombre,
        email: email || null,
        phone: telefono || null,
        notes: notas || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
