export type EstadoCliente = "ACTIVO" | "SANCIONADO";
export type  EstadoEjemplar = "DISPONIBLE" | "PRESTADO" | "EN_REPARACION" | "BAJA";
export type EstadoFisico = "NUEVO" | "BUENO" | "REGULAR" | "DETERIORADO";
export type EstadoPrestamo = "ACTIVO" | "DEVUELTO" | "VENCIDO";
export type EstadoMulta = "PENDIENTE" | "PAGADA" | "CONDONADA";
export type NombreRol = "ADMINISTRADOR" | "MOSTRADOR" | "INVENTARIO";
export type TipoReporte = "SISTEMA" | "OPERACION";
export type FormatoExportacion = "CSV" | "PDF";