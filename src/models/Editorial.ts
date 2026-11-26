export class Editorial {
    constructor(
        public readonly id: number | null,
        public readonly nombre: string,
        public readonly paos: string | null = null,
    ) {
        if (!nombre.trim()) throw new Error("El nombre de la editorial es obligatorio");
    }
}