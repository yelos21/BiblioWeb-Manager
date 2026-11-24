import {fechaCalendario, SumarDias, diasEntre} from "../lib/fechas"
import type { EstadoPrestamo } from "./Enums";
import type { ReglaPrestamo } from "./ReglaPrestamo";

    export interface DatosPrestamo {
    id: number | null;
    idCliente: number;
    idEjemplar: number;
    idUsuarioRegistra: number;
    idRegla: number;
    fechaPrestamo: Date;
    fechaVencimiento: Date;
    fechaDevolucion: Date | null;
    }
    
    export class Prestamo {
    private constructor(private d: DatosPrestamo) {}
    
    static registrar(
        idCliente: number,
        idEjemplar: number,
        idUsuarioRegistra: number,
        regla: ReglaPrestamo,
        ahora: Date = new Date(),
    ): Prestamo {
        return new Prestamo({
        id: null,
        idCliente,
        idEjemplar,
        idUsuarioRegistra,
        idRegla: regla.id,
        fechaPrestamo: ahora,
        fechaVencimiento: regla.calcularFechaVencimiento(ahora),
        fechaDevolucion: null,
        });
    }
    
    /** Rehidrata un prestamo que ya existe en la base de datos. */
    static reconstruir(datos: DatosPrestamo): Prestamo {
        return new Prestamo({ ...datos });
    }
    
    get id() { return this.d.id; }
    get idPersistido(): number {
        if (this.d.id === null) throw new Error("El prestamo aun no se ha guardado");
        return this.d.id;
    }
    get idCliente() { return this.d.idCliente; }
    get idEjemplar() { return this.d.idEjemplar; }
    get idUsuarioRegistra() { return this.d.idUsuarioRegistra; }
    get idRegla() { return this.d.idRegla; }
    get fechaPrestamo() { return this.d.fechaPrestamo; }
    get fechaVencimiento() { return this.d.fechaVencimiento; }
    get fechaDevolucion() { return this.d.fechaDevolucion; }
    

    get estado():EstadoPrestamo{
        if(this.fechaDevolucion !== null ){
            return "DEVUELTO";
        }
        return this.estaVencido() ? "VENCIDO" : "ACTIVO";
    }
    
    estaVencido(ahora:Date = new Date()):boolean{
        return this.d.fechaDevolucion === null && this.calcularDiasRetraso(ahora) > 0;
    }

    calcularDiasRetraso(hasta?: Date): number{
        const limite = hasta ?? this.d.fechaDevolucion ?? new Date();
        return Math.max(0, diasEntre(this.d.fechaVencimiento, fechaCalendario(limite)));
    }


    cerrar(fecha: Date = new Date()):void{
        if(this.d.fechaDevolucion !== null){
            throw new Error("EL prestamo ya fue revuelto");
        }
        this.d.fechaDevolucion = fecha;
    }


}