import "server-only"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { Multa } from "@/models/multa"

type Db = Prisma.TransactionClient

class MultaRepository{
    async buscarPorId(id: number, db: Db = prisma): Promise< Multa | null> {
        const fila = await db.multa.findUnique({ where: {id} });
        if (!fila) {
            return null;
        }
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
        })


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
        await db.multa.update({
            where: {id:multa.id},
            data: { estado: multa.estado, fechaPago: multa.fechaPago },
        });

        return multa;

    }


}

export const multaRepository = new MultaRepository();