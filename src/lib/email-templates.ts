function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );
}

export function correoRestablecerPassword({
  nombre,
  url,
}: {
  nombre?: string | null;
  url: string;
}) {
  const saludo = nombre ? `Hola, ${escapeHtml(nombre)}:` : "Hola:";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#F5F8F6;font-family:Arial,Helvetica,sans-serif;color:#1B2D27;">
    <div style="padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #DDE4E0;border-radius:16px;overflow:hidden;">
        <div style="background:#1D5C4B;padding:28px 32px;color:#FFFFFF;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#A8CBC0;">
            BiblioWeb Manager
          </p>
          <h1 style="margin:12px 0 0;font-size:24px;font-weight:400;line-height:1.2;">
            Restablece tu contraseña
          </h1>
        </div>

        <div style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${saludo}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Si fuiste tú, usa el siguiente botón:
          </p>

          <p style="margin:24px 0;">
            <a
              href="${escapeHtml(url)}"
              style="display:inline-block;background:#1D5C4B;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:8px;"
            >
              Restablecer contraseña
            </a>
          </p>

          <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#7A8B85;">
            Este enlace vence en 1 hora y solo puede usarse una vez.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#7A8B85;">
            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá funcionando.
          </p>
        </div>

        <div style="padding:20px 32px;border-top:1px solid #DDE4E0;background:#F5F8F6;font-size:11px;color:#7A8B85;">
          BiblioWeb Manager · Acceso exclusivo para personal autorizado
        </div>
      </div>
    </div>
  </body>
</html>`;
}
