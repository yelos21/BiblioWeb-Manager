import { fechaCalendario, SumarDias } from "@/lib/fechas";
import { ReglaPrestamo } from "./ReglaPrestamo";


export interface DatosSancion{
    id: number | null;
    idCliente: number;
    idMulta: number | null;
    idUsuarioAplica: number;
    motivo:string;
    fechaInicio:Date; 
    fechaFin: Date;
    fechaLevantada: Date| null;
}


export class Sancion{
    private constructor(private d: DatosSancion){}

    static aplicar(
    idCliente: number,
    idUsuarioAplica: number,
    motivo: string,
    regla: ReglaPrestamo,
    idMulta: number | null = null,
    hoy: Date = new Date(),): Sancion{
      if (!motivo.trim()) throw new Error("El motivo de la sancion es obligatorio");
        const inicio = fechaCalendario(hoy);
        return new Sancion({
        id: null,
        idCliente,
        idMulta,
        idUsuarioAplica,
        motivo: motivo.trim(),
        fechaInicio: inicio,
        fechaFin: SumarDias(inicio, regla.diasSancionBase),
        fechaLevantada: null,
        });
    }


    static reconstruir(datos: DatosSancion): Sancion{
        return new Sancion({...datos});
    }


    get id() {return this.d.id} 
    get idPersistido(): number {
    if (this.d.id === null) throw new Error("La sancion aun no se ha guardado");
    return this.d.id;
    }
    get idCliente() { return this.d.idCliente; }
    get idMulta() { return this.d.idMulta; }
    get idUsuarioAplica() { return this.d.idUsuarioAplica; }
    get motivo() { return this.d.motivo; }
    get fechaInicio() { return this.d.fechaInicio; }
    get fechaFin() { return this.d.fechaFin; }
    get fechaLevantada() { return this.d.fechaLevantada; }
 
    get vigente():boolean {return this.estaVigente();}


    estaVigente(hoy: Date = new Date()):boolean{
        return this.d.fechaLevantada === null && fechaCalendario(hoy) <= this.fechaFin;
    }


    levantar(hoy: Date = new Date()):void{
        if(!this.estaVigente(hoy)){
            throw new Error("Esta sancion no esta vigente");
        }
        this.d.fechaLevantada = fechaCalendario(hoy);
    }

}