import { Reporte, type ResumenReporte } from "./Reporte";
import type { Usuario } from "./Usuario";
import type { Libro } from "./Libro";
import type { Ejemplar } from "./Ejemplar";

export interface DatosSistema {
    usuarios: Usuario[];
    libros: Libro[];
    ejemplares: Ejemplar[];
}

export class ReporteSistema extends Reporte {
    constructor(
        idUsuario: number,
        periodoInicio: Date,
        periodoFin: Date,
        private datos: DatosSistema,
        id: number | null = null,
        fechaGeneracion: Date = new Date(),
    ) {
        super(id, "SISTEMA", periodoInicio, periodoFin, idUsuario, fechaGeneracion);
    }

    contarUsuariosPorRol(): Record<string, number> {
        const conteo: Record<string, number> = {};
        for (const u of this.datos.usuarios) {
            const nombre = u.rolActual.nombre;
            conteo[nombre] = (conteo[nombre] ?? 0) + 1;
        }
        return conteo;
    }

    resumenInventario(): Record<string, number> {
        const conteo: Record<string, number> = {};
        for (const e of this.datos.ejemplares) {
            conteo[e.estado] = (conteo[e.estado] ?? 0) + 1;
        }
        return conteo;
    }

    resumenCatalogo(): { titulos: number; ejemplares: number } {
        return { titulos: this.datos.libros.length, ejemplares: this.datos.ejemplares.length
        };
    }

    override generar(): ResumenReporte {
        const resumen: ResumenReporte = {
            titulos: this.resumenCatalogo().titulos,
            ejemplaresTotales: this.resumenCatalogo().ejemplares,
        };
        for (const [rol, n] of Object.entries(this.contarUsuariosPorRol())) resumen[`usuarios_${rol}`] = n;
        for (const [estado, n] of Object.entries(this.resumenInventario())) resumen[`ejemplares_${estado}`] = n;
        return resumen;
    }
}