import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Editorial } from "@/models/Editorial"

type Db = Prisma.TransactionClient;

function esDuplicado(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

class EditorialRepository {
    async buscarPorId(id: number, db: Db = prisma): Promise<Editorial | null> {
        const fila = await db.editorial.findUnique({ where: { id } });
        return fila ? this.aDominio(fila) : null;
    }

    
    
    async buscarPorNombre(nombre: string, db: Db = prisma): Promise<Editorial | null> {
        const fila = await db.editorial.findFirst({
            where: { nombre: { equals: nombre.trim(), mode: "insensitive" } },
            orderBy: { id: "asc" },
        });
        return fila ? this.aDominio(fila) : null;
    }

    async listar(texto?: string, db: Db = prisma): Promise<Editorial[]> {
        const filas = await db.editorial.findMany({
            where: texto?.trim()
                ? { nombre: { contains: texto.trim(), mode: "insensitive" } }
                : undefined,
            orderBy: { nombre: "asc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async guardar(editorial: Editorial, db: Db = prisma): Promise<Editorial> {
        const datos = { nombre: editorial.nombre.trim(), pais: editorial.pais };
        try {
            const fila = editorial.id === null
                ? await db.editorial.create({ data: datos })
                : await db.editorial.update({ where: { id: editorial.id }, data: datos });
            return this.aDominio(fila);
        } catch (error) {
            if (esDuplicado(error)) throw new Error("Ya existe una editorial con ese nombre");
            throw error;
        }
    }

    async eliminar(id: number, db: Db = prisma): Promise<void> {
        const enUso = await db.libro.count({ where: { idEditorial: id } });
        if (enUso > 0) {
            throw new Error("No se puede eliminar una editorial con libros asociados");
        }
        await db.editorial.delete({ where: { id } });
    }

    private aDominio(fila: { id: number; nombre: string; pais: string | null }): Editorial {
        return new Editorial(fila.id, fila.nombre, fila.pais);
    }
}

export const editorialRepository = new EditorialRepository();