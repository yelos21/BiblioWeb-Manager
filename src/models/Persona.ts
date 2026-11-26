export abstract class Persona {
    protected constructor(
        protected readonly _id: number | null, 
        protected readonly _nombre: string,
        protected readonly _email: string,
        protected readonly _telefono: string | null,
    ) {}

    get id() {return this._id};
    get nombre() {return this._nombre};
    get email() {return this._email};
    get telefono() {return this._telefono}

    abstract obtenerResumen():string;
}