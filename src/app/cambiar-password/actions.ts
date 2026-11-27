"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";

export type CambiarPasswordResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Cambia la contraseña en Better Auth y, solo si el cambio fue exitoso,
 * marca `debeCambiarPassword = false`.
 *
 * Hacerlo en un único Server Action evita que alguien pueda llamar
 * directamente al action de "marcar como cambiada" sin cambiar la contraseña.
 */
export async function cambiarPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<CambiarPasswordResult> {
  if (
    typeof input?.currentPassword !== "string" ||
    typeof input?.newPassword !== "string"
  ) {
    return { ok: false, error: "Datos inválidos." };
  }

  if (!input.currentPassword) {
    return { ok: false, error: "Debes ingresar tu contraseña actual." };
  }

  if (input.newPassword.length < 8) {
    return {
      ok: false,
      error: "La nueva contraseña debe tener al menos 8 caracteres.",
    };
  }

  if (input.newPassword === input.currentPassword) {
    return {
      ok: false,
      error: "La nueva contraseña debe ser distinta a la actual.",
    };
  }

  const { usuario } = await requireUsuario({
    permitirPasswordPendiente: true,
  });

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (/invalid password/i.test(message)) {
      return { ok: false, error: "La contraseña actual es incorrecta." };
    }

    console.error("Error al cambiar la contraseña:", error);
    return {
      ok: false,
      error: "No se pudo cambiar la contraseña. Inténtalo de nuevo.",
    };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { debeCambiarPassword: false },
  });

  return { ok: true };
}
