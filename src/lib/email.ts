import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;

let resend: Resend | null = null;

function getResend() {
  if (!resendKey) return null;
  if (!resend) resend = new Resend(resendKey);
  return resend;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background-color:#1e3a5f;padding:24px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;">TurnoFácil</h1>
      </div>
      <div style="padding:32px;">
        ${content}
      </div>
      <div style="padding:16px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
          TurnoFácil - Gestión de turnos profesional
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmationToClient(params: {
  to: string;
  businessName: string;
  serviceName: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const client = getResend();
  if (!client) {
    console.log("[Email] Sin RESEND_API_KEY, email no enviado al cliente:", params.to);
    return;
  }

  const html = emailTemplate(`
    <h2 style="color:#1e3a5f;margin:0 0 8px 0;font-size:22px;">Turno confirmado</h2>
    <p style="color:#64748b;margin:0 0 24px 0;">Tu turno en <strong>${params.businessName}</strong> fue reservado exitosamente.</p>

    <div style="background-color:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Servicio</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.serviceName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Profesional</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.employeeName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Fecha</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${formatDate(params.date)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Horario</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.startTime} - ${params.endTime}</td>
        </tr>
      </table>
    </div>

    <p style="color:#64748b;font-size:14px;margin:0;">Si necesités cancelar o modificar tu turno, contactá directamente al negocio.</p>
  `);

  try {
    await client.emails.send({
      from: "TurnoFácil <onboarding@resend.dev>",
      to: params.to,
      subject: `Turno confirmado en ${params.businessName}`,
      html,
    });
    console.log("[Email] Confirmación enviada al cliente:", params.to);
  } catch (err) {
    console.error("[Email] Error al enviar al cliente:", err);
  }
}

export async function sendBookingNotificationToEmployee(params: {
  to: string;
  businessName: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const client = getResend();
  if (!client) {
    console.log("[Email] Sin RESEND_API_KEY, email no enviado al empleado:", params.to);
    return;
  }

  const html = emailTemplate(`
    <h2 style="color:#1e3a5f;margin:0 0 8px 0;font-size:22px;">Nuevo turno asignado</h2>
    <p style="color:#64748b;margin:0 0 24px 0;">Se reservó un nuevo turno en <strong>${params.businessName}</strong>.</p>

    <div style="background-color:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Cliente</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.customerName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Teléfono</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.customerPhone}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Servicio</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.serviceName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Fecha</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${formatDate(params.date)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Horario</td>
          <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${params.startTime} - ${params.endTime}</td>
        </tr>
      </table>
    </div>
  `);

  try {
    await client.emails.send({
      from: "TurnoFácil <onboarding@resend.dev>",
      to: params.to,
      subject: `Nuevo turno en ${params.businessName} - ${params.customerName}`,
      html,
    });
    console.log("[Email] Notificación enviada al empleado:", params.to);
  } catch (err) {
    console.error("[Email] Error al enviar al empleado:", err);
  }
}
