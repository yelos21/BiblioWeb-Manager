import type { EstadoEjemplar, EstadoFisico } from "./Enums";
import { fechaCalendario } from "@/lib/fechas";

export interface DatosEjemplar {
    id: number | null;
    idLibro: number;
    numeroCopia: number;
    codigoInventario: string;
    ubicacion: string | null;
    estadoFisico: EstadoFisico;
    estado: EstadoEjemplar;
    fechaAdquisicion: Date;
    motivoBaja: string | null;
}

export class Ejemplar {
    private constructor (private d: DatosEjemplar) {}

    static registrar(
        idLibro: number,
        numeroCopia: number,
        codigoInventario: string,
        ubicacion: string | null=null,
        estadoFisico: EstadoFisico = "BUENO",
        hoy: Date = new Date(),
    ): Ejemplar {
        if (!Number.isInteger(numeroCopia) || numeroCopia < 1) throw new Error("El numero de copia debe ser un entero mayor a 0");
        if (!codigoInventario.trim()) throw new Error ("El codigo de inventario es obligatorio")
            return new Ejemplar({
                id: null,
                idLibro,
                numeroCopia,
                codigoInventario: codigoInventario.trim(),
                ubicacion: ubicacion?.trim() || null,
                estadoFisico,
                estado: "DISPONIBLE",
                fechaAdquisicion: fechaCalendario(hoy),
                motivoBaja: null,
            });
    }

    static reconstruir(datos: DatosEjemplar): Ejemplar {
        return new Ejemplar({ ...datos});
    }
    get id() {return this.d.id}
    get idLibro() { return this.d.idLibro; }
    get numeroCopia() { return this.d.numeroCopia; }
    get codigoInventario() { return this.d.codigoInventario; }
    get ubicacion() { return this.d.ubicacion; }
    get estadoFisico() { return this.d.estadoFisico; }
    get estado() { return this.d.estado; }
    get fechaAdquisicion() { return this.d.fechaAdquisicion; }
    get motivoBaja() { return this.d.motivoBaja; }

    estaDisponible(): boolean {
        return this.d.estado === "DISPONIBLE"; 
    }

    marcarPrestado(): void {
        if (!this.estaDisponible()) {
            throw new Error("El ejemplar no esta disponible para prestamo");
        }
        this.d.estado = "PRESTADO";
    }

    marcarDisponible(): void {
        if (this.d.estado === "BAJA") throw new Error("Un ejemplar dado de baja no puede volver a estar disponible");
        if (this.d.estado === "DISPONIBLE") throw new Error("El ejemplar ya esta disponible");
        this.d.estado = "DISPONIBLE";
    }

    enviarAReparacion(): void {
        if (this.d.estado === "PRESTADO") throw new Error("No se puede reparar un ejemplar que esta prestado");
        if (this.d.estado === "BAJA") throw new Error("El ejemplar esta dado de baja");
        this.d.estado = "EN_REPARACION";
    }

    darDeBaja(motivo: string): void {
        if (!motivo.trim()) throw new Error("El motivo de la baja es obligatorio");
        if(this.d.estado === "PRESTADO") throw new Error("No se puede dar de baja un ejemplar prestado");
        if (this.d.estado === "BAJA") throw new Error("El ejemplar ya esta dado de baja")
        this.d.estado = "BAJA";
        this.d.motivoBaja = motivo.trim();
    }

    actualizarDatos(cambios: Partial<Pick<DatosEjemplar, "ubicacion" | "estadoFisico">>): void {
        if (this.d.estado === "BAJA") throw new Error("No se puede editar un ejemplar dado de baja");
        if (cambios.ubicacion !== undefined) this.d.ubicacion = cambios.ubicacion?.trim() || null;
        if (cambios.estadoFisico !== undefined) this.d.estadoFisico = cambios.estadoFisico;
    }
} 
