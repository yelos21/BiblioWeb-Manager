"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { iniciales, nombreCompleto, nombreDeRol, tituloDeRuta, type UsuarioNavegacion } from "./navegacion";

type TopbarProps = { usuario: UsuarioNavegacion; alAbrirMenu: () => void };

export default function Topbar({ usuario, alAbrirMenu }: TopbarProps) {
    const pathname = usePathname();
    const [busqueda, setBusqueda] = useState("");
    function enviarBusqueda(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    return (
        <button
          type="butto"
          onClick={alAbrirMenu}
          arial-label="Abrir menu"
          className="-ml-1 rounded-lg p-2 text-[#7A8B85] hover:bg-[#F3F7F5] lg:hidden"
        >
          <Menu size={22} />
        </button>

        {}
        <nav aria-label="Migas de pan" className="min-w-0 flex-1">
        <ol className="flex items-center gap-2 text-sm">
          <li className="hidden sm:block">
            <Link href="/dashboard" className="text-[#7A8B85] hover:text-[#1B2D27]">BiblioWeb</Link>
          </li>
          <li aria-hidden="true" className="hidden text-[#A3B0AB] sm:block">/</li>
          <li aria-current="page" className="truncate font-semibold text-[#1B2D27]">
            {tituloDeRuta(pathname)}
          </li>
        </ol>
      </nav>

      <form onSubmit={enviarBusqueda} role="search" className="relative hidden w-64 md:block">
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8A2]" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en BiblioWeb..."
          aria-label="Buscar en BiblioWeb"
          className="h-10 w-full rounded-xl border border-[#DDE4E0] bg-[#F6F4EF] pl-10 pr-3 text-sm text-[#1B2D27] placeholder:text-[#9AA8A2] focus:border-[#1D5C4B] focus:outline-none focus:ring-2 focus:ring-[#1D5C4B]/15"
        />
      </form>

      <button
        type="button"
        aria-label="Notificaciones"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE4E0] bg-white text-[#7A8B85] hover:bg-[#F3F7F5]"
      >
        <Bell size={18} />
      </button>

      <span aria-hidden="true" className="hidden h-8 w-px bg-[#DDE4E0] sm:block" />

      <div className="flex items-center gap-3">
        <Avatar iniciales={iniciales(usuario.nombres, usuario.apellidos)} className="h-10 w-10" />
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-sm font-semibold text-[#1B2D27]">{nombreCompleto(usuario)}</p>
          <p className="text-xs text-[#7A8B85]">{nombreDeRol[usuario.rol]}</p>
        </div>
      </div>
    </header>
    );
}