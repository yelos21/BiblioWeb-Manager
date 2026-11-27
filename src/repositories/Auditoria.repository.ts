import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Auditoria } from "@/models/Auditoria"

type Db = Prisma.TransactionClient;

const incluir = {
    usuario: { select: { nombres: true, apellidos: true } },
} satisfies Prisma.AuditoriaInclude;

type FilaAuditoria = Prisma.AuditoriaGetPayload<{ include: typeof incluir }>;

/** Una accion junto con el nombre de quien la hizo, para pintar listados. */
export type AuditoriaConUsuario = {
    auditoria: Auditoria;
    nombreUsuario: string;
};

export type FiltrosAuditoria = {
    idUsuario?: number;
    accion?: string;
    entidad?: string;
    idRegistro?: number;
    desde?: Date;
    hasta?: Date;
    pagina?: number;
    porPagina?: number;
};

class AuditoriaRepository {
    /** Guarda una auditoria nueva. La bitacora es de solo lectura: no hay actualizar ni eliminar. */
    async registrar(auditoria: Auditoria, db: Db = prisma): Promise<Auditoria> {
        if (auditoria.id !== null) {
            throw new Error("La auditoria ya fue registrada");
        }
        const fila = await db.auditoria.create({
            data: {
                idUsuario: auditoria.idUsuario,
                accion: auditoria.accion,
                entidad: auditoria.entidad,
                idRegistro: auditoria.idRegistro,
                fechaHora: auditoria.fechaHora,
                detalle: auditoria.detalle,
            },
            include: incluir,
        });
        return this.aDominio(fila);
    }

    async listar(
        filtros: FiltrosAuditoria = {},
        db: Db = prisma,
    ): Promise<{ registros: AuditoriaConUsuario[]; total: number }> {
        const where: Prisma.AuditoriaWhereInput = {
            idUsuario: filtros.idUsuario,
            accion: filtros.accion,
            entidad: filtros.entidad,
            idRegistro: filtros.idRegistro,
            fechaHora: filtros.desde || filtros.hasta
                ? { gte: filtros.desde, lte: filtros.hasta }
                : undefined,
        };
        const porPagina = Math.min(Math.max(filtros.porPagina ?? 20, 1), 100);
        const pagina = Math.max(filtros.pagina ?? 1, 1);

        const filas = await db.auditoria.findMany({
            where,
            include: incluir,
            orderBy: [{ fechaHora: "desc" }, { id: "desc" }],
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        });
        const total = await db.auditoria.count({ where });
        return { registros: filas.map((f) => this.aConUsuario(f)), total };
    }

    /** Historial de un registro concreto (por ejemplo, todo lo que paso con un prestamo). */
    async listarPorRegistro(
        entidad: string,
        idRegistro: number,
        db: Db = prisma,
    ): Promise<AuditoriaConUsuario[]> {
        const filas = await db.auditoria.findMany({
            where: { entidad, idRegistro },
            include: incluir,
            orderBy: [{ fechaHora: "asc" }, { id: "asc" }],
        });
        return filas.map((f) => this.aConUsuario(f));
    }

    /** `id` es BigInt en la base; se pasa a number para poder serializarlo a JSON. */
    private aDominio(fila: FilaAuditoria): Auditoria {
        return Auditoria.reconstruir({
            id: Number(fila.id),
            idUsuario: fila.idUsuario,
            accion: fila.accion,
            entidad: fila.entidad,
            idRegistro: fila.idRegistro,
            fechaHora: fila.fechaHora,
            detalle: fila.detalle,
        });
    }

    private aConUsuario(fila: FilaAuditoria): AuditoriaConUsuario {
        return {
            auditoria: this.aDominio(fila),
            nombreUsuario: `${fila.usuario.nombres} ${fila.usuario.apellidos}`,
        };
    }
}

export const auditoriaRepository = new AuditoriaRepository();