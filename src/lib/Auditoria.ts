import "server-only"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { Auditoria } from "@/models/Auditoria"
import { auditoriaRepository } from "@/repositories/Auditoria.repository"

type Db = Prisma.TransactionClient;

export type EntradaAuditoria = {
    idUsuario: number;
    accion: string;
    entidad: string;
    idRegistro?: number | null;
    detalle?: string | null;
};

/**
 * Atajo para las acciones sensibles. Pasa `tx` para que el registro quede
 * dentro de la misma transaccion que la operacion auditada.
 */
export async function registrarAuditoria(input: EntradaAuditoria, db: Db = prisma): Promise<void> {
    const auditoria = Auditoria.registrar(
        input.idUsuario,
        input.accion,
        input.entidad,
        input.idRegistro ?? null,
        input.detalle ?? null,
    );
    await auditoriaRepository.registrar(auditoria, db);
}