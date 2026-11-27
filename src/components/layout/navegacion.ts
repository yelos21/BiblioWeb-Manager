import {
    BookPlus,
    LayoutGrid,
    Table,
    Undo2,
    UserCog,
    Users,
    type LucideIcon,
} from "lucide-react";
import type { NombreRol } from "@/generated/prisma/enums";

export type Enlace = {
    href: string;
    etiqueta: string;
    titulo: string;
    icono: LucideIcon;
    permiso: string | null;
};

export const enlaces: Enlace[] = [
  { href: "/dashboard", etiqueta: "Inicio", titulo: "Panel principal", icono: LayoutGrid, permiso: null },
  { href: "/prestamos", etiqueta: "Registrar préstamo", titulo: "Registrar préstamo", icono: BookPlus, permiso: "prestamos.registrar" },
  { href: "/lectores", etiqueta: "Usuarios lectores", titulo: "Usuarios lectores", icono: Users, permiso: "lectores.ver" },
  { href: "/personal", etiqueta: "Personal bibliotecario", titulo: "Personal bibliotecario", icono: UserCog, permiso: "personal.ver" },
  { href: "/devoluciones", etiqueta: "Devoluciones", titulo: "Devolución de libro", icono: Undo2, permiso: "devoluciones.registrar" },
  { href: "/inventario", etiqueta: "Inventario", titulo: "Gestión de inventario", icono: Table, permiso: "catalogo.gestionar" },
];

export type UsuarioNavegacion = {
    nombres: string;
    apellidos: string;
    rol: NombreRol;
    permisos: string[];
};

export const nombreDeRol: Record<NombreRol, string> = {
    ADMINISTRADOR: "Administrador",
    MOSTRADOR: "Mostrador",
    INVENTARIO: "Inventario",
};

export function enlacesPermitidos(permisos: string[]): Enlace[] {
    return enlaces.filter((e) => e.permiso === null || permisos.includes(e.permiso));
}

export function estaActivo(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
}

export function tituloDeRuta(pathname: string): string {
    return enlaces.find((e) => estaActivo(pathname, e.href))?.titulo ?? "BiblioWeb";
}

export function iniciales(nombres: string, apellidos: string): string {
    const a = nombres.trim().charAt(0);
    const b = apellidos.trim().charAt(0);
    return (a + b).toUpperCase() || "?";
}

export function nombreCompleto(u: Pick<UsuarioNavegacion, "nombres" | "apellidos">): string {
    return `${u.nombres} ${u.apellidos}`.trim();
}