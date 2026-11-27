import "server-only"
import { Devolucion } from "@/models/Devolucion"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Prestamo } from "@/models/prestamo"

type Db = Prisma.TransactionClient;

class DevolucionRepository{

    async guardar(devolucion: Devolucion, prestamo: Prestamo, db: Db = prisma): Promise< Devolucion>{
        const fila = await db.devolucion.create({
            data: {
                    idPrestamo: devolucion.idPrestamo,
                    idUsuarioRecibe: devolucion.idUsuarioRecibe,
                    fecha: devolucion.fecha,
                    estadoFisicoAlRecibir: devolucion.estadoFisicoAlRecibir,
                    estadoEjemplarResultante: devolucion.estadoEjemplarResultante,
                    observaciones: devolucion.observaciones,
            }
        });
        return Devolucion.reconstruir({
            id: fila.id,
            idPrestamo: fila.idPrestamo,
            idUsuarioRecibe: fila.idUsuarioRecibe,
            fecha: fila.fecha,
            estadoFisicoAlRecibir: fila.estadoFisicoAlRecibir,
            estadoEjemplarResultante: fila.estadoEjemplarResultante,
            observaciones: fila.observaciones
        },
        prestamo,
    );
        
    }

}

export const devolucionRepository = new DevolucionRepository();