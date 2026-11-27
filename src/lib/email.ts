import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "BiblioWeb <onboarding@resend.dev>";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY en el archivo .env");
  }
  return new Resend(apiKey);
}

export interface Correo {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}


export async function enviarCorreo({ to, subject, html, replyTo }: Correo) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }

  return data;
}
