import type { EstadoEjemplar, EstadoFisico } from "./Enums";
import type { Prestamo } from "./prestamo";
import type { ReglaPrestamo } from "./ReglaPrestamo";
import { Multa } from "./multa";

export interface DatosDevolucion {
    id: number | null;
    idPrestamo: number;
    idUsuarioRecibe:number;
    fecha: Date;
    estadoFisicoAlRecibir: EstadoFisico;
    estadoEjemplarResultante: EstadoEjemplar | null;
    observaciones: string | null;
}

export class Devolucion {
    private constructor(private d: DatosDevolucion, private prestamo: Prestamo){}

    static registrar(    
    prestamo: Prestamo,
    idUsuarioRecibe: number,
    estadoFisicoAlRecibir: EstadoFisico,
    estadoEjemplarResultante: EstadoEjemplar | null = null,
    observaciones: string | null = null,
    fecha: Date = new Date(),
    ):Devolucion{
        const idPrestamo = prestamo.idPersistido;
        prestamo.cerrar(fecha);
        return new Devolucion(
            {
                id: null,
                idPrestamo,
                idUsuarioRecibe,
                fecha,
                estadoFisicoAlRecibir,
                estadoEjemplarResultante,
                observaciones: observaciones?.trim() || null,
            },
            prestamo,
        );
    }


    static reconstruir(datos: DatosDevolucion, prestamo: Prestamo):Devolucion{
        return new Devolucion({...datos}, prestamo);
    }

    get id() {return this.d.id};
    get idPersistido(): number {
        if (this.d.id === null) throw new Error("La devolucion aun no se ha guardado");
        return this.d.id;
    }
    get idPrestamo() { return this.d.idPrestamo; }
    get idUsuarioRecibe() { return this.d.idUsuarioRecibe; }
    get fecha() { return this.d.fecha; }
    get estadoFisicoAlRecibir() { return this.d.estadoFisicoAlRecibir; }
    get estadoEjemplarResultante() { return this.d.estadoEjemplarResultante; }
    get observaciones() { return this.d.observaciones; }
    get diasRetraso(): number { return this.prestamo.calcularDiasRetraso(this.d.fecha); }
    
    huboRetraso():boolean{
        return this.diasRetraso > 0;
    }

    generarMulta(regla: ReglaPrestamo, idUsuarioCalcula: number): Multa | null {
        if (!this.huboRetraso()) return null;
        return Multa.generar(this, regla, idUsuarioCalcula, this.prestamo.idCliente);
    }
}