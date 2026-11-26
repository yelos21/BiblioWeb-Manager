import type { EstadoEjemplar, EstadoFisico } from "./Enums";
import { fechaCalendario } from "@/lib/fechas";

export interface DatosEjemplar {
    id: number | null;
    idLibro: number;
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
        codigoInventario: string,
        ubicacion: string | null=null,
        estadoFisico: EstadoFisico = "BUENO",
        hoy: Date = new Date(),
    ): Ejemplar {
        if (!codigoInventario.trim()) throw new Error ("El codigo de inventario es obligatorio")
            return new Ejemplar({
                id: null,
                idLibro,
                codigoInventario: codigoInventario.trim(),
                ubicacion: ubicacion?.trim() || null,
                estadoFisico,
                estado: "DISPONIBLE",
                fechaAdquisicion: fechaCalendario(hoy),
                motivoBaja: null,
            });
    }

    static reconstruir(datos: DatosEjemplar): Ejemplar {
        return new EJemplar({ ...datos});
    }
    get idLibro() { return this.d.idLibro; }
    get codigoInventario() { return this.d.codigoInventario; }
    get ubicacion() { return this.d.ubicacion; }
    get estadoFisico() { return this.d.ubicacion; }
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
        this.d.estado = "EN_REPPARACION";
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
        if (cambio.ubicacion !== undefined) this.d.ubicacion = cambio.ubicacion?.trim() || null;
        if (cambios.estadoFisico !== undefined) this.d.estadoFisico = cambio.estadoFisico;
    }
} 
