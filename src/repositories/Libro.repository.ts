import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Libro } from "@/models/Libro"
import { Autor } from "@/models/Autor"
import { ejemplarRepository } from "@/repositories/Ejemplar.repository"

type Db = Prisma.TransactionClient;

const incluir = {
    autores: true,
    ejemplares: { orderBy: { numeroCopia: "asc" } },
} satisfies Prisma.LibroInclude;

type FilaLibro = Prisma.LibroGetPayload<{ include: typeof incluir }>;

export type FiltrosLibro = {
    texto?: string;
    idCategoria?: number;
    idEditorial?: number;
    idAutor?: number;
    soloDisponibles?: boolean;
    pagina?: number;
    porPagina?: number;
};

function codigoPrisma(error: unknown): string | null {
    return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;
}

class LibroRepository {

    async buscarPorId(id: number, db: Db = prisma): Promise<Libro | null> {
        const fila = await db.libro.findUnique({ where: { id }, include: incluir });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorIsbn(isbn: string, db: Db = prisma): Promise<Libro | null> {
        const fila = await db.libro.findUnique({ where: { isbn: isbn.trim() }, include: incluir });
        return fila ? this.aDominio(fila) : null;
    }

    async listar(
        filtros: FiltrosLibro = {},
        db: Db = prisma,
    ): Promise<{ libros: Libro[]; total: number }> {
        const texto = filtros.texto?.trim();
        const where: Prisma.LibroWhereInput = {
            idCategoria: filtros.idCategoria,
            idEditorial: filtros.idEditorial,
            autores: filtros.idAutor ? { some: { idAutor: filtros.idAutor } } : undefined,
            ejemplares: filtros.soloDisponibles ? { some: { estado: "DISPONIBLE" } } : undefined,
            OR: texto
                ? [
                    { titulo: { contains: texto, mode: "insensitive" } },
                    { isbn: { contains: texto, mode: "insensitive" } },
                    { autores: { some: { autor: { nombre: { contains: texto, mode: "insensitive" } } } } },
                ]
                : undefined,
        };

        const porPagina = Math.min(Math.max(filtros.porPagina ?? 20, 1), 100);
        const pagina = Math.max(filtros.pagina ?? 1, 1);

        const filas = await db.libro.findMany({
            where,
            include: incluir,
            orderBy: { titulo: "asc" },
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        });
        const total = await db.libro.count({ where });
        return { libros: filas.map((f) => this.aDominio(f)), total };
    }


    async autoresDeLibros(idsLibros: number[], db: Db = prisma): Promise<Map<number, Autor[]>> {
        const mapa = new Map<number, Autor[]>();
        if (idsLibros.length === 0) return mapa;
        const filas = await db.libroAutor.findMany({
            where: { idLibro: { in: idsLibros } },
            include: { autor: true },
            orderBy: { idAutor: "asc" },
        });
        for (const f of filas) {
            const lista = mapa.get(f.idLibro) ?? [];
            lista.push(new Autor(f.autor.id, f.autor.nombre, f.autor.nacionalidad));
            mapa.set(f.idLibro, lista);
        }
        return mapa;
    }

    async guardar(libro: Libro, db: Db | typeof prisma = prisma): Promise<Libro> {
        if ("$transaction" in db) {
            return db.$transaction((tx) => this.guardarEn(libro, tx));
        }
        return this.guardarEn(libro, db);
    }

    async eliminar(id: number, db: Db = prisma): Promise<void> {
        const ejemplares = await db.ejemplar.count({ where: { idLibro: id } });
        if (ejemplares > 0) {
            throw new Error("No se puede eliminar un libro que tiene ejemplares");
        }
        await db.libro.delete({ where: { id } });
    }

    private async guardarEn(libro: Libro, db: Db): Promise<Libro> {
        const datos = {
            isbn: libro.isbn,
            titulo: libro.titulo,
            anioPublicacion: libro.anioPublicacion,
            descripcion: libro.descripcion,
            idEditorial: libro.idEditorial,
            idCategoria: libro.idCategoria,
        };

        let id: number;
        try {
            if (libro.id === null) {
                const fila = await db.libro.create({
                    data: {
                        ...datos,
                        autores: { create: libro.idsAutores.map((idAutor) => ({ idAutor })) },
                    },
                });
                id = fila.id;
            } else {
                id = libro.id;
                await db.libro.update({ where: { id }, data: datos });
                await db.libroAutor.deleteMany({ where: { idLibro: id } });
                await db.libroAutor.createMany({
                    data: libro.idsAutores.map((idAutor) => ({ idLibro: id, idAutor })),
                });
            }
        } catch (error) {
            const codigo = codigoPrisma(error);
            if (codigo === "P2002") throw new Error("Ya existe un libro con ese ISBN");
            if (codigo === "P2003") throw new Error("La editorial, la categoria o algun autor no existe");
            throw error;
        }

        const nuevos = libro.listaEjemplares.filter((e) => e.id === null);
        if (nuevos.length > 0) await ejemplarRepository.crearVarios(nuevos, db);

        const guardado = await this.buscarPorId(id, db);
        if (!guardado) throw new Error("No se pudo recuperar el libro guardado");
        return guardado;
    }

    private aDominio(fila: FilaLibro): Libro {
        return Libro.reconstruir(
            {
                id: fila.id,
                isbn: fila.isbn,
                titulo: fila.titulo,
                anioPublicacion: fila.anioPublicacion,
                descripcion: fila.descripcion,
                idEditorial: fila.idEditorial,
                idCategoria: fila.idCategoria,
                idsAutores: fila.autores.map((a) => a.idAutor).sort((a, b) => a - b),
            },
            fila.ejemplares.map((e) => ejemplarRepository.aDominio(e)),
        );
    }
}

export const libroRepository = new LibroRepository();