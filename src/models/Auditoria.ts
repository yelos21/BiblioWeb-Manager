export interface DatosAuditoria {
    id: number | null;
    idUsuario: number;
    accion: string;
    entidad: string;
    idRegistro: number | null;
    fechaHora: Date;
    detalle: string | null;
}

export const MAX_TEXTO_AUDITORIA = 50;

/** Una accion del personal en la bitacora. Es inmutable: una vez registrada no se modifica. */
export class Auditoria {
    private constructor(private readonly d: DatosAuditoria) {}

    static registrar(
        idUsuario: number,
        accion: string,
        entidad: string,
        idRegistro: number | null = null,
        detalle: string | null = null,
        ahora: Date = new Date(),
    ): Auditoria {
        const accionLimpia = accion.trim();
        const entidadLimpia = entidad.trim();
        if (!accionLimpia) throw new Error("La accion de auditoria es obligatoria");
        if (!entidadLimpia) throw new Error("La entidad de auditoria es obligatoria");
        if (accionLimpia.length > MAX_TEXTO_AUDITORIA || entidadLimpia.length > MAX_TEXTO_AUDITORIA) {
            throw new Error(`La accion y la entidad no pueden pasar de ${MAX_TEXTO_AUDITORIA} caracteres`);
        }
        return new Auditoria({
            id: null,
            idUsuario,
            accion: accionLimpia,
            entidad: entidadLimpia,
            idRegistro,
            fechaHora: ahora,
            detalle: detalle?.trim() || null,
        });
    }

    static reconstruir(datos: DatosAuditoria): Auditoria {
        return new Auditoria({ ...datos });
    }

    get id() { return this.d.id; }
    get idPersistido(): number {
        if (this.d.id === null) throw new Error("La auditoria aun no se ha guardado");
        return this.d.id;
    }
    get idUsuario() { return this.d.idUsuario; }
    get accion() { return this.d.accion; }
    get entidad() { return this.d.entidad; }
    get idRegistro() { return this.d.idRegistro; }
    get fechaHora() { return this.d.fechaHora; }
    get detalle() { return this.d.detalle; }

    obtenerResumen(): string {
        const objetivo = this.d.idRegistro !== null ? `${this.d.entidad} #${this.d.idRegistro}` : this.d.entidad;
        return `${this.d.accion} | ${objetivo} | usuario ${this.d.idUsuario}`;
    }
}