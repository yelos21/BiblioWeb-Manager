import "server-only"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Usuario } from "@/models/Usuario"
import { Rol } from "@/models/Rol"
import { Permiso } from "@/models/Permiso"

type Db = Prisma.TransactionClient;

const incluir = {
    auth: true,
    rol: { include: { permisos: { include: { permiso: true } } } },
    permisos: { include: { permiso: true } },
} satisfies Prisma.UsuarioInclude;

type FilaUsuario = Prisma.UsuarioGetPayload<{ include: typeof incluir }>;

type FiltrosUsuario = {
    idRol?: number;
    soloActivos?: boolean;
    texto?: string;
};

class UsuarioRepository {
    async buscarPorId(id: number, db: Db = prisma): Promise<Usuario | null> {
        const fila = await db.usuario.findUnique({ where: { id }, include: incluir });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorIdAuth(idAuth: string, db: Db = prisma): Promise<Usuario | null> {
        const fila = await db.usuario.findUnique({ where: { idAuth }, include: incluir });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorDocumento(
        tipoDocumento: Usuario["tipoDocumento"],
        numeroDocumento: string,
        db: Db = prisma,
    ): Promise<Usuario | null> {
        const fila = await db.usuario.findUnique({
            where: {
                tipoDocumento_numeroDocumento: {
                    tipoDocumento,
                    numeroDocumento: numeroDocumento.trim(),
                },
            },
            include: incluir,
        });
        return fila ? this.aDominio(fila) : null;
    }

    async listar(filtros: FiltrosUsuario = {}, db: Db = prisma): Promise<Usuario[]> {
        const texto = filtros.texto?.trim();
        const filas = await db.usuario.findMany({
            where: {
                idRol: filtros.idRol,
                auth: filtros.soloActivos
                    ? { OR: [{ banned: null }, { banned: false }] }
                    : undefined,
                OR: texto
                    ? [
                        { nombres: { contains: texto, mode: "insensitive" } },
                        { apellidos: { contains: texto, mode: "insensitive" } },
                        { numeroDocumento: { contains: texto, mode: "insensitive" } },
                        { auth: { email: { contains: texto, mode: "insensitive" } } },
                    ]
                    : undefined,
            },
            include: incluir,
            orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
        });
        return filas.map((f) => this.aDominio(f));
    }

    
    async guardar(usuario: Usuario, db: Db | typeof prisma = prisma): Promise<Usuario> {
        if ("$transaction" in db) {
            return db.$transaction((tx) => this.guardarEn(usuario, tx));
        }
        return this.guardarEn(usuario, db);
    }

    private async guardarEn(usuario: Usuario, db: Db): Promise<Usuario> {
        const datos = {
            idRol: usuario.idRol,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            tipoDocumento: usuario.tipoDocumento,
            numeroDocumento: usuario.numeroDocumento,
            debeCambiarPassword: usuario.debeCambiarPassword,
        };

        const idActual = usuario.idActual;
        let id: number;
        if (idActual === null) {
            const fila = await db.usuario.create({ data: { idAuth: usuario.idAuth, ...datos } });
            id = fila.id;
        } else {
            await db.usuario.update({ where: { id: idActual }, data: datos });
            id = idActual;
        }

        await db.user.update({
            where: { id: usuario.idAuth },
            data: { banned: !usuario.activo },
        });

        await db.usuarioPermiso.deleteMany({ where: { idUsuario: id } });
        const adicionales = usuario.permisosAdicionales;
        if (adicionales.length > 0) {
            await db.usuarioPermiso.createMany({
                data: adicionales.map((p) => ({ idUsuario: id, idPermiso: p.id })),
            });
        }

        const guardado = await this.buscarPorId(id, db);
        if (!guardado) throw new Error("No se pudo recuperar el usuario guardado");
        return guardado;
    }

    // Catalogo de roles y permisos (para cambiarRol / otorgarPermiso)

    async buscarRol(nombre: Rol["nombre"], db: Db = prisma): Promise<Rol | null> {
        const fila = await db.rol.findUnique({
            where: { nombre },
            include: { permisos: { include: { permiso: true } } },
        });
        return fila ? this.aRol(fila) : null;
    }

    async listarRoles(db: Db = prisma): Promise<Rol[]> {
        const filas = await db.rol.findMany({
            include: { permisos: { include: { permiso: true } } },
            orderBy: { id: "asc" },
        });
        return filas.map((f) => this.aRol(f));
    }

    async buscarPermiso(codigo: string, db: Db = prisma): Promise<Permiso | null> {
        const fila = await db.permiso.findUnique({ where: { codigo } });
        return fila ? this.aPermiso(fila) : null;
    }

    async listarPermisos(db: Db = prisma): Promise<Permiso[]> {
        const filas = await db.permiso.findMany({ orderBy: { codigo: "asc" } });
        return filas.map((f) => this.aPermiso(f));
    }

    // Mapeo a dominio

    private aPermiso(fila: {
        id: number;
        codigo: string;
        descripcion: string;
        esGlobal: boolean;
    }): Permiso {
        return new Permiso(fila.id, fila.codigo, fila.descripcion, fila.esGlobal);
    }

    private aRol(fila: {
        id: number;
        nombre: Rol["nombre"];
        permisos: { permiso: { id: number; codigo: string; descripcion: string; esGlobal: boolean } }[];
    }): Rol {
        return new Rol(
            fila.id,
            fila.nombre,
            fila.permisos.map((rp) => this.aPermiso(rp.permiso)),
        );
    }

    private aDominio(fila: FilaUsuario): Usuario {
        return Usuario.reconstruir(
            {
                id: fila.id,
                idAuth: fila.idAuth,
                nombres: fila.nombres,
                apellidos: fila.apellidos,
                tipoDocumento: fila.tipoDocumento,
                numeroDocumento: fila.numeroDocumento,
                email: fila.auth.email,
                telefono: null, // el schema no tiene columna de telefono para el personal
                fechaCreacion: fila.fechaCreacion,
                activo: !fila.auth.banned,
                debeCambiarPassword: fila.debeCambiarPassword,
            },
            this.aRol(fila.rol),
            fila.permisos.map((up) => this.aPermiso(up.permiso)),
        );
    }
}

export const usuarioRepository = new UsuarioRepository();