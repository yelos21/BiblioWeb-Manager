import { Library } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import Button from "@/components/ui/button";
import TarjetaInfo from "@/components/ui/TarjetaInfo";
import { requirePermiso } from "@/lib/session";
import { categoriaRepository } from "@/repositories/Categoria.repository";
import FormularioLibro from "./FormularioLibro";

export const instant = false;

export default async function NuevoLibroPage() {
  await requirePermiso("catalogo.gestionar");

  const categorias = await categoriaRepository.listar();

  return (
    <>
      <EncabezadoPagina seccion="Catálogo" titulo="Registrar ejemplar en inventario" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {categorias.length === 0 ? (
          <section className="rounded-2xl border border-[#DDE4E0] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-normal text-[#1B2D27]">Faltan categorías</h2>
            <p className="mt-2 text-sm text-[#7A8B85]">
              Para registrar un libro primero debe existir al menos una categoría en el catálogo.
            </p>
            <div className="mt-6">
              <Button href="/inventario" variant="secondary">
                Volver al inventario
              </Button>
            </div>
          </section>
        ) : (
          <FormularioLibro
            categorias={categorias.map((c) => ({ valor: String(c.id), etiqueta: c.nombre }))}
          />
        )}

        <TarjetaInfo icono={<Library size={18} aria-hidden="true" />} titulo="Información importante">
          Comprueba el ISBN para evitar registros duplicados en el catálogo.
        </TarjetaInfo>
      </div>
    </>
  );
}