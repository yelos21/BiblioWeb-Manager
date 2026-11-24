import { fechaCalendario, SumarDias  } from "@/lib/fechas";

export class ReglaPrestamo {
    constructor(
        public readonly id: number,
        public readonly diasPrestamo: number,
        public readonly maxPrestamosPorCliente: number,
        public readonly multaPorDia: number,
        public readonly diasSancionBase: number, 
    ){}

    calcularFechaVencimiento(fecha: Date):Date{
        return SumarDias(fechaCalendario(fecha), this.diasPrestamo)
    }


}