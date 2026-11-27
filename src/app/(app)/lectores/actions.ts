"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermiso } from "@/lib/session";
import { registrarAuditoria } from "@/lib/Auditoria";
import { tiposDocumento } from "@/lib/documentos";
import { Cliente } from "@/models/Cliente";
import type { TipoDocumento } from "@/models/Enums";
import { clienteRepository } from "@/repositories/Cliente.repository";

export type DatosLector = {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  identificacion: string;
  email: string;
  telefono: string;
  direccion: string;
};

export type CampoLector = keyof DatosLector;

export type CrearLectorResult =
  | { ok: true; id: number; credencial: number }
  | { ok: false; error: string; campo?: CampoLector };

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Validado =
  | {
      ok: true;
      datos: {
        nombres: string;
        apellidos: string;
        tipoDocumento: TipoDocumento;
        identificacion: string;
        email: string;
        telefono: string | null;
        direccion: string | null;
      };
    }
  | { ok: false; error: string; campo: CampoLector };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

// Los límites coinciden con las columnas VarChar de la tabla cliente.
function validar(input: DatosLector): Validado {
  const nombres = texto(input?.nombres);
  const apellidos = texto(input?.apellidos);
  const identificacion = texto(input?.identificacion);
  const email = texto(input?.email);
  const telefono = texto(input?.telefono);
  const direccion = texto(input?.direccion);
  const tipo = tiposDocumento.find((t) => t.valor === texto(input?.tipoDocumento))?.valor;

  if (!nombres) return { ok: false, campo: "nombres", error: "Ingresa los nombres." };
  if (nombres.length > 80) return { ok: false, campo: "nombres", error: "Máximo 80 caracteres." };
  if (!apellidos) return { ok: false, campo: "apellidos", error: "Ingresa los apellidos." };
  if (apellidos.length > 80) return { ok: false, campo: "apellidos", error: "Máximo 80 caracteres." };
  if (!tipo) return { ok: false, campo: "tipoDocumento", error: "Selecciona el tipo de documento." };
  if (!identificacion) return { ok: false, campo: "identificacion", error: "Ingresa el número de documento." };
  if (identificacion.length > 30) return { ok: false, campo: "identificacion", error: "Máximo 30 caracteres." };
  if (!FORMATO_EMAIL.test(email)) return { ok: false, campo: "email", error: "Ingresa un correo electrónico válido." };
  if (email.length > 120) return { ok: false, campo: "email", error: "Máximo 120 caracteres." };
  if (telefono.length > 20) return { ok: false, campo: "telefono", error: "Máximo 20 caracteres." };
  if (direccion.length > 200) return { ok: false, campo: "direccion", error: "Máximo 200 caracteres." };

  return {
    ok: true,
    datos: {
      nombres,
      apellidos,
      tipoDocumento: tipo,
      identificacion,
      email,
      telefono: telefono || null,
      direccion: direccion || null,
    },
  };
}




export async function crearLector(input: DatosLector): Promise<CrearLectorResult> {

    const { usuario } = await requirePermiso("lectores.gestionar");

  const validado = validar(input);
  if (!validado.ok) return validado;
  const d = validado.datos;

  if (await clienteRepository.buscarPorDocumento(d.tipoDocumento, d.identificacion)) {
    return { ok: false, campo: "identificacion", error: "Ya existe un lector con ese documento." };
  }
  if (await clienteRepository.buscarPorEmail(d.email)) {
    return { ok: false, campo: "email", error: "Ya existe un lector con ese correo." };
  }

  try {
    const cliente = Cliente.registrar(
      d.nombres,
      d.apellidos,
      d.tipoDocumento,
      d.identificacion,
      d.email,
      usuario.id,
      d.telefono,
      d.direccion,
    );

    const guardado = await prisma.$transaction(async (tx) => {
      const g = await clienteRepository.guardar(cliente, tx);
      if (g.id === null || g.credencial === null) {
        throw new Error("El lector no quedó guardado correctamente");
      }
      await registrarAuditoria(
        {
          idUsuario: usuario.id,
          accion: "CREAR",
          entidad: "cliente",
          idRegistro: g.id,
          detalle: `Lector ${g.nombre} (credencial ${g.credencial})`,
        },
        tx,
      );
      return { id: g.id, credencial: g.credencial };
    });

    revalidatePath("/lectores");
    return { ok: true, id: guardado.id, credencial: guardado.credencial };
  } catch (error) {
    // Carrera entre dos altas simultáneas: el repositorio traduce el duplicado.
    if (error instanceof Error && error.message.startsWith("Ya existe")) {
      return { ok: false, error: error.message };
    }
    console.error("Error al registrar el lector:", error);
    return { ok: false, error: "No se pudo registrar el lector. Inténtalo de nuevo." };
  }
}