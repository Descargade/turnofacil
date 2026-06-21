import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { appointmentSchema } from "@/lib/validations";

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
    const startDate = searchParams.get("fechaInicio");
    const endDate = searchParams.get("fechaFin");
    const status = searchParams.get("estado");
    const employeeId = searchParams.get("empleadoId");
    const customerId = searchParams.get("clienteId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      businessId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
              category: true,
            },
          },
          employee: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
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
    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { servicioId, empleadoId, clienteId, fecha, horaInicio, notas } =
      parsed.data;

    const service = await prisma.service.findFirst({
      where: { id: servicioId, businessId, deletedAt: null },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { id: empleadoId, businessId, deletedAt: null },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: { id: clienteId, businessId, deletedAt: null },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const employeeHasService = await prisma.employeeService.findFirst({
      where: { employeeId: empleadoId, serviceId: servicioId },
    });

    if (!employeeHasService) {
      return NextResponse.json(
        { error: "Este empleado no ofrece el servicio seleccionado" },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(fecha);
    const dayOfWeek = appointmentDate.getDay();

    const availability = await prisma.availability.findFirst({
      where: {
        employeeId: empleadoId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      return NextResponse.json(
        {
          error:
            "El empleado no está disponible para el día seleccionado",
        },
        { status: 400 }
      );
    }

    if (horaInicio < availability.startTime || horaInicio >= availability.endTime) {
      return NextResponse.json(
        {
          error: `El empleado solo está disponible entre ${availability.startTime} y ${availability.endTime} el día seleccionado`,
        },
        { status: 400 }
      );
    }

    const startMinutes = parseTimeToMinutes(horaInicio);
    const endMinutes = startMinutes + service.duration;
    const endTime = minutesToTimeString(endMinutes);

    if (endMinutes > parseTimeToMinutes(availability.endTime)) {
      return NextResponse.json(
        {
          error: `El servicio dura ${service.duration} minutos y excede el horario de disponibilidad del empleado`,
        },
        { status: 400 }
      );
    }

    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        businessId,
        date: appointmentDate,
        OR: [
          { employeeId: empleadoId },
          { employeeId: null },
        ],
      },
    });

    if (blockedDate) {
      return NextResponse.json(
        {
          error: "La fecha seleccionada está bloqueada para este empleado",
        },
        { status: 400 }
      );
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        businessId,
        employeeId: empleadoId,
        date: appointmentDate,
        deletedAt: null,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lt: endTime },
        endTime: { gt: horaInicio },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        {
          error:
            "El empleado ya tiene una cita programada en este horario. Seleccione otra hora.",
        },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        serviceId: servicioId,
        employeeId: empleadoId,
        customerId: clienteId,
        date: appointmentDate,
        startTime: horaInicio,
        endTime,
        notes: notas || null,
      },
      include: {
        service: { select: { id: true, name: true, price: true } },
        employee: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error al crear cita:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
