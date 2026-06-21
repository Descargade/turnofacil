import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";

export async function GET() {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: {
        subscription: {
          select: {
            id: true,
            status: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                id: true,
                name: true,
                price: true,
                features: true,
              },
            },
          },
        },
        _count: {
          select: {
            employees: { where: { deletedAt: null } },
            services: { where: { deletedAt: null } },
            customers: { where: { deletedAt: null } },
            appointments: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error al obtener negocio:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json(
        { error: "No se encontró un negocio asociado" },
        { status: 404 }
      );
    }

    const existing = await prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      nombre,
      descripcion,
      telefono,
      email,
      direccion,
      ciudad,
      provincia,
      codigoPostal,
      colorPrincipal,
      colorSecundario,
      logo,
      banner,
      gallery,
      bookingQuestions,
      whatsapp,
      instagram,
      facebook,
      website,
      horarioApertura,
      horarioCierre,
      timezone,
    } = body;

    if (!nombre || nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre del negocio es obligatorio" },
        { status: 400 }
      );
    }

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: nombre.trim(),
        description: descripcion || null,
        phone: telefono || null,
        email: email || null,
        address: direccion || null,
        city: ciudad || null,
        province: provincia || null,
        postalCode: codigoPostal || null,
        primaryColor: colorPrincipal || null,
        secondaryColor: colorSecundario || null,
        logo: logo || null,
        banner: banner || null,
        gallery: gallery || [],
        bookingQuestions: bookingQuestions || [],
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        facebook: facebook || null,
        website: website || null,
        openingTime: horarioApertura || null,
        closingTime: horarioCierre || null,
        timezone: timezone || "America/Argentina/Buenos_Aires",
      },
    });

    return NextResponse.json({
      mensaje: "Negocio actualizado exitosamente",
      negocio: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
    });
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
