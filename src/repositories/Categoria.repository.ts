import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Categoria } from "@/models/Categorias"

type Db = Prisma.TransactionClient;

function esDuplicado(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

class CategoriaRepository {
    async buscarPorId(id: number, db: Db = prisma): Promise<Categoria | null> {
        const fila = await db.categoria.findUnique({ where: { id } });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorNombre(nombre: string, db: Db = prisma): Promise<Categoria | null> {
        const fila = await db.categoria.findUnique({ where: { nombre: nombre.trim() } });
        return fila ? this.aDominio(fila) : null;
    }

    async listar(texto?: string, db: Db = prisma): Promise<Categoria[]> {
        const filas = await db.categoria.findMany({
            where: texto?.trim()
                ? { nombre: { contains: texto.trim(), mode: "insensitive" } }
                : undefined,
            orderBy: { nombre: "asc" },
        });
        return filas.map((f) => this.aDominio(f));
    }

    async guardar(categoria: Categoria, db: Db = prisma): Promise<Categoria> {
        const datos = { nombre: categoria.nombre.trim(), descripcion: categoria.descripcion };
        try {
            const fila = categoria.id === null
                ? await db.categoria.create({ data: datos })
                : await db.categoria.update({ where: { id: categoria.id }, data: datos });
            return this.aDominio(fila);
        } catch (error) {
            if (esDuplicado(error)) throw new Error("Ya existe una categoria con ese nombre");
            throw error;
        }
    }

    async eliminar(id: number, db: Db = prisma): Promise<void> {
        const enUso = await db.libro.count({ where: { idCategoria: id } });
        if (enUso > 0) {
            throw new Error("No se puede eliminar una categoria con libros asociados");
        }
        await db.categoria.delete({ where: { id } });
    }

    private aDominio(fila: { id: number; nombre: string; descripcion: string | null }): Categoria {
        return new Categoria(fila.id, fila.nombre, fila.descripcion);
    }
}

export const categoriaRepository = new CategoriaRepository();