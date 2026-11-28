import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Autor } from "@/models/Autor"

type Db = Prisma.TransactionClient;

class AutorRepository {
    async buscarPorId(id: number, db: Db = prisma): Promise<Autor | null> {
        const fila = await db.autor.findUnique({ where: { id } });
        return fila ? this.aDominio(fila) : null;
    }

    
    async buscarPorNombre(nombre: string, db: Db = prisma): Promise<Autor | null> {
        const fila = await db.autor.findFirst({
            where: { nombre: { equals: nombre.trim(), mode: "insensitive" } },
            orderBy: { id: "asc" },
        });
        return fila ? this.aDominio(fila) : null;
    }

    async listar(texto?: string, db: Db = prisma): Promise<Autor[]> {
        const filas = await db.autor.findMany({
            where: texto?.trim()
                ? { nombre: { contains: texto.trim(), mode: "insensitive" } }
                : undefined,
            orderBy: { nombre: "asc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async guardar(autor: Autor, db: Db = prisma): Promise<Autor> {
        const datos = { nombre: autor.nombre.trim(), nacionalidad: autor.nacionalidad };
        const fila = autor.id === null
            ? await db.autor.create({ data: datos })
            : await db.autor.update({ where: { id: autor.id }, data: datos });
        return this.aDominio(fila);
    }

    async eliminar(id: number, db: Db = prisma): Promise<void> {
        const enUso = await db.libroAutor.count({ where: { idAutor: id } });
        if (enUso > 0) {
            throw new Error("No se puede eliminar un autor con libros asociados");
        }
        await db.autor.delete({ where: { id } });
    }

    private aDominio(fila: { id: number; nombre: string; nacionalidad: string | null }): Autor {
        return new Autor(fila.id, fila.nombre, fila.nacionalidad);
    }
}

export const autorRepository = new AutorRepository();