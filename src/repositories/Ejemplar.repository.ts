import "server-only"
import { prisma } from "@/lib/prisma"
import  { Prisma, Ejemplar as FilaEjemplar } from "@/generated/prisma/client"
import { Ejemplar } from "@/models/Ejemplar"

type Db = Prisma.TransactionClient;

function esDuplicado(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

class EjemplarRepository{
    async buscarPorId(id: number, db: Db = prisma): Promise<Ejemplar | null> {
        const fila = await db.ejemplar.findUnique({ where: { id } });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorCodigo(codigo: string, db: Db = prisma): Promise<Ejemplar | null> {
        const fila = await db.ejemplar.findUnique({ where: { codigoInventario: codigo } });
        return fila ? this.aDominio(fila) : null;
    }

    async listarPorLibro(idLibro: number, db: Db = prisma): Promise<Ejemplar[]> {
        const filas = await db.ejemplar.findMany({
            where: { idLibro },
            orderBy: { numeroCopia: "asc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async crear(ejemplar: Ejemplar, db: Db = prisma): Promise<Ejemplar> {
        if (ejemplar.id !== null) {
            throw new Error("El ejemplar ya fue guardado")
        }
        try {
            const fila = await db.ejemplar.create({
                data: {
                    idLibro: ejemplar.idLibro,
                    numeroCopia: ejemplar.numeroCopia,
                    codigoInventario: ejemplar.codigoInventario,
                    ubicacion: ejemplar.ubicacion,
                    estadoFisico: ejemplar.estadoFisico,
                    estado: ejemplar.estado,
                    fechaAdquisicion: ejemplar.fechaAdquisicion,
                    motivoBaja: ejemplar.motivoBaja,
                },
            });
            return this.aDominio(fila);
        } catch (error) {
            if (esDuplicado(error)) {
                throw new Error("Ya existe un ejemplar con ese codigo de inventario o numero de copia");
            }
            throw error;
        }
    }

    /** Crea varios ejemplares en una sola transaccion (si no recibe una, abre la suya). */
    async crearVarios(ejemplares: Ejemplar[], db: Db | typeof prisma = prisma): Promise<Ejemplar[]> {
        if ("$transaction" in db) {
            return db.$transaction((tx) => this.crearVarios(ejemplares, tx));
        }
        const creados: Ejemplar[] = [];
        for (const e of ejemplares) creados.push(await this.crear(e, db));
        return creados;
    }

    async guardar(ejemplar: Ejemplar, db: Db = prisma): Promise<void>{
        if(ejemplar.id === null) {
            throw new Error("No se puede actualizar un ejemplar sin id")
        }
        await db.ejemplar.update({
            where: {id: ejemplar.id },
            data: {
                estado: ejemplar.estado,
                estadoFisico: ejemplar.estadoFisico,
                ubicacion: ejemplar.ubicacion,
                motivoBaja: ejemplar.motivoBaja,
            }
        })
    }

    aDominio(fila: FilaEjemplar): Ejemplar {
        return Ejemplar.reconstruir({
            id: fila.id,
            idLibro: fila.idLibro,
            numeroCopia: fila.numeroCopia,
            codigoInventario: fila.codigoInventario,
            ubicacion: fila.ubicacion,
            estadoFisico: fila.estadoFisico,
            estado: fila.estado,
            fechaAdquisicion: fila.fechaAdquisicion,
            motivoBaja: fila.motivoBaja,
        });
    }
}

export const ejemplarRepository = new EjemplarRepository();