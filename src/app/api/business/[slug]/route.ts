import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const business = await prisma.business.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!business) {
      return NextResponse.json(
        { error: "No se encontró el negocio" },
        { status: 404 }
      );
    }

    const [services, employees, existingAppointments] = await Promise.all([
      prisma.service.findMany({
        where: { businessId: business.id, deletedAt: null },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: { businessId: business.id, deletedAt: null },
        include: {
          services: { select: { serviceId: true } },
          availability: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              isActive: true,
            },
            orderBy: { dayOfWeek: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.appointment.findMany({
        where: {
          businessId: business.id,
          deletedAt: null,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { gte: new Date() },
        },
        select: {
          employeeId: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      }),
    ]);

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        logo: business.logo,
        banner: business.banner,
        gallery: Array.isArray(business.gallery) ? business.gallery : [],
        bookingQuestions: Array.isArray(business.bookingQuestions)
          ? business.bookingQuestions
          : [],
        primaryColor: business.primaryColor,
        secondaryColor: business.secondaryColor,
        phone: business.phone,
        address: business.address,
        city: business.city,
        openingTime: business.openingTime,
        closingTime: business.closingTime,
      },
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: Number(s.price),
        category: s.category,
        isActive: s.isActive,
      })),
      employees: employees.map((e) => ({
        id: e.id,
        name: e.name,
        avatar: e.avatar,
        specialties: e.specialties,
        isActive: e.isActive,
        services: e.services.map((s) => ({ serviceId: s.serviceId })),
        availability: e.availability,
      })),
      existingAppointments: existingAppointments.map((a) => ({
        employeeId: a.employeeId,
        date: a.date.toISOString().split("T")[0],
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    });
  } catch (error) {
    console.error("Error al obtener datos del negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
