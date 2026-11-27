import { BookText } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { requireUsuario } from "@/lib/session";

// El dashboard lee cookies/headers y la base de datos en cada request.
export const instant = false;

export default async function DashboardPage() {
  const { usuario } = await requireUsuario();

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#1B2D27]">
      <header className="border-b border-[#DDE4E0] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D5C4B] text-white">
              <BookText size={18} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold">BiblioWeb</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7B9E92]">
                Manager
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">
                {usuario.nombres} {usuario.apellidos}
              </div>
              <div className="text-xs text-[#7A8B85]">{usuario.rol.nombre}</div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B9E92]">
            Panel de inicio
          </p>
          <h1 className="font-display mt-2 text-3xl font-normal">
            Hola, {usuario.nombres}
          </h1>
          <p className="mt-2 text-sm text-[#7A8B85]">
            Sesión iniciada como {usuario.rol.nombre}. Aquí irán las pantallas del
            prototipo P14.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Catálogo", "Libros, ejemplares y disponibilidad."],
            ["Lectores", "Altas, fichas y estado de sanción."],
            ["Préstamos", "Registro y vencimientos."],
            ["Devoluciones", "Cierre de préstamo y estado del ejemplar."],
            ["Multas", "Pagos, condonaciones y sanciones."],
            ["Reportes", "Operación y estado del sistema."],
          ].map(([titulo, descripcion]) => (
            <div
              key={titulo}
              className="rounded-xl border border-[#DDE4E0] bg-white p-5 shadow-sm"
            >
              <h2 className="font-display text-lg font-medium">{titulo}</h2>
              <p className="mt-1 text-sm text-[#7A8B85]">{descripcion}</p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">
                Pendiente
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
