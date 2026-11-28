import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import Button from "@/components/ui/button";
import Chip, { type TonoChip } from "@/components/ui/Chip";
import { dinero, fechaDia, fechaHora } from "@/lib/formato";
import { codigosDePermisos } from "@/lib/permisos";
import { requirePermiso } from "@/lib/session";
import type { EstadoMulta, EstadoPrestamo } from "@/models/Enums";
import type { Sancion } from "@/models/sancion";
import { clienteRepository } from "@/repositories/Cliente.repository";
import { ejemplarRepository } from "@/repositories/Ejemplar.repository";
import { libroRepository } from "@/repositories/Libro.repository";
import { multaRepository } from "@/repositories/Multa.repository";
import { prestamoRepository } from "@/repositories/prestamo.repository";

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ actualizado?: string }>;
};

const PRESTAMOS_RECIENTES = 10;

const tonoMulta: Record<EstadoMulta, { tono: TonoChip; etiqueta: string }> = {
  PENDIENTE: { tono: "ambar", etiqueta: "Pendiente" },
  PAGADA: { tono: "verde", etiqueta: "Pagada" },
  CONDONADA: { tono: "gris", etiqueta: "Condonada" },
};

const tonoPrestamo: Record<EstadoPrestamo, { tono: TonoChip; etiqueta: string }> = {
  ACTIVO: { tono: "verde", etiqueta: "Activo" },
  VENCIDO: { tono: "rojo", etiqueta: "Vencido" },
  DEVUELTO: { tono: "gris", etiqueta: "Devuelto" },
};

function estadoSancion(s: Sancion): { tono: TonoChip; etiqueta: string } {
  if (s.fechaLevantada) return { tono: "gris", etiqueta: "Levantada" };
  if (s.vigente) return { tono: "rojo", etiqueta: "Vigente" };
  return { tono: "gris", etiqueta: "Cumplida" };
}

function Tarjeta({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#DDE4E0] bg-white shadow-sm">
      <header className="border-b border-[#DDE4E0] px-5 py-4">
        <h2 className="font-display text-lg font-normal text-[#1B2D27]">{titulo}</h2>
        {subtitulo && <p className="mt-0.5 text-xs text-[#7A8B85]">{subtitulo}</p>}
      </header>
      {children}
    </section>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">{etiqueta}</dt>
      <dd className="mt-1 text-sm text-[#1B2D27]">{children}</dd>
    </div>
  );
}

function Vacio({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-[#7A8B85]">{children}</p>;
}

const th = "px-5 py-3";
const td = "px-5 py-3.5";
const thead = "text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]";

export default async function FichaLectorPage({ params, searchParams }: Props) {
  const { usuario } = await requirePermiso("lectores.ver");

  const { id: idParam } = await params;
  const { actualizado } = await searchParams;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) notFound();

  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) notFound();

  const puedeGestionar = codigosDePermisos(usuario).includes("lectores.gestionar");

  const [multas, historial, totalPendiente] = await Promise.all([
    multaRepository.listarPorCliente(id),
    prestamoRepository.listar({ idCliente: id, porPagina: PRESTAMOS_RECIENTES }),
    multaRepository.totalPendientePorCliente(id),
  ]);

  const prestamos = await Promise.all(
    historial.prestamos.map(async (p) => {
      const ejemplar = await ejemplarRepository.buscarPorId(p.idEjemplar);
      const libro = ejemplar ? await libroRepository.buscarPorId(ejemplar.idLibro) : null;
      return { prestamo: p, codigo: ejemplar?.codigoInventario ?? "—", titulo: libro?.titulo ?? "—" };
    }),
  );

  const sanciones = cliente.listaSanciones;
  const sancionesVigentes = sanciones.filter((s) => s.vigente).length;
  const multasPendientes = multas.filter((m) => m.estado === "PENDIENTE").length;
  const habilitado = cliente.estado === "ACTIVO";

  return (
    <>
      <EncabezadoPagina
        seccion={`Credencial n.º ${cliente.credencial ?? "—"}`}
        titulo={cliente.nombre}
        acciones={
          <div className="flex gap-3">
            <Button href="/lectores" variant="secondary">
              Volver
            </Button>
            {puedeGestionar && (
              <Button href={`/lectores/${id}/editar`} variant="primary" leftIcon={<Pencil size={16} />}>
                Editar
              </Button>
            )}
          </div>
        }
      />

      {actualizado === "1" && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-[#BFD9D1] bg-[#E8F1EC] px-3.5 py-2.5 text-sm text-[#1D5C4B]"
        >
          Los datos del lector se guardaron correctamente.
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Tarjeta titulo="Datos del lector">
            <dl className="grid gap-5 p-5 sm:grid-cols-2">
              <Dato etiqueta="Documento">
                <span className="text-xs text-[#7A8B85]">{cliente.tipoDocumento}</span> {cliente.identificacion}
              </Dato>
              <Dato etiqueta="Estado">
                <Chip tono={habilitado ? "verde" : "rojo"}>{habilitado ? "Habilitado" : "Sancionado"}</Chip>
              </Dato>
              <Dato etiqueta="Correo">{cliente.email}</Dato>
              <Dato etiqueta="Teléfono">{cliente.telefono ?? "—"}</Dato>
              <div className="sm:col-span-2">
                <Dato etiqueta="Dirección">{cliente.direccion ?? "—"}</Dato>
              </div>
              <Dato etiqueta="Registrado el">{fechaHora(cliente.fechaRegistro)}</Dato>
            </dl>
          </Tarjeta>

          <Tarjeta titulo="Préstamos recientes" subtitulo={`Últimos ${PRESTAMOS_RECIENTES} de ${historial.total}`}>
            {prestamos.length === 0 ? (
              <Vacio>Este lector todavía no tiene préstamos.</Vacio>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className={thead}>
                      <th className={th}>Libro</th>
                      <th className={th}>Ejemplar</th>
                      <th className={th}>Prestado</th>
                      <th className={th}>Vence</th>
                      <th className={th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F0]">
                    {prestamos.map(({ prestamo: p, codigo, titulo }) => {
                      const e = tonoPrestamo[p.estado];
                      return (
                        <tr key={p.id ?? codigo}>
                          <td className={`${td} font-semibold text-[#1B2D27]`}>{titulo}</td>
                          <td className={td}>{codigo}</td>
                          <td className={td}>{fechaHora(p.fechaPrestamo)}</td>
                          <td className={td}>{fechaDia(p.fechaVencimiento)}</td>
                          <td className={td}>
                            <Chip tono={e.tono}>{e.etiqueta}</Chip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Tarjeta>

          <Tarjeta titulo="Multas">
            {multas.length === 0 ? (
              <Vacio>Sin multas registradas.</Vacio>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className={thead}>
                      <th className={th}>Generada</th>
                      <th className={th}>Días de retraso</th>
                      <th className={th}>Monto</th>
                      <th className={th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F0]">
                    {multas.map((m) => {
                      const e = tonoMulta[m.estado];
                      return (
                        <tr key={m.id ?? m.idDevolucion}>
                          <td className={td}>{fechaHora(m.fechaGeneracion)}</td>
                          <td className={td}>{m.diasRetraso}</td>
                          <td className={`${td} font-semibold text-[#1B2D27]`}>{dinero(m.monto)}</td>
                          <td className={td}>
                            <Chip tono={e.tono}>{e.etiqueta}</Chip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Tarjeta>

          <Tarjeta titulo="Sanciones">
            {sanciones.length === 0 ? (
              <Vacio>Sin sanciones registradas.</Vacio>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className={thead}>
                      <th className={th}>Motivo</th>
                      <th className={th}>Desde</th>
                      <th className={th}>Hasta</th>
                      <th className={th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F0]">
                    {sanciones.map((s) => {
                      const e = estadoSancion(s);
                      return (
                        <tr key={s.id ?? s.fechaInicio.getTime()}>
                          <td className={td}>{s.motivo}</td>
                          <td className={td}>{fechaDia(s.fechaInicio)}</td>
                          <td className={td}>{fechaDia(s.fechaFin)}</td>
                          <td className={td}>
                            <Chip tono={e.tono}>{e.etiqueta}</Chip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Tarjeta>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#DDE4E0] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">
              Préstamos activos
            </p>
            <p className="font-display mt-1 text-3xl text-[#1B2D27]">{cliente.contarPrestamosActivos()}</p>
          </div>
          <div className="rounded-2xl border border-[#DDE4E0] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">
              Multas pendientes
            </p>
            <p className="font-display mt-1 text-3xl text-[#1B2D27]">{multasPendientes}</p>
            {multasPendientes > 0 && (
              <p className="mt-1 text-xs text-[#7A8B85]">Total por pagar: {dinero(totalPendiente)}</p>
            )}
          </div>
          <div className="rounded-2xl border border-[#DDE4E0] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3B0AB]">
              Sanciones vigentes
            </p>
            <p className="font-display mt-1 text-3xl text-[#1B2D27]">{sancionesVigentes}</p>
          </div>
        </aside>
      </div>
    </>
  );
}