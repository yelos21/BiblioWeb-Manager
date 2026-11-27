import "server-only"
import { prisma } from "@/lib/prisma"
import { Prisma, Multa as FilaMulta } from "@/generated/prisma/client"
import { Multa } from "@/models/multa"
import type { EstadoMulta } from "@/models/Enums"

type Db = Prisma.TransactionClient

export type FiltrosMulta = {
    estado?: EstadoMulta;
    idCliente?: number;
    pagina?: number;
    porPagina?: number;
};

class MultaRepository{
    async buscarPorId(id: number, db: Db = prisma): Promise< Multa | null> {
        const fila = await db.multa.findUnique({ where: {id} });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorDevolucion(idDevolucion: number, db: Db = prisma): Promise<Multa | null> {
        const fila = await db.multa.findUnique({ where: { idDevolucion } });
        return fila ? this.aDominio(fila) : null;
    }

    async listarPorCliente(
        idCliente: number,
        opciones: { estado?: EstadoMulta } = {},
        db: Db = prisma,
    ): Promise<Multa[]> {
        const filas = await db.multa.findMany({
            where: { idCliente, estado: opciones.estado },
            orderBy: [{ fechaGeneracion: "desc" }, { id: "desc" }],
        });
        return filas.map((f) => this.aDominio(f));
    }

    async contarPendientesPorCliente(idCliente: number, db: Db = prisma): Promise<number> {
        return db.multa.count({ where: { idCliente, estado: "PENDIENTE" } });
    }

    async totalPendientePorCliente(idCliente: number, db: Db = prisma): Promise<number> {
        const r = await db.multa.aggregate({
            _sum: { monto: true },
            where: { idCliente, estado: "PENDIENTE" },
        });
        return r._sum.monto?.toNumber() ?? 0;
    }

    async listar(
        filtros: FiltrosMulta = {},
        db: Db = prisma,
    ): Promise<{ multas: Multa[]; total: number }> {
        const where: Prisma.MultaWhereInput = {
            estado: filtros.estado,
            idCliente: filtros.idCliente,
        };
        const porPagina = Math.min(Math.max(filtros.porPagina ?? 20, 1), 100);
        const pagina = Math.max(filtros.pagina ?? 1, 1);

        const filas = await db.multa.findMany({
            where,
            orderBy: [{ fechaGeneracion: "desc" }, { id: "desc" }],
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        });
        const total = await db.multa.count({ where });
        return { multas: filas.map((f) => this.aDominio(f)), total };
    }

    async guardar(multa: Multa, db: Db = prisma): Promise<Multa> {
        if(multa.id === null){
            const fila = await db.multa.create({
            data: {
                idDevolucion: multa.idDevolucion,
                idCliente: multa.idCliente,
                idUsuarioCalcula: multa.idUsuarioCalcula,
                concepto: multa.concepto,
                diasRetraso: multa.diasRetraso,
                monto: multa.monto,
                estado: multa.estado,
                fechaGeneracion: multa.fechaGeneracion,
        },
      });

        return this.aDominio(fila);

        }
        await db.multa.update({
            where: {id:multa.id},
            data: { estado: multa.estado, fechaPago: multa.fechaPago },
        });

        return multa;

    }

    aDominio(fila: FilaMulta): Multa {
        return Multa.reconstruir({
            id: fila.id,
            idDevolucion: fila.idDevolucion,
            idUsuarioCalcula: fila.idUsuarioCalcula,
            idCliente: fila.idCliente,
            concepto: fila.concepto,
            diasRetraso: fila.diasRetraso,
            monto: fila.monto.toNumber(),
            estado: fila.estado,
            fechaGeneracion: fila.fechaGeneracion,
            fechaPago: fila.fechaPago,
        });
    }

}

export const multaRepository = new MultaRepository();