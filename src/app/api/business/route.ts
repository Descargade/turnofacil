import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { businessSettingsSchema } from "@/lib/validations";

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
      where: {
        id: businessId,
        deletedAt: null,
      },
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
        settings: {
          select: {
            key: true,
            value: true,
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
    const parsed = businessSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const {
      nombre,
      descripcion,
      telefono,
      email,
      direccion,
      colorPrincipal,
      timezone,
      formatoHora,
      idioma,
      recordatoriosEmail,
      recordatoriosSMS,
      horasAntelacionRecordatorio,
      politicaCancelacion,
    } = parsed.data;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: nombre,
        description: descripcion || null,
        phone: telefono || null,
        email: email || null,
        address: direccion || null,
        primaryColor: colorPrincipal || null,
        timezone,
      },
    });

    const settingsValue = {
      formatoHora,
      idioma,
      recordatoriosEmail,
      recordatoriosSMS,
      horasAntelacionRecordatorio,
      politicaCancelacion: politicaCancelacion || null,
    };

    const existingSetting = await prisma.setting.findUnique({
      where: { businessId },
    });

    if (existingSetting) {
      await prisma.setting.update({
        where: { businessId },
        data: { value: settingsValue },
      });
    } else {
      await prisma.setting.create({
        data: {
          businessId,
          key: "business_settings",
          value: settingsValue,
        },
      });
    }

    return NextResponse.json({
      mensaje: "Negocio actualizado exitosamente",
      negocio: business,
    });
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
