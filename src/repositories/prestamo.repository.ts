import "server-only"
import {prisma} from "@/lib/prisma"
import type {Prisma, Prestamo as FilaPrestamo} from "@/generated/prisma/client"
import { Prestamo } from "@/models/prestamo"
import type { EstadoPrestamo } from "@/models/Enums"
import { fechaCalendario } from "@/lib/fechas"

type Db = Prisma.TransactionClient;

export type FiltrosPrestamo = {
    estado?: EstadoPrestamo;
    idCliente?: number;
    idEjemplar?: number;
    desde?: Date;
    hasta?: Date;
    pagina?: number;
    porPagina?: number;
};

class PrestamoRepository {
    async buscarPorId(id: number, db:Db = prisma):   Promise<Prestamo | null >{
        const fila =  await db.prestamo.findFirst({where: {id}});
        return fila ? this.aDominio(fila): null;
    }

    async buscarAbiertoPorEjemplar(idEjemplar: number, db: Db = prisma):  Promise<Prestamo | null >{
        const fila = await db.prestamo.findFirst({where: {idEjemplar, fechaDevolucion: null} });
         return fila ? this.aDominio(fila): null;
    }
    async listarVencidos(hoy: Date = new Date(), db: Db = prisma): Promise<Prestamo[]> {
        const filas = await db.prestamo.findMany({
        where: { fechaDevolucion: null, fechaVencimiento: { lt: fechaCalendario(hoy) } },
        orderBy: { fechaVencimiento: "asc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async listarPorCliente(
        idCliente: number,
        opciones: { soloAbiertos?: boolean } = {},
        db: Db = prisma,
    ): Promise<Prestamo[]> {
        const filas = await db.prestamo.findMany({
            where: { idCliente, fechaDevolucion: opciones.soloAbiertos ? null : undefined },
            orderBy: [{ fechaPrestamo: "desc" }, { id: "desc" }],
        });
        return filas.map((f) => this.aDominio(f));
    }

    async contarAbiertosPorCliente(idCliente: number, db: Db = prisma): Promise<number> {
        return db.prestamo.count({ where: { idCliente, fechaDevolucion: null } });
    }


    async listarPorEjemplar(idEjemplar: number, db: Db = prisma): Promise<Prestamo[]> {
        const filas = await db.prestamo.findMany({
            where: { idEjemplar },
            orderBy: [{ fechaPrestamo: "desc" }, { id: "desc" }],
        });
        return filas.map((f) => this.aDominio(f));
    }

    async listar(
        filtros: FiltrosPrestamo = {},
        db: Db = prisma,
    ): Promise<{ prestamos: Prestamo[]; total: number }> {
        const hoy = fechaCalendario(new Date());
        const porEstado: Prisma.PrestamoWhereInput =
            filtros.estado === "ACTIVO" ? { fechaDevolucion: null, fechaVencimiento: { gte: hoy } }
            : filtros.estado === "VENCIDO" ? { fechaDevolucion: null, fechaVencimiento: { lt: hoy } }
            : filtros.estado === "DEVUELTO" ? { fechaDevolucion: { not: null } }
            : {};

        const where: Prisma.PrestamoWhereInput = {
            ...porEstado,
            idCliente: filtros.idCliente,
            idEjemplar: filtros.idEjemplar,
            fechaPrestamo: filtros.desde || filtros.hasta
                ? { gte: filtros.desde, lte: filtros.hasta }
                : undefined,
        };

        const porPagina = Math.min(Math.max(filtros.porPagina ?? 20, 1), 100);
        const pagina = Math.max(filtros.pagina ?? 1, 1);

        const filas = await db.prestamo.findMany({
            where,
            orderBy: [{ fechaPrestamo: "desc" }, { id: "desc" }],
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        });
        const total = await db.prestamo.count({ where });
        return { prestamos: filas.map((f) => this.aDominio(f)), total };
    }

    async guardar(prestamo: Prestamo, db: Db = prisma): Promise<Prestamo | null>{
        if(prestamo.id !== null){
            throw Error("Un prestamo existente se cierra guardando su Devolucion");
        }

        const fila = await db.prestamo.create({data:{
            idCliente: prestamo.idCliente,
            idEjemplar: prestamo.idEjemplar,
            idUsuarioRegistra: prestamo.idUsuarioRegistra,
            idRegla: prestamo.idRegla,
            diasPrestamo: prestamo.diasPrestamo,
            observaciones: prestamo.observaciones,
            fechaPrestamo: prestamo.fechaPrestamo,
            fechaVencimiento: prestamo.fechaVencimiento,
        },
        });
        return this.aDominio(fila);
    }

    aDominio(fila: FilaPrestamo): Prestamo {
        return Prestamo.reconstruir({
            id: fila.id,
            idCliente: fila.idCliente,
            idEjemplar: fila.idEjemplar,
            idUsuarioRegistra: fila.idUsuarioRegistra,
            idRegla: fila.idRegla,
            diasPrestamo: fila.diasPrestamo,
            observaciones: fila.observaciones,
            fechaPrestamo: fila.fechaPrestamo,
            fechaVencimiento: fila.fechaVencimiento,
            fechaDevolucion: fila.fechaDevolucion,
        });
    }


}

export const prestamoRepository = new PrestamoRepository();