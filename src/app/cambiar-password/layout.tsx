import type { ReactNode } from "react";
import { requireUsuario } from "@/lib/session";

export const instant = false;

export default async function CambiarPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Exige sesión, pero permite entrar aunque la contraseña siga pendiente.
  await requireUsuario({ permitirPasswordPendiente: true });
  return <>{children}</>;
}
