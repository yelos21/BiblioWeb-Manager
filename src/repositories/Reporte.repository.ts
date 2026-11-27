import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type { Reporte } from "@/models/Reporte"
import type { TipoReporte } from "@/models/Enums"

type Db = Prisma.TransactionClient;

const incluir = {
    usuario: { select: { nombres: true, apellidos: true } },
} satisfies Prisma.ReporteInclude;

type FilaReporte = Prisma.ReporteGetPayload<{ include: typeof incluir }>;

/**
 * Lo que se guarda de un reporte: quien lo genero, de que tipo y de que periodo.
 * Los numeros del resumen no se persisten; se vuelven a calcular con
 * ReporteOperacion / ReporteSistema.generar() cuando se necesitan.
 */
export type RegistroReporte = {
    id: number;
    tipo: TipoReporte;
    periodoInicio: Date;
    periodoFin: Date;
    idUsuario: number;
    nombreUsuario: string;
    fechaGeneracion: Date;
};

export type FiltrosReporte = {
    tipo?: TipoReporte;
    idUsuario?: number;
    desde?: Date;
    hasta?: Date;
    pagina?: number;
    porPagina?: number;
};

class ReporteRepository {
    async buscarPorId(id: number, db: Db = prisma): Promise<RegistroReporte | null> {
        const fila = await db.reporte.findUnique({ where: { id }, include: incluir });
        return fila ? this.aRegistro(fila) : null;
    }


    async guardar(reporte: Reporte, db: Db = prisma): Promise<RegistroReporte> {
        if (reporte.id !== null) {
            throw new Error("El reporte ya fue guardado");
        }
        const fila = await db.reporte.create({
            data: {
                idUsuario: reporte.idUsuario,
                tipo: reporte.tipo,
                periodoInicio: reporte.periodoInicio,
                periodoFin: reporte.periodoFin,
                fechaGeneracion: reporte.fechaGeneracion,
            },
            include: incluir,
        });
        return this.aRegistro(fila);
    }


    async listar(
        filtros: FiltrosReporte = {},
        db: Db = prisma,
    ): Promise<{ reportes: RegistroReporte[]; total: number }> {
        const where: Prisma.ReporteWhereInput = {
            tipo: filtros.tipo,
            idUsuario: filtros.idUsuario,
            fechaGeneracion: filtros.desde || filtros.hasta
                ? { gte: filtros.desde, lte: filtros.hasta }
                : undefined,
        };
        const porPagina = Math.min(Math.max(filtros.porPagina ?? 20, 1), 100);
        const pagina = Math.max(filtros.pagina ?? 1, 1);

        const filas = await db.reporte.findMany({
            where,
            include: incluir,
            orderBy: [{ fechaGeneracion: "desc" }, { id: "desc" }],
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        });
        const total = await db.reporte.count({ where });
        return { reportes: filas.map((f) => this.aRegistro(f)), total };
    }

    private aRegistro(fila: FilaReporte): RegistroReporte {
        return {
            id: fila.id,
            tipo: fila.tipo,
            periodoInicio: fila.periodoInicio,
            periodoFin: fila.periodoFin,
            idUsuario: fila.idUsuario,
            nombreUsuario: `${fila.usuario.nombres} ${fila.usuario.apellidos}`,
            fechaGeneracion: fila.fechaGeneracion,
        };
    }
}

export const reporteRepository = new ReporteRepository();