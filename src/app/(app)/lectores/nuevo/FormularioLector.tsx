"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { tiposDocumento } from "@/lib/documentos";
import { crearLector, type CampoLector, type DatosLector } from "../actions";

const VACIO: DatosLector = {
  nombres: "",
  apellidos: "",
  tipoDocumento: "",
  identificacion: "",
  email: "",
  telefono: "",
  direccion: "",
};

type ErrorForm = { mensaje: string; campo?: CampoLector };

export default function FormularioLector() {
  const router = useRouter();
  const [datos, setDatos] = useState<DatosLector>(VACIO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorForm | null>(null);

  function cambiar(campo: CampoLector) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDatos((d) => ({ ...d, [campo]: e.target.value }));
    };
  }

  // El error de un campo se muestra bajo ese campo; los demás, en el aviso superior.
  function errorDe(campo: CampoLector): string | undefined {
    return error?.campo === campo ? error.mensaje : undefined;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await crearLector(datos);
      if (!result.ok) {
        setError({ mensaje: result.error, campo: result.campo });
        return;
      }
      router.push(`/lectores?creado=${result.credencial}`);
      router.refresh();
    } catch {
      setError({ mensaje: "Ocurrió un error inesperado al registrar el lector." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[#DDE4E0] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 border-b border-[#DDE4E0] pb-5">
        <h2 className="font-display text-xl font-normal text-[#1B2D27]">Información requerida</h2>
        <p className="mt-1 text-sm text-[#7A8B85]">
          El personal bibliotecario crea y administra todas las cuentas de lectores.
        </p>
      </div>

      {error && !error.campo && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {error.mensaje}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="nombres"
          label="Nombres"
          placeholder="Nombres del lector"
          autoComplete="off"
          maxLength={80}
          required
          value={datos.nombres}
          onChange={cambiar("nombres")}
          error={errorDe("nombres")}
        />
        <Input
          id="apellidos"
          label="Apellidos"
          placeholder="Apellidos del lector"
          autoComplete="off"
          maxLength={80}
          required
          value={datos.apellidos}
          onChange={cambiar("apellidos")}
          error={errorDe("apellidos")}
        />

        <Select
          id="tipoDocumento"
          label="Tipo de documento"
          required
          opciones={tiposDocumento.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))}
          value={datos.tipoDocumento}
          onChange={cambiar("tipoDocumento")}
          error={errorDe("tipoDocumento")}
        />
        <Input
          id="identificacion"
          label="Número de documento"
          placeholder="Número de identificación"
          autoComplete="off"
          maxLength={30}
          required
          value={datos.identificacion}
          onChange={cambiar("identificacion")}
          error={errorDe("identificacion")}
        />

        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          placeholder="lector@correo.com"
          autoComplete="off"
          maxLength={120}
          required
          value={datos.email}
          onChange={cambiar("email")}
          error={errorDe("email")}
        />
        <Input
          id="telefono"
          label="Teléfono"
          type="tel"
          placeholder="Teléfono de contacto"
          autoComplete="off"
          maxLength={20}
          value={datos.telefono}
          onChange={cambiar("telefono")}
          error={errorDe("telefono")}
        />

        <div className="sm:col-span-2">
          <Input
            id="direccion"
            label="Dirección de residencia"
            placeholder="Dirección completa"
            autoComplete="off"
            maxLength={200}
            value={datos.direccion}
            onChange={cambiar("direccion")}
            error={errorDe("direccion")}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#DDE4E0] pt-5">
        <Button href="/lectores" variant="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading} leftIcon={<Check size={16} />}>
          Registrar lector
        </Button>
      </div>
    </form>
  );
}