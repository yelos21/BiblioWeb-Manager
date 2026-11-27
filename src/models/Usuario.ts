import { Persona } from "./Persona";
import type { Rol } from "./Rol";
import type { Permiso } from "./Permiso";
import type { TipoDocumento } from "./Enums";

export interface DatosUsuario {
    id: number | null;
    idAuth: string;
    nombres: string;
    apellidos: string;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    email: string;
    telefono: string | null;
    fechaCreacion: Date;
    activo: boolean;
    debeCambiarPassword: boolean;
}

export class Usuario extends Persona {
    private constructor(
        private d: DatosUsuario,
        private rol: Rol,
        private permisosPersonales: Permiso[] = [],
    ) {
        super(d.id, `${d.nombres} ${d.apellidos}`, d.email, d.telefono);
    }

    static crear(
        idAuth: string,
        nombres: string,
        apellidos: string,
        tipoDocumento: TipoDocumento,
        numeroDocumento: string,
        email: string,
        rol: Rol,
        telefono: string | null = null,
        hoy: Date = new Date(),
    ): Usuario {
        if (!idAuth.trim()) throw new Error("El id de autenticacion es obligatorio");
        if (!nombres.trim()) throw new Error("Los nombres son obligatorios");
        if (!apellidos.trim()) throw new Error("Los apellidos son obligatorios");
        if (!numeroDocumento.trim()) throw new Error("El numero de documento es obligatorio");
        if (!email.includes("@")) throw new Error("Correo electronico invalido");
        return new Usuario({
            id: null,
            idAuth,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            tipoDocumento,
            numeroDocumento: numeroDocumento.trim(),
            email: email.trim().toLowerCase(),
            telefono,
            fechaCreacion: hoy,
            activo: true,
            debeCambiarPassword: true,
        }, rol);
    }

    static reconstruir(
        datos: DatosUsuario,
        rol: Rol,
        permisosPersonales: Permiso[] = [],
    ): Usuario {
        return new Usuario({ ...datos }, rol, [...permisosPersonales]);
    }

    get idActual(): number | null { return this.d.id; }
    get idPersistido(): number {
        if (this.d.id === null) throw new Error("El usuario aun no se ha guardado");
        return this.d.id;
    }
    get nombres() { return this.d.nombres; }
    get apellidos() { return this.d.apellidos; }
    get tipoDocumento() { return this.d.tipoDocumento; }
    get numeroDocumento() { return this.d.numeroDocumento; }
    get debeCambiarPassword() { return this.d.debeCambiarPassword; }
    get idAuth() { return this.d.idAuth; }
    get activo() { return this.d.activo; }
    get fechaCreacion() { return this.d.fechaCreacion; }
    get permisosAdicionales(): Permiso[] { return [...this.permisosPersonales]; }
    get rolActual(): Rol { return this.rol; }
    get idRol(): number { return this.rol.id; }

    puedeIniciarSesion(): boolean {
        return this.d.activo;
    }

    obtenerPermisos(): Permiso[] {
        const mapa = new Map<string, Permiso>();
        for (const p of this.rol.obtenerPermisosBase()) mapa.set(p.codigo, p);
        for (const p of this.permisosPersonales) mapa.set(p.codigo, p);
        return [...mapa.values()];
    }

    tienePermiso(codigo: string): boolean {
        if (!this.d.activo) return false;
        return this.obtenerPermisos().some((p) => p.codigo === codigo);
    }

    otorgarPermiso(permiso: Permiso): void {
        if (this.permisosPersonales.some((p) => p.codigo === permiso.codigo)) return;
        this.permisosPersonales.push(permiso);
    }

    revocarPermiso(codigo: string): void {
        this.permisosPersonales = this.permisosPersonales.filter((p) => p.codigo !== codigo);
    }

    cambiarRol(nuevoRol: Rol): void {
        this.rol = nuevoRol;
    }

    marcarPasswordCambiada(): void {
        this.d.debeCambiarPassword = false;
    }

    exigirCambioPassword(): void {
        this.d.debeCambiarPassword = true;
    }

    desactivar(): void {
        if (!this.d.activo) throw new Error("El usuario ya esta desactivado");
        this.d.activo = false;
    }

    override obtenerResumen(): string {
        return `${this.nombre} <${this.email}> | rol ${this.rol.nombre} | ${this.d.activo ? "activo" : "inactivo"}`;
    }
}