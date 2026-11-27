import type { NombreRol } from "./Enums";
import { Permiso } from "./Permiso";

export class Rol {
    constructor(
        public readonly id: number,
        public readonly nombre: NombreRol,
        private readonly permisosBase: Permiso[] = [],
    ) {}

    obtenerPermisosBase(): Permiso[] {
        return [...this.permisosBase];
    }

    tienePermiso(codigo: string): boolean {
        return this.permisosBase.some((p) => p.codigo === codigo);
    }
}