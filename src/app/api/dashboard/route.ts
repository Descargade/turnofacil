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

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      citasHoy,
      citasPendientes,
      citasCompletadasMes,
      citasCanceladasMes,
      totalClientes,
      nuevosClientesMes,
      empleadosActivos,
      serviciosPopulares,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          businessId,
          deletedAt: null,
          date: { gte: todayStart, lte: todayEnd },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),

      prisma.appointment.count({
        where: {
          businessId,
          deletedAt: null,
          date: { gte: todayStart },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),

      prisma.appointment.count({
        where: {
          businessId,
          deletedAt: null,
          date: { gte: monthStart, lte: monthEnd },
          status: "COMPLETED",
        },
      }),

      prisma.appointment.count({
        where: {
          businessId,
          deletedAt: null,
          date: { gte: monthStart, lte: monthEnd },
          status: "CANCELLED",
        },
      }),

      prisma.customer.count({
        where: {
          businessId,
          deletedAt: null,
        },
      }),

      prisma.customer.count({
        where: {
          businessId,
          deletedAt: null,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),

      prisma.employee.count({
        where: {
          businessId,
          deletedAt: null,
          isActive: true,
        },
      }),

      prisma.appointment.groupBy({
        by: ["serviceId"],
        where: {
          businessId,
          deletedAt: null,
          date: { gte: monthStart, lte: monthEnd },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

    const servicioIds = serviciosPopulares.map((s) => s.serviceId);
    const servicios =
      servicioIds.length > 0
        ? await prisma.service.findMany({
            where: { id: { in: servicioIds } },
            select: { id: true, name: true, price: true },
          })
        : [];

    const serviciosMap = new Map(servicios.map((s) => [s.id, s]));

    const serviciosPopularesConDetalle = serviciosPopulares.map((item) => {
      const servicio = serviciosMap.get(item.serviceId);
      return {
        serviceId: item.serviceId,
        name: servicio?.name || "Servicio desconocido",
        cantidad: item._count.id,
      };
    });

    const completedAppointmentsMonth = await prisma.appointment.findMany({
      where: {
        businessId,
        deletedAt: null,
        date: { gte: monthStart, lte: monthEnd },
        status: "COMPLETED",
      },
      select: {
        service: {
          select: { price: true },
        },
      },
    });

    let totalIngresosMes = 0;
    for (const apt of completedAppointmentsMonth) {
      totalIngresosMes += Number(apt.service.price);
    }

    const completedAppointmentsPrevMonth = await prisma.appointment.findMany({
      where: {
        businessId,
        deletedAt: null,
        date: { gte: prevMonthStart, lte: prevMonthEnd },
        status: "COMPLETED",
      },
      select: {
        service: {
          select: { price: true },
        },
      },
    });

    let totalIngresosAnterior = 0;
    for (const apt of completedAppointmentsPrevMonth) {
      totalIngresosAnterior += Number(apt.service.price);
    }

    const totalCitasMes = citasCompletadasMes + citasCanceladasMes;
    const tasaAsistencia =
      totalCitasMes > 0
        ? Math.round((citasCompletadasMes / totalCitasMes) * 100)
        : 0;

    return NextResponse.json({
      totalCitasHoy: citasHoy,
      citasPendientes,
      citasCompletadasMes,
      citasCanceladasMes,
      ingresosMes: totalIngresosMes,
      ingresosMesAnterior: totalIngresosAnterior,
      totalClientes,
      nuevosClientesMes,
      serviciosPopulares: serviciosPopularesConDetalle,
      empleadosActivos,
      tasaAsistencia,
    });
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
