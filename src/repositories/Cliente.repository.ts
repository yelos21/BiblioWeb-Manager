import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Cliente } from "@/models/Cliente"
import { sancionRepository } from "@/repositories/Sancion.repository"
import { prestamoRepository } from "@/repositories/prestamo.repository"
import { multaRepository } from "@/repositories/Multa.repository"

type Db = Prisma.TransactionClient;

/**
 * Cada Cliente sale con lo que necesitan estado, puedePedirPrestado() y tieneMultasPendientes():
 * todas sus sanciones, solo sus prestamos abiertos y solo sus multas pendientes.
 * Para el historial completo usa prestamoRepository.listarPorCliente y multaRepository.listarPorCliente.
 */
const incluir = {
    sanciones: { orderBy: [{ fechaInicio: "desc" }, { id: "desc" }] },
    prestamos: { where: { fechaDevolucion: null } },
    multas: { where: { estado: "PENDIENTE" } },
} satisfies Prisma.ClienteInclude;

type FilaCliente = Prisma.ClienteGetPayload<{ include: typeof incluir }>;

export type FiltrosCliente = {
    texto?: string;
    pagina?: number;
    porPagina?: number;
};

function esDuplicado(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

class ClienteRepository {
    async buscarPorId(id: number, db: Db = prisma): Promise<Cliente | null> {
        const fila = await db.cliente.findUnique({ where: { id }, include: incluir });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorCredencial(credencial: number, db: Db = prisma): Promise<Cliente | null> {
        const fila = await db.cliente.findUnique({ where: { credencial }, include: incluir });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorDocumento(
        tipoDocumento: Cliente["tipoDocumento"],
        identificacion: string,
        db: Db = prisma,
    ): Promise<Cliente | null> {
        const fila = await db.cliente.findUnique({
            where: {
                tipoDocumento_identificacion: {
                    tipoDocumento,
                    identificacion: identificacion.trim(),
                },
            },
            include: incluir,
        });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorEmail(email: string, db: Db = prisma): Promise<Cliente | null> {
        const fila = await db.cliente.findUnique({
            where: { email: email.trim().toLowerCase() },
            include: incluir,
        });
        return fila ? this.aDominio(fila) : null;
    }

    async listar(
        filtros: FiltrosCliente = {},
        db: Db = prisma,
    ): Promise<{ clientes: Cliente[]; total: number }> {
        const texto = filtros.texto?.trim();
        const credencial = texto && /^\d{1,9}$/.test(texto) ? Number(texto) : null;

        const where: Prisma.ClienteWhereInput = texto
            ? {
                OR: [
                    { nombres: { contains: texto, mode: "insensitive" } },
                    { apellidos: { contains: texto, mode: "insensitive" } },
                    { identificacion: { contains: texto, mode: "insensitive" } },
                    { email: { contains: texto, mode: "insensitive" } },
                    ...(credencial !== null ? [{ credencial }] : []),
                ],
            }
            : {};

        const porPagina = Math.min(Math.max(filtros.porPagina ?? 20, 1), 100);
        const pagina = Math.max(filtros.pagina ?? 1, 1);

        const filas = await db.cliente.findMany({
            where,
            include: incluir,
            orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        });
        const total = await db.cliente.count({ where });
        return { clientes: filas.map((f) => this.aDominio(f)), total };
    }

    /** Crea (la credencial la asigna la base de datos) o actualiza los datos personales. */
    async guardar(cliente: Cliente, db: Db = prisma): Promise<Cliente> {
        const d = cliente.aDatos();
        const datos = {
            nombres: d.nombres,
            apellidos: d.apellidos,
            tipoDocumento: d.tipoDocumento,
            identificacion: d.identificacion,
            email: d.email,
            telefono: d.telefono,
            direccion: d.direccion,
        };

        let id: number;
        try {
            if (d.id === null) {
                const fila = await db.cliente.create({
                    data: { ...datos, idUsuarioRegistro: d.idUsuarioRegistro },
                });
                id = fila.id;
            } else {
                await db.cliente.update({ where: { id: d.id }, data: datos });
                id = d.id;
            }
        } catch (error) {
            if (esDuplicado(error)) {
                throw new Error("Ya existe un cliente con ese correo o ese documento");
            }
            throw error;
        }

        const guardado = await this.buscarPorId(id, db);
        if (!guardado) throw new Error("No se pudo recuperar el cliente guardado");
        return guardado;
    }

    private aDominio(fila: FilaCliente): Cliente {
        return Cliente.reconstruir(
            {
                id: fila.id,
                credencial: fila.credencial,
                nombres: fila.nombres,
                apellidos: fila.apellidos,
                tipoDocumento: fila.tipoDocumento,
                identificacion: fila.identificacion,
                email: fila.email,
                telefono: fila.telefono,
                direccion: fila.direccion,
                fechaRegistro: fila.fechaRegistro,
                idUsuarioRegistro: fila.idUsuarioRegistro,
            },
            fila.sanciones.map((s) => sancionRepository.aDominio(s)),
            fila.prestamos.map((p) => prestamoRepository.aDominio(p)),
            fila.multas.map((m) => multaRepository.aDominio(m)),
        );
    }
}

export const clienteRepository = new ClienteRepository();