export class Autor {
    constructor(
        public readonly id: number | null,
        public readonly nombre: string,
        public readonly nacionalidad: string | null = null,
    ) {
        if (!nombre.trim()) throw new Error("El nombre del autor es obligatorio");
    }
}