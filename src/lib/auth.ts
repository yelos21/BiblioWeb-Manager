import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, createAccessControl } from "better-auth/plugins";
import { correoRestablecerPassword } from "./email-templates";
import { prisma } from "./prisma";

const statements = {
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "set-email",
    "set-phone",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  catalogo: ["ver", "gestionar"],
  prestamos: ["registrar"],
  devoluciones: ["registrar"],
  multas: ["ver", "gestionar"],
  lectores: ["ver", "gestionar"],
  personal: ["ver", "gestionar"],
  reportes: ["ver"],
  auditoria: ["ver"],
} as const;

const ac = createAccessControl(statements);

const ADMINISTRADOR = ac.newRole({
  user: statements.user,
  session: statements.session,
  catalogo: ["ver", "gestionar"],
  prestamos: ["registrar"],
  devoluciones: ["registrar"],
  multas: ["ver", "gestionar"],
  lectores: ["ver", "gestionar"],
  personal: ["ver", "gestionar"],
  reportes: ["ver"],
  auditoria: ["ver"],
});

const MOSTRADOR = ac.newRole({
  catalogo: ["ver"],
  prestamos: ["registrar"],
  devoluciones: ["registrar"],
  multas: ["ver", "gestionar"],
  lectores: ["ver", "gestionar"],
});

const INVENTARIO = ac.newRole({
  catalogo: ["ver", "gestionar"],
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(
          `[dev] Enlace de recuperación para ${user.email}: ${url}`,
        );
      }

      try {
        const { enviarCorreo } = await import("./email");

        await enviarCorreo({
          to: user.email,
          subject: "Restablece tu contraseña de BiblioWeb Manager",
          html: correoRestablecerPassword({
            nombre: user.name,
            url,
          }),
        });
      } catch (error) {
        console.error(
          "No se pudo enviar el correo de recuperación de contraseña:",
          error,
        );
      }
    },
  },
  plugins: [
    admin({
      ac,
      defaultRole: "MOSTRADOR",
      adminRoles: ["ADMINISTRADOR"],
      roles: { ADMINISTRADOR, MOSTRADOR, INVENTARIO },
    }),
    nextCookies(),
  ],
});
