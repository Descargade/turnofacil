import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { appointmentSchema } from "@/lib/validations";
import { z } from "zod";

const updateAppointmentSchema = appointmentSchema.partial().extend({
  estado: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"])
    .optional(),
  motivoCancelacion: z
    .string()
    .max(500, "El motivo es demasiado largo")
    .optional()
    .or(z.literal("")),
});

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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            category: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            specialties: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            notes: true,
            _count: {
              select: {
                appointments: { where: { deletedAt: null } },
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error al obtener cita:", error);
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

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.estado) {
      const updateData: Record<string, unknown> = { status: data.estado };

      if (data.estado === "CANCELLED") {
        updateData.cancelledBy = "admin";
        updateData.cancelReason = data.motivoCancelacion || null;
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: updateData,
        include: {
          service: { select: { id: true, name: true } },
          employee: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json(appointment);
    }

    const updateData: Record<string, unknown> = {};

    if (data.servicioId) {
      const service = await prisma.service.findFirst({
        where: { id: data.servicioId, businessId, deletedAt: null },
      });
      if (!service) {
        return NextResponse.json(
          { error: "Servicio no encontrado" },
          { status: 404 }
        );
      }
      updateData.serviceId = data.servicioId;
    }

    if (data.empleadoId) {
      const employee = await prisma.employee.findFirst({
        where: { id: data.empleadoId, businessId, deletedAt: null },
      });
      if (!employee) {
        return NextResponse.json(
          { error: "Empleado no encontrado" },
          { status: 404 }
        );
      }
      updateData.employeeId = data.empleadoId;
    }

    if (data.clienteId) {
      const customer = await prisma.customer.findFirst({
        where: { id: data.clienteId, businessId, deletedAt: null },
      });
      if (!customer) {
        return NextResponse.json(
          { error: "Cliente no encontrado" },
          { status: 404 }
        );
      }
      updateData.customerId = data.clienteId;
    }

    if (data.fecha) {
      updateData.date = new Date(data.fecha);
    }

    if (data.horaInicio) {
      updateData.startTime = data.horaInicio;
    }

    if (data.notas !== undefined) {
      updateData.notes = data.notas || null;
    }

    const targetEmployeeId = (updateData.employeeId as string) || existing.employeeId;
    const targetServiceId = (updateData.serviceId as string) || existing.serviceId;
    const targetDate = (updateData.date as Date) || existing.date;
    const targetStartTime = (updateData.startTime as string) || existing.startTime;

    if (updateData.serviceId || updateData.startTime) {
      const service = await prisma.service.findFirst({
        where: { id: targetServiceId, businessId, deletedAt: null },
      });

      if (service) {
        const startMinutes = parseTimeToMinutes(targetStartTime);
        const endMinutes = startMinutes + service.duration;
        updateData.endTime = minutesToTimeString(endMinutes);
      }
    }

    const finalStartTime = (updateData.startTime as string) || existing.startTime;
    const finalEndTime = (updateData.endTime as string) || existing.endTime;
    const finalEmployeeId = targetEmployeeId;
    const finalDate = targetDate;

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        businessId,
        employeeId: finalEmployeeId,
        date: finalDate,
        deletedAt: null,
        id: { not: id },
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lt: finalEndTime },
        endTime: { gt: finalStartTime },
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

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        service: { select: { id: true, name: true, price: true } },
        employee: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    if (existing.status === "CANCELLED") {
      return NextResponse.json(
        { error: "La cita ya está cancelada" },
        { status: 400 }
      );
    }

    let cancelReason: string | undefined;
    try {
      const body = await request.json();
      cancelReason = body.motivoCancelacion;
    } catch {
      // Body is optional for DELETE
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "CANCELLED",
        cancelledBy: "admin",
        cancelReason: cancelReason || "Cancelada por el administrador",
      },
      include: {
        service: { select: { id: true, name: true } },
        employee: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      mensaje: "Cita cancelada exitosamente",
      cita: appointment,
    });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
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
