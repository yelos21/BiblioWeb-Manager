import { Reporte, type ResumenReporte } from "./Reporte";
import type { Prestamo } from "./prestamo";
import type { Devolucion } from "./Devolucion";
import type { Multa } from "./multa";
import { fechaCalendario } from "../lib/fechas";

export interface DatosOperacion {
    prestamos: Prestamo[];
    devoluciones: Devolucion[];
    multas: Multa[];
    idLibroPorEjemplar: Map<number, number>;
}

export class ReporteOperacion extends Reporte {
    constructor(
        idUsuario: number,
        periodoInicio: Date,
        periodoFin: Date,
        private datos: DatosOperacion,
        id: number | null = null,
        fechaGeneracion: Date = new Date(),
    ) {
        super(id, "OPERACION", periodoInicio, periodoFin, idUsuario, fechaGeneracion);
    }

    private enPeriodo(fecha: Date): boolean {
        const dia = fechaCalendario(fecha);
        return dia >= this._periodoInicio && dia <= this._periodoFin;
    }

    prestamosPorPeriodo(): number {
        return this.datos.prestamos.filter((p) => this.enPeriodo(p.fechaPrestamo)).length;
    }

    devolucionesTardias(): number {
        return this.datos.devoluciones.filter((d) => this.enPeriodo(d.fecha) && d.huboRetraso()).length;
    }

    multasRecaudadas(): number {
        const total = this.datos.multas
            .filter((m) => m.estado === "PAGADA" && m.fechaPago !== null && this.enPeriodo(m.fechaPago))
            .reduce((acum, m) => acum + m.monto, 0);
        return Math.round(total * 100) / 100;
    }

    librosMasPrestados(top: number = 5): { idLibro: number; total: number }[] {
        const conteo = new Map<number, number>();
        for (const p of this.datos.prestamos) {
            if (!this.enPeriodo(p.fechaPrestamo)) continue;
            const idLibro = this.datos.idLibroPorEjemplar.get(p.idEjemplar);
            if (idLibro === undefined) continue;
            conteo.set(idLibro, (conteo.get(idLibro) ?? 0) + 1);
        }
        return [...conteo.entries()]
            .map(([idLibro, total]) => ({ idLibro, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, top);
    }

    override generar(): ResumenReporte {
        const resumen: ResumenReporte = {
            prestamosPorPeriodo: this.prestamosPorPeriodo(),
            devolucionesTardias: this.devolucionesTardias(),
            multasRecaudadas: this.multasRecaudadas(),
        };
        for (const l of this.librosMasPrestados()) {
            resumen[`libro_${l.idLibro}`] = l.total;
        }
        return resumen;
    }
}