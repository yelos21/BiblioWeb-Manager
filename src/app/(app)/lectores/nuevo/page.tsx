import { Users } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import TarjetaInfo from "@/components/ui/TarjetaInfo";
import { requirePermiso } from "@/lib/session";
import FormularioLector from "../FormularioLector";

export const instant = false;

export default async function NuevoLectorPage() {
  await requirePermiso("lectores.gestionar");

  return (
    <>
      <EncabezadoPagina seccion="Gestión de lectores" titulo="Registrar usuario lector" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <FormularioLector />

        <TarjetaInfo icono={<Users size={18} aria-hidden="true" />} titulo="Información importante">
          Verifica la identidad y los datos de contacto del lector antes de guardar el registro.
        </TarjetaInfo>
      </div>
    </>
  );
}