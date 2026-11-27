import { Persona } from "./Persona";
import type { EstadoCliente, TipoDocumento } from "./Enums";
import type { Sancion } from "./sancion";
import type { Prestamo } from "./prestamo";
import type { Multa } from "./multa";
import type { ReglaPrestamo } from "./ReglaPrestamo";

export interface DatosCliente {
    id: number | null;
    credencial: number | null;
    nombres: string;
    apellidos: string;
    tipoDocumento: TipoDocumento;
    identificacion: string;
    email: string;
    telefono: string | null;
    direccion: string | null;
    fechaRegistro: Date;
    idUsuarioRegistro: number;
}

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Cliente extends Persona {
    private constructor(
        private d: DatosCliente,
        private sanciones: Sancion[] = [],
        private prestamos: Prestamo[] = [],
        private multas: Multa[] = [],
    ) {
        super(d.id, `${d.nombres} ${d.apellidos}`, d.email, d.telefono);
    }
    
    static registrar(
        nombres: string,
        apellidos: string,
        tipoDocumento: TipoDocumento,
        identificacion: string,
        email: string,
        idUsuarioRegistro: number,
        telefono: string | null = null,
        direccion: string | null = null,
        hoy: Date = new Date(),
    ): Cliente {
        if (!nombres.trim()) throw new Error("Los nombres son obligatorios");
        if (!apellidos.trim()) throw new Error("Los apellidos son obligatorios");
        if (!identificacion.trim()) throw new Error("La identificacion es obligatoria");
        if (!FORMATO_EMAIL.test(email.trim())) throw new Error("Correo electronico invalido");
        return new Cliente({
            id: null,
            credencial: null,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            tipoDocumento,
            identificacion: identificacion.trim(),
            email: email.trim().toLowerCase(),
            telefono: telefono?.trim() || null,
            direccion: direccion?.trim() || null,
            fechaRegistro: hoy,
            idUsuarioRegistro,
        });
    }

    static reconstruir(
        datos: DatosCliente,
        sanciones: Sancion[] = [],
        prestamos: Prestamo[] = [],
        multas: Multa[] = [],
    ): Cliente {
        return new Cliente({ ...datos }, [...sanciones], [...prestamos], [...multas]);
    }

    aDatos(): DatosCliente { return { ...this.d }; }

    get credencial() { return this.d.credencial; }
    get nombres() { return this.d.nombres; }
    get apellidos() { return this.d.apellidos; }
    get tipoDocumento() { return this.d.tipoDocumento; }
    get identificacion() { return this.d.identificacion; }
    get direccion() { return this.d.direccion; }
    get fechaRegistro() { return this.d.fechaRegistro; }
    get listaSanciones(): Sancion[] { return [...this.sanciones]; }

    calcularEstado(hoy: Date = new Date()): EstadoCliente {
        return this.sanciones.some((s) => s.estaVigente(hoy)) ? "SANCIONADO" : "ACTIVO";
    }
    get estado(): EstadoCliente { return this.calcularEstado(); }

    contarPrestamosActivos(): number {
        return this.prestamos.filter((p) => p.fechaDevolucion === null).length;
    }

    tieneMultasPendientes(): boolean {
        return this.multas.some((m) => m.estado === "PENDIENTE");
    }

    puedePedirPrestado(regla?: ReglaPrestamo, hoy: Date = new Date()): boolean {
        if (this.calcularEstado(hoy) === "SANCIONADO") return false;
        if (this.tieneMultasPendientes()) return false;
        if (regla && this.contarPrestamosActivos() >= regla.maxPrestamosPorCliente) return false;
        return true;
    }

    sancionar(sancion: Sancion): void {
        if (this.d.id !== null && sancion.idCliente !== this.d.id) {
            throw new Error("La sancion pertenece a otro cliente");
        }
        this.sanciones.push(sancion);
    }

    rehabilitar(hoy: Date = new Date()): void {
        if (this.tieneMultasPendientes()) throw new Error("No se puede rehabilitar: hay multas pendientes");
        for (const s of this.sanciones) {
            if (s.estaVigente(hoy)) s.levantar(hoy);
        }
    }

    override obtenerResumen(): string {
        return `${this.nombre} | credencial ${this.credencial ?? "pendiente"} | ${this.estado}`;
    }
}