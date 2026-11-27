"use client"

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import Avatar from "@/components/ui/Avatar";
import {
  enlacesPermitidos,
  estaActivo,
  iniciales,
  nombreCompleto,
  nombreDeRol,
  type Enlace,
  type UsuarioNavegacion,
} from "./navegacion";

function Marca() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D5C4B] text-white shadow-sm">
        <BookText size={20} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="font-display block text-lg font-semibold text-[#1B2D27]">BiblioWeb</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7B9E92]">
          Manager
        </span>
      </span>
    </Link>
  );
}

type ListaProps = { items: Enlace[]; pathname: string; alNavegar?: () => void };

function ListaEnlaces({ items, pathname, alNavegar }: ListaProps) {
    return (
        <ul className="flex flex-col gap-1">
      {}
      {items.map(({ href, etiqueta, icono: Icono }) => {
        const activo = estaActivo(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={alNavegar}
              aria-current={activo ? "page" : undefined}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors " +
                (activo
                  ? "bg-[#E8F1EC] font-semibold text-[#1D5C4B]"
                  : "text-[#7A8B85] hover:bg-[#F3F7F5] hover:text-[#1B2D27]")
              }
            >
              <Icono size={18} aria-hidden="true" />
              {etiqueta}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function TarjetaAyuda() {
  return (
    <div className="rounded-2xl bg-[#F3F6F4] p-4">
      <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1D5C4B]">
        <BookText size={16} aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-[#1B2D27]">¿Necesitas ayuda?</p>
      <p className="mt-0.5 text-xs text-[#7A8B85]">Consulta la guía del sistema.</p>
      <Link href="/documentacion" className="mt-3 inline-block text-xs font-semibold text-[#1D5C4B] hover:underline">
        Ver documentación
      </Link>
    </div>
  );
}

function PerfilUsuario({ usuario }: { usuario: UsuarioNavegacion }) {
  return (
    <div className="flex items-center gap-3 border-t border-[#DDE4E0] pt-4">
      <Avatar iniciales={iniciales(usuario.nombres, usuario.apellidos)} className="h-10 w-10" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#1B2D27]">{nombreCompleto(usuario)}</p>
        <p className="truncate text-xs text-[#7A8B85]">{nombreDeRol[usuario.rol]}</p>
      </div>
      <LogoutButton soloIcono />
    </div>
  );
}

function ContenidoMenu({ usuario, alNavegar }: { usuario: UsuarioNavegacion; alNavegar?: () => void }) {
  const pathname = usePathname(); // ruta actual, p. ej. "/prestamos"
  const visibles = enlacesPermitidos(usuario.permisos);

  return (
    <div className="flex h-full flex-col gap-6">
      <Marca />
      <nav aria-label="Navegación principal" className="flex-1">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A3B0AB]">
          Menú principal
        </p>
        <ListaEnlaces items={visibles} pathname={pathname} alNavegar={alNavegar} />
      </nav>
      <TarjetaAyuda />
      <PerfilUsuario usuario={usuario} />
    </div>
  );
}

type NavbarProps = { usuario: UsuarioNavegacion; abierto: boolean; alCerrar: () => void };

export default function Navbar({ usuario, abierto, alCerrar }: NavbarProps) {
    useEffect(() => {
    if (!abierto) return;
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") alCerrar();
    }
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, alCerrar]);

  return (
    <>
      {}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#DDE4E0] bg-white p-5 lg:block">
        <ContenidoMenu usuario={usuario} />
      </aside>

      {}
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={alCerrar}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative h-full w-72 max-w-[85%] overflow-y-auto bg-white p-5 shadow-xl">
            <ContenidoMenu usuario={usuario} alNavegar={alCerrar} />
          </aside>
        </div>
      )}
    </>
  );
}