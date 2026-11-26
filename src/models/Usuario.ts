import { Persona } from "./Persona";
import type { Rol } from "./Rol";
import type { Permiso } from "./Permiso";

export interface DatosUsuario {
    id: number | null;
    idAuth: string;
    nombre: string;
    email: string;
    telefono: string | null;
    fechaCreacion: Date;
    activo: boolean;
}

export class Usuario extends Persona {
    private constructor(
        private d: DatosUsuario,
        private rol: rol,
        private permisosPersonales: Permiso[] = [],
    ) {
        super(d.id, d.nombre, d.email, d.telefono);
    }

    static crear(idAuth: string, nombre: string, email: string, rol: Rol, telefono: string | null = null, hoy: Date = new Date()): Usuairo {
        if (!idAuth.trim()) throw new Error("El id de autenticacion es obligatio");
        if (!nombre.trim()) throw new Error("El nombre es obligatorio");
        if (!email.includes("@")) throw new Error("Correo electronico invalido");
        return new Usuario({
            id: null, idAuth, nombre: nombre.trim(), email: email.trim().toLowerCase(), telefono, fechaCreacion: hoy, activo: true,
        }, rol);
    }

    static reconstruir(datos: DatosUsuario, rol: Rol, permisosPersonales: Permiso[] = []):
    Usuario {
        return new Usuario({ ...datos }, rol, [...permisosPersonales]);
    }

    get idAuth() { return this.d.idAuth; }
    get activo() { return this.d.activo; }
    get fechaCreacion() { return this.d.fechaCreacion; }
    get rolActual(): Rol { return this.rol.id; }
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
        if (!this.d.activo) return false; // una cuenta desactivada no puede nada
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
    
    desactivar(): void {
        if (!this.d.activo) throw new Error("El usuario ya esta desactivado");
        this.d.activo = false;
    }

    override obtenerResumen(): string {
        return `${this.nombre} <${this.email}> | rol ${this.rol.nombre} | ${this.d.activo ? "activo" : "inactivo"}`;
    }
}