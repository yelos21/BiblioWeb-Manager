import {fechaCalendario, SumarDias, diasEntre} from "../lib/fechas"

export interface DatosPrestamo{
    id: number | null;
    idCliente: number;
    idEjemplar: number;
    idUsuarioRegistra: number;
    fechaPrestamo: Date;
    fechaVencimiento: Date;
    fechaDevolucion: Date| null;
    idUsuarioRecibe: number | null;
}


export class prestamo{
    private constructor(private d: DatosPrestamo) {}

    static registrar(idCliente: number, idEjemplar: number, idUsuarioRegistra: number, diasPrestamo: number, ahora:Date = new Date()): prestamo{
        if(diasPrestamo <= 0 ) throw new Error("Los dias de prestamo deben ser mayores a cero")
        return new prestamo({
            id: null,
            idCliente,
            idEjemplar,
            idUsuarioRegistra,
            fechaPrestamo:ahora,
            fechaVencimiento: SumarDias(fechaCalendario(ahora), diasPrestamo),
            fechaDevolucion:null,
            idUsuarioRecibe: null,
        });
    };

    static recontruir(datos: DatosPrestamo){
        return new prestamo({...datos});
    }

    get id() {return this.d.id};
    get idPrestamo():number{
        if(this.d.id === null) throw new Error("El prestamo aun no se ha guardado");
        return this.d.id;
    }
    get idCliente() {return this.d.idCliente};
    get idEjemplar() {return this.d.idEjemplar};
    get idUsuarioRegistra() {return this.d.idUsuarioRegistra};
    get fechaPrestamo() {return this.d.fechaPrestamo};
    get fechaVencimiento() {return this.d.fechaVencimiento};
    get fechaDevolucion() {return this.d.fechaDevolucion};


    estaDevuelto():boolean{
        return this.d.fechaDevolucion !== null;
    } 

    

}