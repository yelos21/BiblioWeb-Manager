import "server-only"
import { ReglaPrestamo } from "@/models/ReglaPrestamo"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

type Db = Prisma.TransactionClient;

class ReglaRepository{
    async obtenerVigente(db: Db = prisma): Promise< ReglaPrestamo>{
        const fila = await db.reglaPrestamo.findFirst({
            where: {
                OR: [
                    { vigenteHasta: null },
                    { vigenteHasta: { gte: new Date() } },
                ],
            },
            orderBy: [{vigenteDesde: "desc"}, {id: "desc"}],
        });

        if (!fila){
            throw new Error("No hay regla de prestamo configurada");
        }  
            return new ReglaPrestamo(
                fila.id,
                fila.nombre,
                fila.diasPrestamo,
                fila.maxPrestamosPorCliente,
                fila.multaPorDia.toNumber(), 
                fila.diasSancionBase,           
             )
        
    }

}

export const reglaRepository = new ReglaRepository();