import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function requireUsuario(opciones?: {
  permitirPasswordPendiente?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const usuario = await prisma.usuario.findUnique({
    where: { idAuth: session.user.id },
    include: {
      rol: {
        include: {
          permisos: { include: { permiso: true } },
        },
      },
      permisos: { include: { permiso: true } },
    },
  });

  if (!usuario) redirect("/login");

  if (usuario.debeCambiarPassword && !opciones?.permitirPasswordPendiente) {
    redirect("/cambiar-password");
  }

  return { session, usuario };
}

/**
 * Igual que requireUsuario, pero además exige un permiso concreto.
 * Los permisos salen de RolPermiso + UsuarioPermiso.
 */
export async function requirePermiso(codigo: string) {
  const ctx = await requireUsuario();

  const permisos = [
    ...ctx.usuario.rol.permisos.map((rp) => rp.permiso.codigo),
    ...ctx.usuario.permisos.map((up) => up.permiso.codigo),
  ];

  if (!permisos.includes(codigo)) {
    throw new Error(`No autorizado: falta el permiso ${codigo}`);
  }

  return ctx;
}

/**
 * Variante para usar dentro de Server Actions o Route Handlers,
 * donde conviene devolver null en vez de redirigir.
 */
export async function getUsuarioActual() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { idAuth: session.user.id },
    include: {
      rol: {
        include: {
          permisos: { include: { permiso: true } },
        },
      },
      permisos: { include: { permiso: true } },
    },
  });

  if (!usuario) return null;
  return { session, usuario };
}
