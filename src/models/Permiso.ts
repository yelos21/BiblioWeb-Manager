export class Permiso {
    constructor(
        public readonly id: number,
        public readonly codigo: string,
        public readonly descripcion: string,
        public readonly esGlobal: boolean = false,
    ) {}
}