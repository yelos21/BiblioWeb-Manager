import { error } from "console";

export type EstadoMulta = "PENDIENTE" | "PAGADA" | "CONDONADA";

export interface DatosMulta{
    id: number | null;
    idPrestamo: number;
    diasRetraso: number;
    monto: number; 
    estado: EstadoMulta;
    fechaPago: Date | null;
}

export class Multa{
    private constructor(private d: DatosMulta){}

    static calcular(idPrestamo: number, diasRetraso: number, tarifaPorDia: number ):Multa{
        if(diasRetraso <= 0){
            throw new Error("Solo hay multa cuando existe un retraso de pago");
        }
        return new Multa({
            id:null,
            idPrestamo,
            diasRetraso,
            monto: Math.round(diasRetraso * tarifaPorDia *100 )/100,
            estado: "PENDIENTE",
            fechaPago: null,
        });

    }
    
    static reconstruir(datos: DatosMulta):Multa{
        return new Multa({...datos});
    }

    get id() {return this.d.id};
    get idPrestamo() {return this.d.idPrestamo};
    get diasRetraso() {return this.d.diasRetraso};
    get monto() {return this.d.monto};
    get estado() {return this.d.estado};
    get fechaPago() {return this.d.fechaPago};

    marcarPagado(fecha: Date = new Date()): void {
        if(this.d.estado !== "PENDIENTE"){
            throw new Error("Solo se puede pagar una multa pendiente")
        };
        this.d.estado = "PAGADA";
        this.d.fechaPago = fecha;

    }

    condonar():void{

         if(this.d.estado !== "PENDIENTE"){
            throw new Error("Solo se puede condonar una multa pendiente")
        };
        this.d.estado = "CONDONADA";
    }



};


  