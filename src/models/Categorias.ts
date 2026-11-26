export class Categoria {
    constructor(
        public readonly id: number | null,
        public readonly nombre: string,
        public readonly descripcion: string | null = null,
    ) {
        if(!nombre.trin()) throw new Error("El nombre de la categoria es obligatorio");
    }
}