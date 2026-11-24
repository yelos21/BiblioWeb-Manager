import type { EstadoFisico } from "./Enums";
import type { Prestamo } from "./prestamo";

export interface DatosDevolucion {
    id: number | null;
    idPrestamo: number;
    idUsuarioRecibe:number;
    fecha: Date;
    estadoFisicoAlRecibir: EstadoFisico;
    observaciones: string | null;
}

export class Devolucion {
    private constructor(private d: DatosDevolucion, private prestamo: Prestamo){}

    static registrar(    
    prestamo: Prestamo,
    idUsuarioRecibe: number,
    estadoFisicoAlRecibir: EstadoFisico,
    observaciones: string | null = null,
    fecha: Date = new Date(),
    ):Devolucion{
        
    }

}
