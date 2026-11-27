import Link from "next/link";
import { Plus } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import { requireUsuario } from "@/lib/session";

export const instant = false;

const ZONA = "America/Mexico_City";
function fechaLarga(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" }).format(d);
}

function saludo(d: Date): string {
  const hora = Number(new Intl.DateTimeFormat("es-MX", { timeZone: ZONA, hour: "numeric", hourCycle: "h23" }).format(d));
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default async function DashboardPage() {
  const { usuario } = await requireUsuario();
  const ahora = new Date();
  const primerNombre = usuario.nombres.split(" ")[0];

  return (
    <>
      {}
      <EncabezadoPagina
        seccion={fechaLarga(ahora)}
        titulo={`${saludo(ahora)}, ${primerNombre}`}
        acciones={
          <Link
            href="/prestamos"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1D5C4B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174a3c]"
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo préstamo
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Catálogo", "Libros, ejemplares y disponibilidad."],
          ["Lectores", "Altas, fichas y estado de sanción."],
          ["Préstamos", "Registro y vencimientos."],
          ["Devoluciones", "Cierre de préstamo y estado del ejemplar."],
          ["Multas", "Pagos, condonaciones y sanciones."],
          ["Reportes", "Operación y estado del sistema."],
        ].map(([titulo, descripcion]) => (
          <div key={titulo} className="rounded-2xl border border-[#DDE4E0] bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-medium">{titulo}</h2>
            <p className="mt-1 text-sm text-[#7A8B85]">{descripcion}</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">Pendiente</p>
          </div>
        ))}
      </div>
    </>
  );
}