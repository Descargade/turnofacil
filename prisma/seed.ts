import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...\n");

  // ============================================================
  // 1. Planes de suscripción
  // ============================================================
  console.log("📦 Creando planes de suscripción...");

  const planProfesional = await prisma.plan.upsert({
    where: { id: "plan-profesional" },
    update: {},
    create: {
      id: "plan-profesional",
      name: "Profesional",
      description:
        "Plan ideal para negocios que buscan una gestión completa de turnos y clientes.",
      price: 15000,
      currency: "ARS",
      interval: "monthly",
      features: [
        "Turnos ilimitados",
        "Gestión de empleados",
        "Recordatorios por email y SMS",
        "Reportes y métricas",
        "Soporte prioritario",
        "Página de reservas personalizada",
        "Calendario sincronizado",
        "Gestión de clientes",
      ],
      isActive: true,
    },
  });

  const _planPrueba = await prisma.plan.upsert({
    where: { id: "plan-prueba" },
    update: {},
    create: {
      id: "plan-prueba",
      name: "Prueba",
      description:
        "Probá TurnoFácil gratis durante 30 días. Sin tarjeta de crédito.",
      price: 0,
      currency: "ARS",
      interval: "monthly",
      features: [
        "Hasta 50 turnos por mes",
        "1 empleado",
        "Recordatorios por email",
        "Soporte por email",
      ],
      isActive: true,
    },
  });

  console.log("  ✅ Plan Profesional y Plan Prueba creados\n");

  // ============================================================
  // 2. Super Admin
  // ============================================================
  console.log("👤 Creando super administrador...");

  const hashedPassword = await hashPassword("Admin123!");

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@turnofacil.com" },
    update: {},
    create: {
      id: "user-super-admin",
      email: "admin@turnofacil.com",
      password: hashedPassword,
      name: "Administrador TurnoFácil",
      phone: "+54 11 0000-0000",
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`  ✅ Super Admin creado: ${superAdmin.email}\n`);

  // ============================================================
  // 3. Negocio demo: "Barbería El Corte"
  // ============================================================
  console.log("🏪 Creando negocio demo...");

  const businessOwner = await prisma.user.upsert({
    where: { email: "carlos@barberiaelcorte.com" },
    update: {},
    create: {
      id: "user-business-owner",
      email: "carlos@barberiaelcorte.com",
      password: await hashPassword("Carlos123!"),
      name: "Carlos Méndez",
      phone: "+54 11 2345-6789",
      role: "BUSINESS_ADMIN",
      emailVerified: new Date(),
    },
  });

  const business = await prisma.business.upsert({
    where: { slug: "barberia-el-corte" },
    update: {},
    create: {
      id: "business-1",
      name: "Barbería El Corte",
      slug: "barberia-el-corte",
      description:
        "Cortes modernos y clásicos para caballeros. Más de 10 años de experiencia brindando el mejor servicio.",
      phone: "+54 11 2345-6789",
      email: "info@barberiaelcorte.com",
      address: "Av. Corrientes 1234",
      city: "Buenos Aires",
      province: "Buenos Aires",
      postalCode: "C1043",
      primaryColor: "#1e3a5f",
      secondaryColor: "#c9a96e",
      whatsapp: "+54 11 2345-6789",
      instagram: "@barberiaelcorte",
      openingTime: "09:00",
      closingTime: "20:00",
      timezone: "America/Argentina/Buenos_Aires",
      ownerId: businessOwner.id,
    },
  });

  // Suscripción del negocio
  await prisma.subscription.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      id: "subscription-1",
      businessId: business.id,
      planId: planProfesional.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Configuración del negocio
  await prisma.setting.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      id: "setting-1",
      businessId: business.id,
      key: "business_settings",
      value: {
        recordatoriosEmail: true,
        recordatoriosSMS: false,
        horasAntelacionRecordatorio: 24,
        politicaCancelacion:
          "Se puede cancelar sin costo hasta 24 horas antes del turno.",
        formatoHora: "24H",
        idioma: "es",
      },
    },
  });

  console.log(`  ✅ Negocio "${business.name}" creado\n`);

  // ============================================================
  // 4. Servicios
  // ============================================================
  console.log("✂️  Creando servicios...");

  const serviceCorte = await prisma.service.upsert({
    where: { id: "service-corte" },
    update: {},
    create: {
      id: "service-corte",
      businessId: business.id,
      name: "Corte de cabello",
      description:
        "Corte clásico o moderno, lavado incluido. Incluye asesoramiento de estilo.",
      duration: 30,
      price: 3500,
      currency: "ARS",
      category: "Barbería",
      isActive: true,
    },
  });

  const serviceBarba = await prisma.service.upsert({
    where: { id: "service-barba" },
    update: {},
    create: {
      id: "service-barba",
      businessId: business.id,
      name: "Barba",
      description:
        "Recorte y diseño de barba con navaja caliente y toallas húmedas.",
      duration: 20,
      price: 2500,
      currency: "ARS",
      category: "Barbería",
      isActive: true,
    },
  });

  const serviceCorteBarba = await prisma.service.upsert({
    where: { id: "service-corte-barba" },
    update: {},
    create: {
      id: "service-corte-barba",
      businessId: business.id,
      name: "Corte + Barba",
      description:
        "Combo completo: corte de cabello y diseño de barba. El paquete más elegido.",
      duration: 45,
      price: 5000,
      currency: "ARS",
      category: "Barbería",
      isActive: true,
    },
  });

  const serviceCortePeluqueria = await prisma.service.upsert({
    where: { id: "service-corte-peluqueria" },
    update: {},
    create: {
      id: "service-corte-peluqueria",
      businessId: business.id,
      name: "Corte de pelo",
      description:
        "Corte personalizado para damas y caballeros. Lavado y secado incluido.",
      duration: 40,
      price: 4000,
      currency: "ARS",
      category: "Peluquería",
      isActive: true,
    },
  });

  const serviceTinte = await prisma.service.upsert({
    where: { id: "service-tinte" },
    update: {},
    create: {
      id: "service-tinte",
      businessId: business.id,
      name: "Tinte",
      description:
        "Coloración profesional con productos de primera calidad. Incluye lavado y secado.",
      duration: 90,
      price: 8000,
      currency: "ARS",
      category: "Peluquería",
      isActive: true,
    },
  });

  const serviceMelena = await prisma.service.upsert({
    where: { id: "service-melena" },
    update: {},
    create: {
      id: "service-melena",
      businessId: business.id,
      name: "Melena",
      description:
        "Secado y modelado profesional para un look impecable. Incluye lavado.",
      duration: 35,
      price: 3000,
      currency: "ARS",
      category: "Peluquería",
      isActive: true,
    },
  });

  console.log("  ✅ 6 servicios creados (Barbería y Peluquería)\n");

  // ============================================================
  // 5. Empleados
  // ============================================================
  console.log("👨‍💼 Creando empleados...");

  const employeeMatias = await prisma.employee.upsert({
    where: { id: "employee-matias" },
    update: {},
    create: {
      id: "employee-matias",
      businessId: business.id,
      name: "Matías Rodríguez",
      email: "matias@barberiaelcorte.com",
      phone: "+54 11 3456-7890",
      specialties: ["Corte clásico", "Barba", "Degradados"],
      isActive: true,
    },
  });

  const employeeLucas = await prisma.employee.upsert({
    where: { id: "employee-lucas" },
    update: {},
    create: {
      id: "employee-lucas",
      businessId: business.id,
      name: "Lucas Fernández",
      email: "lucas@barberiaelcorte.com",
      phone: "+54 11 4567-8901",
      specialties: ["Corte moderno", "Diseño de barba", "Tintes"],
      isActive: true,
    },
  });

  const employeeSofia = await prisma.employee.upsert({
    where: { id: "employee-sofia" },
    update: {},
    create: {
      id: "employee-sofia",
      businessId: business.id,
      name: "Sofía García",
      email: "sofia@barberiaelcorte.com",
      phone: "+54 11 5678-9012",
      specialties: ["Peluquería", "Tinte", "Melena", "Corte damas"],
      isActive: true,
    },
  });

  console.log("  ✅ 3 empleados creados\n");

  // ============================================================
  // 6. Relación empleados-servicios
  // ============================================================
  console.log("🔗 Asignando servicios a empleados...");

  const employeeServiceLinks = [
    // Matías: servicios de barbería
    { employeeId: employeeMatias.id, serviceId: serviceCorte.id },
    { employeeId: employeeMatias.id, serviceId: serviceBarba.id },
    { employeeId: employeeMatias.id, serviceId: serviceCorteBarba.id },
    // Lucas: servicios de barbería + peluquería
    { employeeId: employeeLucas.id, serviceId: serviceCorte.id },
    { employeeId: employeeLucas.id, serviceId: serviceBarba.id },
    { employeeId: employeeLucas.id, serviceId: serviceCorteBarba.id },
    { employeeId: employeeLucas.id, serviceId: serviceCortePeluqueria.id },
    { employeeId: employeeLucas.id, serviceId: serviceTinte.id },
    // Sofía: servicios de peluquería
    { employeeId: employeeSofia.id, serviceId: serviceCortePeluqueria.id },
    { employeeId: employeeSofia.id, serviceId: serviceTinte.id },
    { employeeId: employeeSofia.id, serviceId: serviceMelena.id },
  ];

  for (const link of employeeServiceLinks) {
    await prisma.employeeService.upsert({
      where: {
        employeeId_serviceId: {
          employeeId: link.employeeId,
          serviceId: link.serviceId,
        },
      },
      update: {},
      create: link,
    });
  }

  console.log("  ✅ Servicios asignados a empleados\n");

  // ============================================================
  // 7. Disponibilidad de empleados (Lunes a Sábado)
  // ============================================================
  console.log("📅 Creando disponibilidad horaria...");

  const availabilityEntries = [
    // Matías: Lunes a Viernes 9:00-18:00, Sábado 9:00-14:00
    ...[1, 2, 3, 4, 5].map((day) => ({
      employeeId: employeeMatias.id,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "18:00",
      isActive: true,
    })),
    {
      employeeId: employeeMatias.id,
      dayOfWeek: 6,
      startTime: "09:00",
      endTime: "14:00",
      isActive: true,
    },
    // Lucas: Martes a Sábado 10:00-19:00
    ...[2, 3, 4, 5, 6].map((day) => ({
      employeeId: employeeLucas.id,
      dayOfWeek: day,
      startTime: "10:00",
      endTime: "19:00",
      isActive: true,
    })),
    // Sofía: Lunes a Viernes 10:00-19:00, Sábado 10:00-15:00
    ...[1, 2, 3, 4, 5].map((day) => ({
      employeeId: employeeSofia.id,
      dayOfWeek: day,
      startTime: "10:00",
      endTime: "19:00",
      isActive: true,
    })),
    {
      employeeId: employeeSofia.id,
      dayOfWeek: 6,
      startTime: "10:00",
      endTime: "15:00",
      isActive: true,
    },
  ];

  for (const entry of availabilityEntries) {
    await prisma.availability.upsert({
      where: {
        employeeId_dayOfWeek: {
          employeeId: entry.employeeId,
          dayOfWeek: entry.dayOfWeek,
        },
      },
      update: {},
      create: entry,
    });
  }

  console.log("  ✅ Disponibilidad horaria configurada\n");

  // ============================================================
  // 8. Clientes demo
  // ============================================================
  console.log("👥 Creando clientes demo...");

  const customer1 = await prisma.customer.upsert({
    where: { id: "customer-1" },
    update: {},
    create: {
      id: "customer-1",
      businessId: business.id,
      name: "Juan Pablo López",
      email: "juanpablo@email.com",
      phone: "+54 11 6789-0123",
      notes: "Cliente frecuente, prefiere corte clásico.",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: "customer-2" },
    update: {},
    create: {
      id: "customer-2",
      businessId: business.id,
      name: "María Elena Ruiz",
      email: "mariaelena@email.com",
      phone: "+54 11 7890-1234",
      notes: null,
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { id: "customer-3" },
    update: {},
    create: {
      id: "customer-3",
      businessId: business.id,
      name: "Roberto Díaz",
      email: "roberto@email.com",
      phone: "+54 11 8901-2345",
      notes: "Alérgico a ciertos productos capilares.",
    },
  });

  const customer4 = await prisma.customer.upsert({
    where: { id: "customer-4" },
    update: {},
    create: {
      id: "customer-4",
      businessId: business.id,
      name: "Valentina Morales",
      email: "valentina@email.com",
      phone: "+54 11 9012-3456",
      notes: null,
    },
  });

  console.log("  ✅ 4 clientes creados\n");

  // ============================================================
  // 9. Citas demo
  // ============================================================
  console.log("📋 Creando citas de demostración...");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const demoAppointments = [
    {
      businessId: business.id,
      serviceId: serviceCorte.id,
      employeeId: employeeMatias.id,
      customerId: customer1.id,
      date: tomorrow,
      startTime: "10:00",
      endTime: "10:30",
      status: "CONFIRMED" as const,
      notes: null,
    },
    {
      businessId: business.id,
      serviceId: serviceCorteBarba.id,
      employeeId: employeeLucas.id,
      customerId: customer3.id,
      date: tomorrow,
      startTime: "11:00",
      endTime: "11:45",
      status: "CONFIRMED" as const,
      notes: "Traer foto del estilo deseado",
    },
    {
      businessId: business.id,
      serviceId: serviceTinte.id,
      employeeId: employeeSofia.id,
      customerId: customer2.id,
      date: tomorrow,
      startTime: "14:00",
      endTime: "15:30",
      status: "PENDING" as const,
      notes: "Tinte color rubio cenizo",
    },
    {
      businessId: business.id,
      serviceId: serviceBarba.id,
      employeeId: employeeMatias.id,
      customerId: customer1.id,
      date: nextWeek,
      startTime: "09:00",
      endTime: "09:20",
      status: "PENDING" as const,
      notes: null,
    },
    {
      businessId: business.id,
      serviceId: serviceCortePeluqueria.id,
      employeeId: employeeSofia.id,
      customerId: customer4.id,
      date: nextWeek,
      startTime: "10:00",
      endTime: "10:40",
      status: "CONFIRMED" as const,
      notes: null,
    },
    {
      businessId: business.id,
      serviceId: serviceMelena.id,
      employeeId: employeeSofia.id,
      customerId: customer4.id,
      date: nextWeek,
      startTime: "11:00",
      endTime: "11:35",
      status: "PENDING" as const,
      notes: "Secado con rizador",
    },
  ];

  for (const appointment of demoAppointments) {
    await prisma.appointment.create({ data: appointment });
  }

  console.log("  ✅ 6 citas de demostración creadas\n");

  // ============================================================
  // Resumen
  // ============================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed completado exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`
  📧 Login Super Admin:
     Email:    admin@turnofacil.com
     Password: Admin123!

  📧 Login Dueño del Negocio:
     Email:    carlos@barberiaelcorte.com
     Password: Carlos123!

  🏪 Negocio: Barbería El Corte
     URL:      /barberia-el-corte

  📊 Datos creados:
     • 2 planes de suscripción
     • 3 usuarios (1 super admin, 1 admin de negocio, 0 clientes users)
     • 1 negocio con configuración
     • 6 servicios (3 barbería, 3 peluquería)
     • 3 empleados con disponibilidad
     • 4 clientes
     • 6 citas de demostración
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
