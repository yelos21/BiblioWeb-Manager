import type { FormatoExportacion, TipoReporte } from "./Enums";

export type ResumenReporte = Record<string, number>;

export abstract class Reporte {
    protected constructor(
        protected readonly _id: number | null,
        public readonly tipo: TipoReporte,
        protected readonly _periodoInicio: Date,
        protected readonly _periodoFin: Date,
        protected readonly _idUsuario: number,
        protected readonly _fechaGeneracion: Date = new Date(),
    ) {
        if (_periodoFin < _periodoInicio) throw new Error("El periodo final no puede ser anterior al inicial");
    }

    get id() { return this._id; }
    get periodoInicio() { return this._periodoInicio; }
    get periodoFin() { return this._periodoFin; }
    get idUsuario() { return this._idUsuario; }
    get fechaGeneracion() { return this._fechaGeneracion; }

    abstract generar(): ResumenReporte;

    exportar(formato: FormatoExportacion): string {
        if (formato === "PDF") throw new Error("La exportacion a PDF aun no esta implementada");
        const filas = Object.entries(this.generar()).map(([clave, valor]) => `${clave},${valor}`);
        return ["concepto,valor", ...filas].join("\n");
    }
}