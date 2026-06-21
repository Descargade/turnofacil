import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/auth-utils";
import { z } from "zod";

const availabilityItemSchema = z.object({
  diaSemana: z
    .number()
    .int()
    .min(0, "Día de semana inválido")
    .max(6, "Día de semana inválido"),
  horaInicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ingrese una hora válida (HH:MM)"),
  horaFin: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ingrese una hora válida (HH:MM)"),
  activo: z.boolean(),
});

const setAvailabilitySchema = z.object({
  empleadoId: z.string().min(1, "Seleccione un empleado"),
  disponibilidad: z
    .array(availabilityItemSchema)
    .min(1, "Configure al menos un día de disponibilidad"),
});

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
    const employeeId = searchParams.get("empleadoId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "El parámetro empleadoId es obligatorio" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, businessId, deletedAt: null },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    const availability = await prisma.availability.findMany({
      where: { employeeId },
      orderBy: { dayOfWeek: "asc" },
    });

    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const availabilityWithNames = availability.map((item) => ({
      ...item,
      dayName: dayNames[item.dayOfWeek],
    }));

    return NextResponse.json(availabilityWithNames);
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
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
    const parsed = setAvailabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { empleadoId, disponibilidad } = parsed.data;

    const employee = await prisma.employee.findFirst({
      where: { id: empleadoId, businessId, deletedAt: null },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    for (const item of disponibilidad) {
      if (item.horaInicio >= item.horaFin) {
        return NextResponse.json(
          {
            error: `La hora de inicio debe ser anterior a la hora de fin para el día ${item.diaSemana}`,
          },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const created: Array<{
        id: string;
        employeeId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }> = [];

      for (const item of disponibilidad) {
        const record = await tx.availability.upsert({
          where: {
            employeeId_dayOfWeek: {
              employeeId: empleadoId,
              dayOfWeek: item.diaSemana,
            },
          },
          update: {
            startTime: item.horaInicio,
            endTime: item.horaFin,
            isActive: item.activo,
          },
          create: {
            employeeId: empleadoId,
            dayOfWeek: item.diaSemana,
            startTime: item.horaInicio,
            endTime: item.horaFin,
            isActive: item.activo,
          },
        });
        created.push(record);
      }

      return created;
    });

    return NextResponse.json({
      mensaje: "Disponibilidad actualizada exitosamente",
      disponibilidad: result,
    });
  } catch (error) {
    console.error("Error al establecer disponibilidad:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
