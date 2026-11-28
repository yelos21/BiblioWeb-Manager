"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { ubicaciones } from "@/lib/ubicaciones";
import { crearLibro, type CampoLibro, type DatosFormularioLibro } from "../actions";

const VACIO: DatosFormularioLibro = {
  isbn: "",
  titulo: "",
  autores: "",
  editorial: "",
  anioPublicacion: "",
  idCategoria: "",
  ubicacion: "",
  copias: "1",
};

type ErrorForm = { mensaje: string; campo?: CampoLibro };

type Props = {
  categorias: { valor: string; etiqueta: string }[];
};

export default function FormularioLibro({ categorias }: Props) {
  const router = useRouter();
  const [datos, setDatos] = useState<DatosFormularioLibro>(VACIO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorForm | null>(null);

  function cambiar(campo: CampoLibro) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDatos((d) => ({ ...d, [campo]: e.target.value }));
    };
  }


  function errorDe(campo: CampoLibro): string | undefined {
    return error?.campo === campo ? error.mensaje : undefined;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await crearLibro(datos);
      if (!result.ok) {
        setError({ mensaje: result.error, campo: result.campo });
        return;
      }
      router.push(`/inventario?creado=${result.ejemplares}`);
      router.refresh();
    } catch {
      setError({ mensaje: "Ocurrió un error inesperado al registrar el libro." });
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
          Añade un nuevo libro y sus copias físicas al catálogo de la biblioteca.
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
          id="isbn"
          label="ISBN"
          placeholder="978-..."
          autoComplete="off"
          maxLength={20}
          required
          value={datos.isbn}
          onChange={cambiar("isbn")}
          error={errorDe("isbn")}
        />
        <Input
          id="titulo"
          label="Título"
          placeholder="Título del libro"
          autoComplete="off"
          maxLength={200}
          required
          value={datos.titulo}
          onChange={cambiar("titulo")}
          error={errorDe("titulo")}
        />

        <Input
          id="autores"
          label="Autor"
          placeholder="Nombre del autor"
          hint="Para varios autores, sepáralos con punto y coma (;)."
          autoComplete="off"
          required
          value={datos.autores}
          onChange={cambiar("autores")}
          error={errorDe("autores")}
        />
        <Input
          id="editorial"
          label="Editorial"
          placeholder="Editorial"
          autoComplete="off"
          maxLength={100}
          required
          value={datos.editorial}
          onChange={cambiar("editorial")}
          error={errorDe("editorial")}
        />

        <Select
          id="idCategoria"
          label="Categoría"
          placeholder="Seleccionar"
          required
          opciones={categorias}
          value={datos.idCategoria}
          onChange={cambiar("idCategoria")}
          error={errorDe("idCategoria")}
        />
        <Input
          id="anioPublicacion"
          label="Año de publicación"
          placeholder={String(new Date().getFullYear())}
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={datos.anioPublicacion}
          onChange={cambiar("anioPublicacion")}
          error={errorDe("anioPublicacion")}
        />

        <Input
          id="copias"
          label="Número de ejemplares"
          placeholder="1"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          required
          value={datos.copias}
          onChange={cambiar("copias")}
          error={errorDe("copias")}
        />
        <Select
          id="ubicacion"
          label="Ubicación"
          placeholder="Seleccionar"
          required
          opciones={ubicaciones.map((u) => ({ valor: u.valor, etiqueta: u.etiqueta }))}
          value={datos.ubicacion}
          onChange={cambiar("ubicacion")}
          error={errorDe("ubicacion")}
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#DDE4E0] pt-5">
        <Button href="/inventario" variant="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading} leftIcon={<Check size={16} />}>
          Guardar en inventario
        </Button>
      </div>
    </form>
  );
}