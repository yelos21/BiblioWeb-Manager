import type { EstadoFisico } from "./Enums";
import { Ejemplar } from "./Ejemplar";

export interface DatosLibro {
    id: number | null;
    isbn: string;
    titulo: string;
    anioPublicacion: number | null;
    descripcion: string | null;
    idEditorial: number;
    idCategoria: number;
    idsAutores: number[]; 
}

export class Libro {
    private constructor(private d: DatosLibro, private ejemplares: Ejemplar[] = []) {}

    static registrar(
        isbn: string,
        titulo: string,
        idEditorial: number,
        idCategoria: number,
        idsAutores: number[],
        anioPublicacion: number | null = null,
        descripcion: string | null = null,
    ): Libro {
        if (!isbn.trim()) throw new Error("El ISBN es obligatorio");
        if (!titulo.trim()) throw new Error("El titulo es obligatorio");
        if (idsAutores.length === 0) throw new Error("El libro debe tener al menos un autor");
        return new Libro({
            id: null, isbn: isbn.trim(), titulo: titulo.trim(),
            anioPublicacion, descripcion, idEditorial, idCategoria,
            idsAutores: [...new Set(idsAutores)],
        });
    }

    static reconstruir(datos: DatosLibro, ejemplares: Ejemplar[] = []): Libro {
        return new Libro({ ...datos, idsAutores: [...datos.idsAutores] }, [...ejemplares]);
    }

    get id() { return this.d.id; }
    get idPersistido(): number {
        if (this.d.id === null) throw new Error("El libro aun no se ha guardado");
        return this.d.id;
    }
    get isbn() { return this.d.isbn; }
    get titulo() { return this.d.titulo; }
    get anioPublicacion() { return this.d.anioPublicacion; }
    get descripcion() { return this.d.descripcion; }
    get idEditorial() { return this.d.idEditorial; }
    get idCategoria() { return this.d.idCategoria; }
    get idsAutores(): number[] { return [...this.d.idsAutores]; }
    get listaEjemplares(): Ejemplar[] { return [...this.ejemplares]; }

    agregarAutor(idAutor: number): void {
        if (this.d.idsAutores.includes(idAutor)) return; // ya estaba: no hacemos nada
        this.d.idsAutores.push(idAutor);                  // push = agrega al final del arreglo
    }

    agregarEjemplar(ejemplar: Ejemplar): void {
        if (this.d.id !== null && ejemplar.idLibro !== this.d.id) {
            throw new Error("El ejemplar pertenece a otro libro");
        }
        this.ejemplares.push(ejemplar);
    }

    crearEjemplares(
        copias: number,
        prefijoCodigo: string,
        ubicacion: string | null = null,
        estadoFisico: EstadoFisico = "NUEVO",
    ): Ejemplar[] {
        if (!Number.isInteger(copias) || copias < 1) throw new Error("El numero de copias debe ser un entero mayor a 0");
        if (!prefijoCodigo.trim()) throw new Error("El prefijo de codigo es obligatorio");
        const idLibro = this.idPersistido;
        const inicio = this.ejemplares.length;
        const nuevos: Ejemplar[] = [];
        for (let i = 1; i <= copias; i++) {
            // padStart(2, "0") rellena con ceros a la izquierda: 1 -> "01"
            const codigo = `${prefijoCodigo.trim()}-${String(inicio + i).padStart(2, "0")}`;
            nuevos.push(Ejemplar.registrar(idLibro, codigo, ubicacion, estadoFisico));
        }
        this.ejemplares.push(...nuevos);
        return nuevos;
    }

    contarEjemplaresDisponibles(): number {
        return this.ejemplares.filter((e) => e.estaDisponible()).length;
    }

    estaDisponible(): boolean {
        return this.contarEjemplaresDisponibles() > 0;
    }
}