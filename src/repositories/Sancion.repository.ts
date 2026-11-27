import "server-only"
import { Prisma, Sancion as FilaSancion } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Sancion } from "@/models/sancion"
import { fechaCalendario } from "@/lib/fechas"

type Db = Prisma.TransactionClient

class SancionRepository{
    async buscarPorId(id: number, db:Db = prisma): Promise<Sancion | null>{
        const  fila = await  db.sancion.findUnique({
            where: {id},
        });
        return fila ? this.aDominio(fila): null; 
    }

    async buscarPorMulta(idMulta: number, db: Db = prisma): Promise<Sancion | null> {
        const fila = await db.sancion.findUnique({ where: { idMulta } });
        return fila ? this.aDominio(fila) : null;
    }

    async listarPorCliente(idCliente: number, db: Db = prisma): Promise<Sancion[]> {
        const filas = await db.sancion.findMany({
            where: { idCliente },
            orderBy: [{ fechaInicio: "desc" }, { id: "desc" }],
        });
        return filas.map((f) => this.aDominio(f));
    }


    async listarVigentesPorCliente(
        idCliente: number,
        hoy: Date = new Date(),
        db: Db = prisma,
    ): Promise<Sancion[]> {
        const filas = await db.sancion.findMany({
            where: { idCliente, fechaLevantada: null, fechaFin: { gte: fechaCalendario(hoy) } },
            orderBy: { fechaFin: "desc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async listarVigentes(hoy: Date = new Date(), db: Db = prisma): Promise<Sancion[]> {
        const filas = await db.sancion.findMany({
            where: { fechaLevantada: null, fechaFin: { gte: fechaCalendario(hoy) } },
            orderBy: { fechaFin: "asc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async guardar(sancion: Sancion, db: Db = prisma): Promise<Sancion>{
        if(sancion.id === null){
            const fila = await db.sancion.create({
                data: {
                    idCliente: sancion.idCliente,
                    idMulta: sancion.idMulta,
                    idUsuarioAplica: sancion.idUsuarioAplica,
                    motivo: sancion.motivo,
                    fechaInicio: sancion.fechaInicio,
                    fechaFin: sancion.fechaFin,
                },
            });
            return this.aDominio(fila);
        }
        const fila = await db.sancion.update({
            where: {id: sancion.id},
            data: {fechaLevantada: sancion.fechaLevantada},
        });
        return this.aDominio(fila);
    }

    aDominio(fila:FilaSancion): Sancion{
        return Sancion.reconstruir({
            id: fila.id,
            idCliente: fila.idCliente,
            idMulta: fila.idMulta,
            idUsuarioAplica: fila.idUsuarioAplica,
            motivo: fila.motivo,
            fechaInicio: fila.fechaInicio,
            fechaFin: fila.fechaFin,
            fechaLevantada: fila.fechaLevantada,
        })
    }

}

export const sancionRepository = new SancionRepository();