import "server-only"
import { prisma } from "@/lib/prisma"
import  { Prisma, Ejemplar as FilaEjemplar } from "@/generated/prisma/client"
import { Ejemplar } from "@/models/Ejemplar"

type Db = Prisma.TransactionClient;

class EjemplarRepository{
    async buscarPorCodigo(codigo: string, db: Db = prisma): Promise<Ejemplar | null> {
        const fila = await db.ejemplar.findUnique({ where: { codigoInventario: codigo } });
        return fila ? this.aDominio(fila) : null;
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

    private aDominio(fila: FilaEjemplar): Ejemplar {
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