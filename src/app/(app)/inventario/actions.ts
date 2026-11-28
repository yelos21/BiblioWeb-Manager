"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermiso } from "@/lib/session";
import { registrarAuditoria } from "@/lib/Auditoria";
import { ubicaciones } from "@/lib/ubicaciones";
import { Autor } from "@/models/Autor";
import { Editorial } from "@/models/Editorial";
import { Libro } from "@/models/Libro";
import { autorRepository } from "@/repositories/Autor.respository";
import { categoriaRepository } from "@/repositories/Categoria.repository";
import { editorialRepository } from "@/repositories/Editorial.repository";
import { libroRepository } from "@/repositories/Libro.repository";

export type DatosFormularioLibro = {
  isbn: string;
  titulo: string;

  autores: string;
  editorial: string;
  anioPublicacion: string;
  idCategoria: string;
  ubicacion: string;
  copias: string;
};

export type CampoLibro = keyof DatosFormularioLibro;

export type CrearLibroResult =
  | { ok: true; id: number; ejemplares: number }
  | { ok: false; error: string; campo?: CampoLibro };

  
  
const MAX = { titulo: 200, autor: 120, editorial: 100 } as const;
const MAX_AUTORES = 10;
const MAX_COPIAS = 50;

type Validado =
  | {
      ok: true;
      datos: {
        isbn: string;
        titulo: string;
        autores: string[];
        editorial: string;
        anioPublicacion: number | null;
        idCategoria: number;
        ubicacion: string;
        copias: number;
      };
    }
  | { ok: false; error: string; campo: CampoLibro };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function validar(input: DatosFormularioLibro): Validado {

  const isbn = texto(input?.isbn).replace(/[\s-]/g, "").toUpperCase();
  const titulo = texto(input?.titulo).replace(/\s+/g, " ");
  const editorial = texto(input?.editorial).replace(/\s+/g, " ");
  const anioTxt = texto(input?.anioPublicacion);
  const copiasTxt = texto(input?.copias);
  const idCategoria = Number(texto(input?.idCategoria));
  const ubicacion = ubicaciones.find((u) => u.valor === texto(input?.ubicacion))?.valor;

  const vistos = new Set<string>();
  const autores: string[] = [];
  for (const crudo of texto(input?.autores).split(";")) {
    const nombre = crudo.trim().replace(/\s+/g, " ");
    if (!nombre || vistos.has(nombre.toLowerCase())) continue;
    vistos.add(nombre.toLowerCase());
    autores.push(nombre);
  }

  if (!isbn) return { ok: false, campo: "isbn", error: "Ingresa el ISBN." };
  if (!/^(\d{9}[\dX]|\d{13})$/.test(isbn)) {
    return { ok: false, campo: "isbn", error: "El ISBN debe tener 10 o 13 dígitos." };
  }
  if (!titulo) return { ok: false, campo: "titulo", error: "Ingresa el título." };
  if (titulo.length > MAX.titulo) return { ok: false, campo: "titulo", error: `Máximo ${MAX.titulo} caracteres.` };
  if (autores.length === 0) return { ok: false, campo: "autores", error: "Ingresa al menos un autor." };
  if (autores.length > MAX_AUTORES) {
    return { ok: false, campo: "autores", error: `Máximo ${MAX_AUTORES} autores por libro.` };
  }
  if (autores.some((a) => a.length > MAX.autor)) {
    return { ok: false, campo: "autores", error: `Cada autor admite máximo ${MAX.autor} caracteres.` };
  }
  if (!editorial) return { ok: false, campo: "editorial", error: "Ingresa la editorial." };
  if (editorial.length > MAX.editorial) {
    return { ok: false, campo: "editorial", error: `Máximo ${MAX.editorial} caracteres.` };
  }
  if (!Number.isInteger(idCategoria) || idCategoria < 1) {
    return { ok: false, campo: "idCategoria", error: "Selecciona la categoría." };
  }

  let anioPublicacion: number | null = null;
  if (anioTxt) {
    anioPublicacion = Number(anioTxt);
    if (!/^\d{4}$/.test(anioTxt) || anioPublicacion < 1000 || anioPublicacion > new Date().getFullYear() + 1) {
      return { ok: false, campo: "anioPublicacion", error: "Ingresa un año válido de cuatro dígitos." };
    }
  }

  if (!/^\d+$/.test(copiasTxt) || Number(copiasTxt) < 1 || Number(copiasTxt) > MAX_COPIAS) {
    return { ok: false, campo: "copias", error: `Ingresa un número entre 1 y ${MAX_COPIAS}.` };
  }
  if (!ubicacion) return { ok: false, campo: "ubicacion", error: "Selecciona la ubicación." };

  return {
    ok: true,
    datos: {
      isbn,
      titulo,
      autores,
      editorial,
      anioPublicacion,
      idCategoria,
      ubicacion,
      copias: Number(copiasTxt),
    },
  };
}



export async function crearLibro(input: DatosFormularioLibro): Promise<CrearLibroResult> {

    const { usuario } = await requirePermiso("catalogo.gestionar");

  const validado = validar(input);
  if (!validado.ok) return validado;
  const d = validado.datos;

  if (await libroRepository.buscarPorIsbn(d.isbn)) {
    return { ok: false, campo: "isbn", error: "Ya existe un libro con ese ISBN." };
  }
  if (!(await categoriaRepository.buscarPorId(d.idCategoria))) {
    return { ok: false, campo: "idCategoria", error: "La categoría seleccionada no existe." };
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const editorial =
        (await editorialRepository.buscarPorNombre(d.editorial, tx)) ??
        (await editorialRepository.guardar(new Editorial(null, d.editorial), tx));
      if (editorial.id === null) throw new Error("La editorial no quedó guardada correctamente");

      const idsAutores: number[] = [];
      for (const nombre of d.autores) {
        const autor =
          (await autorRepository.buscarPorNombre(nombre, tx)) ??
          (await autorRepository.guardar(new Autor(null, nombre, null), tx));
        if (autor.id === null) throw new Error("El autor no quedó guardado correctamente");
        idsAutores.push(autor.id);
      }

      const libro = Libro.registrar(d.isbn, d.titulo, editorial.id, d.idCategoria, idsAutores, d.anioPublicacion);
      const guardado = await libroRepository.guardar(libro, tx);


      guardado.crearEjemplares(d.copias, `BWM-${String(guardado.idPersistido).padStart(5, "0")}`, d.ubicacion);
      const completo = await libroRepository.guardar(guardado, tx);

      await registrarAuditoria(
        {
          idUsuario: usuario.id,
          accion: "CREAR",
          entidad: "libro",
          idRegistro: completo.idPersistido,
          detalle: `Libro ISBN ${d.isbn}, ${d.copias} ejemplar(es)`,
        },
        tx,
      );

      return { id: completo.idPersistido, ejemplares: completo.listaEjemplares.length };
    });

    revalidatePath("/inventario");
    return { ok: true, ...resultado };
  } catch (error) {

    if (error instanceof Error && error.message.startsWith("Ya existe un libro")) {
      return { ok: false, campo: "isbn", error: "Ya existe un libro con ese ISBN." };
    }
    if (error instanceof Error && error.message.startsWith("Ya existe")) {
      return { ok: false, error: error.message };
    }
    console.error("Error al registrar el libro:", error);
    return { ok: false, error: "No se pudo registrar el libro. Inténtalo de nuevo." };
  }
}