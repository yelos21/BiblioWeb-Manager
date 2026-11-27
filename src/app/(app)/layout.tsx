import { Suspense, type ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import { codigosDePermisos } from "@/lib/permisos";
import { requireUsuario } from "@/lib/session";

export const instant = false;
async function MarcoAutenticado({ children }: { children: ReactNode }) {
    const { usuario } = await requireUsuario();
    return (
        <AppShell
        usuario={{
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            rol: usuario.rol.nombre,
            permisos: codigosDePermisos(usuario),
        }}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F6F4EF]" />}>
          <MarcoAutenticado>{children}</MarcoAutenticado>
        </Suspense>
  );
}