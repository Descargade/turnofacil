import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessSlug,
      serviceId,
      employeeId,
      date,
      startTime,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      questionAnswers,
    } = body;

    if (!businessSlug || !serviceId || !employeeId || !date || !startTime || !customerName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const business = await prisma.business.findFirst({
      where: { slug: businessSlug, deletedAt: null },
    });

    if (!business) {
      return NextResponse.json(
        { error: "No se encontró el negocio" },
        { status: 404 }
      );
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId: business.id, deletedAt: null },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, businessId: business.id, deletedAt: null },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    const employeeHasService = await prisma.employeeService.findFirst({
      where: { employeeId, serviceId },
    });

    if (!employeeHasService) {
      return NextResponse.json(
        { error: "Este empleado no ofrece el servicio seleccionado" },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    const availability = await prisma.availability.findFirst({
      where: { employeeId, dayOfWeek, isActive: true },
    });

    if (!availability) {
      return NextResponse.json(
        { error: "El empleado no está disponible para el día seleccionado" },
        { status: 400 }
      );
    }

    if (startTime < availability.startTime || startTime >= availability.endTime) {
      return NextResponse.json(
        { error: `El empleado solo está disponible entre ${availability.startTime} y ${availability.endTime}` },
        { status: 400 }
      );
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const endMinutes = startH * 60 + startM + service.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    if (endMinutes > (() => { const [h, m] = availability.endTime.split(":").map(Number); return h * 60 + m; })()) {
      return NextResponse.json(
        { error: `El servicio dura ${service.duration} minutos y excede el horario de disponibilidad` },
        { status: 400 }
      );
    }

    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        businessId: business.id,
        date: appointmentDate,
        OR: [{ employeeId }, { employeeId: null }],
      },
    });

    if (blockedDate) {
      return NextResponse.json(
        { error: "La fecha seleccionada está bloqueada" },
        { status: 400 }
      );
    }

    const conflicting = await prisma.appointment.findFirst({
      where: {
        businessId: business.id,
        employeeId,
        date: appointmentDate,
        deletedAt: null,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "El empleado ya tiene un turno en este horario. Elegí otro horario." },
        { status: 409 }
      );
    }

    let customer = null;
    if (customerEmail) {
      customer = await prisma.customer.findFirst({
        where: { businessId: business.id, email: customerEmail, deletedAt: null },
      });
    }

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId: business.id,
          name: customerName,
          email: customerEmail || null,
          phone: customerPhone || null,
        },
      });
    }

    let finalNotes = notes || null;
    if (questionAnswers && Object.keys(questionAnswers).length > 0) {
      const answersText = Object.entries(questionAnswers)
        .map(([q, a]) => `${q}: ${a}`)
        .join("\n");
      finalNotes = finalNotes
        ? `${finalNotes}\n\n--- Respuestas del cliente ---\n${answersText}`
        : `--- Respuestas del cliente ---\n${answersText}`;
    }

    const appointment = await prisma.appointment.create({
      data: {
        businessId: business.id,
        serviceId,
        employeeId,
        customerId: customer.id,
        date: appointmentDate,
        startTime,
        endTime,
        notes: finalNotes,
      },
      include: {
        service: { select: { id: true, name: true, price: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error al crear turno público:", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
