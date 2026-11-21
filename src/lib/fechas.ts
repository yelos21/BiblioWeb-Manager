
const Zona_Biblioteca = "America/Mexico_City";

export function fechaCalendario(fecha: Date = new Date(), zona: string = Zona_Biblioteca): Date {
    const iso = new Intl.DateTimeFormat("en-CA", {
        timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit",
    }). format(fecha);
    return new Date(`${iso}T00:00:00.000Z`);
}

export function SumarDias(fecha: Date, dias: number):Date {
    const r = new Date(fecha);
    r.setUTCDate(r.getUTCDate() + dias);
    return r; 
}

export function diasEntre(desde: Date, hasta: Date):number { 

    return Math.round((hasta.getTime() - desde.getTime() / 86_400_000));
}
