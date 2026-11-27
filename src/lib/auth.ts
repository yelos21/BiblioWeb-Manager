import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, createAccessControl } from "better-auth/plugins";
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
    // P4: solo el personal autorizado tiene cuenta; no hay registro publico.
    disableSignUp: true,
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
