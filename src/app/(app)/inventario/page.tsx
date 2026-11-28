import Link from "next/link";
import { Plus, Search } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import Chip from "@/components/ui/Chip";
import { codigosDePermisos } from "@/lib/permisos";
import { requirePermiso } from "@/lib/session";
import { categoriaRepository } from "@/repositories/Categoria.repository";
import { libroRepository } from "@/repositories/Libro.repository";

export const instant = false;

const POR_PAGINA = 15;

type Props = { searchParams: Promise<{ q?: string; pagina?: string; creado?: string }> };

export default async function InventarioPage({ searchParams }: Props) {
  const { usuario } = await requirePermiso("catalogo.ver");
  const puedeGestionar = codigosDePermisos(usuario).includes("catalogo.gestionar");

  const { q, pagina: paginaParam, creado } = await searchParams;
  const texto = q?.trim() ?? "";
  const pagina = Math.max(Number.parseInt(paginaParam ?? "1", 10) || 1, 1);

  const { libros, total } = await libroRepository.listar({ texto, pagina, porPagina: POR_PAGINA });
  const totalPaginas = Math.max(Math.ceil(total / POR_PAGINA), 1);

  const [autoresPorLibro, categorias] = await Promise.all([
    libroRepository.autoresDeLibros(libros.flatMap((l) => (l.id === null ? [] : [l.id]))),
    categoriaRepository.listar(),
  ]);
  const nombreCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));

  function hrefPagina(p: number): string {
    const params = new URLSearchParams();
    if (texto) params.set("q", texto);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `/inventario?${qs}` : "/inventario";
  }

  return (
    <>
      <EncabezadoPagina
        seccion="Catálogo"
        titulo="Gestión de inventario"
        acciones={
          puedeGestionar ? (
            <Link
              href="/inventario/nuevo"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1D5C4B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174a3c]"
            >
              <Plus size={16} aria-hidden="true" />
              Nuevo libro
            </Link>
          ) : undefined
        }
      />

      {creado && /^\d+$/.test(creado) && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-[#BFD9D1] bg-[#E8F1EC] px-3.5 py-2.5 text-sm text-[#1D5C4B]"
        >
          Libro registrado correctamente con {creado} {creado === "1" ? "ejemplar" : "ejemplares"}.
        </div>
      )}

      <section className="rounded-2xl border border-[#DDE4E0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDE4E0] p-4 sm:p-5">
          <p className="text-sm text-[#7A8B85]">
            {total} {total === 1 ? "libro en el catálogo" : "libros en el catálogo"}
            {texto && <> para “{texto}”</>}
          </p>

          <form action="/inventario" method="get" role="search" className="relative w-full sm:w-72">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8A2]"
            />
            <input
              type="search"
              name="q"
              defaultValue={texto}
              placeholder="Título, autor o ISBN"
              aria-label="Buscar libro"
              className="h-10 w-full rounded-xl border border-[#DDE4E0] bg-[#F6F4EF] pl-10 pr-3 text-sm text-[#1B2D27] placeholder:text-[#9AA8A2] focus:border-[#1D5C4B] focus:outline-none focus:ring-2 focus:ring-[#1D5C4B]/15"
            />
          </form>
        </div>

        {libros.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[#7A8B85]">
            {texto ? "No se encontraron libros con esa búsqueda." : "Todavía no hay libros en el catálogo."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">
                  <th className="px-5 py-3">ISBN</th>
                  <th className="px-5 py-3">Libro</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Ejemplares</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F0]">
                {libros.map((l) => {
                  const autores = (l.id === null ? [] : (autoresPorLibro.get(l.id) ?? [])).map((a) => a.nombre);
                  const disponibles = l.contarEjemplaresDisponibles();
                  const totalEjemplares = l.listaEjemplares.length;
                  return (
                    <tr key={l.isbn} className="hover:bg-[#F8FAF9]">
                      <td className="px-5 py-3.5 text-[#1B2D27]">{l.isbn}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#1B2D27]">{l.titulo}</p>
                        <p className="text-xs text-[#7A8B85]">{autores.join(", ") || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#1B2D27]">{nombreCategoria.get(l.idCategoria) ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#1B2D27]">
                        {disponibles} / {totalEjemplares}
                      </td>
                      <td className="px-5 py-3.5">
                        <Chip tono={disponibles > 0 ? "verde" : "ambar"}>
                          {disponibles > 0 ? "Disponible" : "Sin disponibles"}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPaginas > 1 && (
          <nav
            aria-label="Paginación"
            className="flex items-center justify-between border-t border-[#DDE4E0] px-5 py-3 text-sm"
          >
            <span className="text-[#7A8B85]">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              {pagina > 1 && (
                <Link
                  href={hrefPagina(pagina - 1)}
                  className="rounded-lg border border-[#DDE4E0] px-3 py-1.5 font-semibold text-[#1B2D27] hover:bg-[#F3F7F5]"
                >
                  Anterior
                </Link>
              )}
              {pagina < totalPaginas && (
                <Link
                  href={hrefPagina(pagina + 1)}
                  className="rounded-lg border border-[#DDE4E0] px-3 py-1.5 font-semibold text-[#1B2D27] hover:bg-[#F3F7F5]"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </nav>
        )}
      </section>
    </>
  );
}