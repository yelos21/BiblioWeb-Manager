import type { ConceptoMulta, EstadoMulta } from "./Enums";
import type { Devolucion } from "./Devolucion";
import type { ReglaPrestamo } from "./ReglaPrestamo";
 
export interface DatosMulta {
  id: number | null;
  idDevolucion: number;
  idUsuarioCalcula: number;
  idCliente: number;
  concepto: ConceptoMulta;
  diasRetraso: number;
  monto: number;
  estado: EstadoMulta;
  fechaGeneracion: Date;
  fechaPago: Date | null;
}
 
export class Multa {
  private constructor(private d: DatosMulta) {}
 
  static generar(
    devolucion: Devolucion,
    regla: ReglaPrestamo,
    idUsuarioCalcula: number,
    idCliente: number,
  ): Multa {
    if (!devolucion.huboRetraso()) throw new Error("Solo hay multa cuando hubo retraso");
    const multa = new Multa({
      id: null,
      idDevolucion: devolucion.idPersistido,
      idUsuarioCalcula,
      idCliente,
      concepto: "RETRASO",
      diasRetraso: devolucion.diasRetraso,
      monto: 0,
      estado: "PENDIENTE",
      fechaGeneracion: new Date(),
      fechaPago: null,
    });
    multa.d.monto = multa.calcularMonto(regla);
    return multa;
  }
 
  static reconstruir(datos: DatosMulta): Multa {
    return new Multa({ ...datos });
  }
 
  get id() { return this.d.id; }
  get idDevolucion() { return this.d.idDevolucion; }
  get idUsuarioCalcula() { return this.d.idUsuarioCalcula; }
  get idCliente() { return this.d.idCliente; }
  get concepto() { return this.d.concepto; }
  get diasRetraso() { return this.d.diasRetraso; }
  get monto() { return this.d.monto; }
  get estado() { return this.d.estado; }
  get fechaGeneracion() { return this.d.fechaGeneracion; }
  get fechaPago() { return this.d.fechaPago; }
 
  calcularMonto(regla: ReglaPrestamo): number {
    return Math.round(this.d.diasRetraso * regla.multaPorDia * 100) / 100;
  }
 
  marcarPagada(fecha: Date = new Date()): void {
    if (this.d.estado !== "PENDIENTE") throw new Error("Solo se puede pagar una multa pendiente");
    this.d.estado = "PAGADA";
    this.d.fechaPago = fecha;
  }
 
  condonar(): void {
    if (this.d.estado !== "PENDIENTE") throw new Error("Solo se puede condonar una multa pendiente");
    this.d.estado = "CONDONADA";
  }
}
  