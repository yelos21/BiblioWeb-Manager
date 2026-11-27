import { fechaCalendario, SumarDias  } from "@/lib/fechas";

export class ReglaPrestamo {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly diasPrestamo: number,
        public readonly maxPrestamosPorCliente: number,
        public readonly multaPorDia: number,
        public readonly diasSancionBase: number,
        public readonly vigenteDesde: Date,
        public readonly vigenteHasta: Date | null = null,
    ){}

    estaVigente(fecha: Date = new Date()): boolean {
        const dia = fechaCalendario(fecha).getTime();
        if (dia < fechaCalendario(this.vigenteDesde).getTime()) return false;
        if (this.vigenteHasta && dia > fechaCalendario(this.vigenteHasta).getTime()) return false;
        return true;
    }

    calcularFechaVencimiento(fecha: Date):Date{
        return SumarDias(fechaCalendario(fecha), this.diasPrestamo)
    }


}