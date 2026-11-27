import type { TipoDocumento } from "@/models/Enums";


export const tiposDocumento: { valor: TipoDocumento; etiqueta: string }[] = [
  { valor: "CEDULA", etiqueta: "Cédula" },
  { valor: "DNI", etiqueta: "DNI" },
  { valor: "PASAPORTE", etiqueta: "Pasaporte" },
  { valor: "OTRO", etiqueta: "Otro" },
];