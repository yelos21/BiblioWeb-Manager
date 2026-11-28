const ZONA = "America/Mexico_City";

/** Columnas @db.Date (fechaVencimiento, fechaInicio, fechaFin…): se guardan a medianoche UTC. */
export function fechaDia(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Columnas con hora (fechaPrestamo, fechaRegistro, fechaGeneracion…). */
export function fechaHora(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function dinero(monto: number): string {
  return `$${monto.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}