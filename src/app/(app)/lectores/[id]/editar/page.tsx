import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import TarjetaInfo from "@/components/ui/TarjetaInfo";
import { requirePermiso } from "@/lib/session";
import { clienteRepository } from "@/repositories/Cliente.repository";
import type { DatosLector } from "../../actions";
import FormularioLector from "../../FormularioLector";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export default async function EditarLectorPage({ params }: Props) {
  await requirePermiso("lectores.gestionar");

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) notFound();

  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) notFound();

  const d = cliente.aDatos();
  const inicial: DatosLector = {
    nombres: d.nombres,
    apellidos: d.apellidos,
    tipoDocumento: d.tipoDocumento,
    identificacion: d.identificacion,
    email: d.email,
    telefono: d.telefono ?? "",
    direccion: d.direccion ?? "",
  };

  return (
    <>
      <EncabezadoPagina seccion="Gestión de lectores" titulo={`Editar a ${cliente.nombre}`} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <FormularioLector lectorId={id} inicial={inicial} />

        <TarjetaInfo icono={<Pencil size={18} aria-hidden="true" />} titulo="Información importante">
          La credencial del lector no cambia. Cada modificación queda registrada en la bitácora de auditoría.
        </TarjetaInfo>
      </div>
    </>
  );
}