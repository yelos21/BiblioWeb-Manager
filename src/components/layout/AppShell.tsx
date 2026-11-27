"use client";

import { useState, type ReactNode } from "react";
import Navbar from "./Navbar";
import Topbar from "./Topbar";
import type { UsuarioNavegacion } from "./navegacion";

export default function AppShell({ usuario, children }: { usuario: UsuarioNavegacion;
    children: ReactNode }) {
        const [menuAbierto, setMenuAbierto] = useState(false);
        return (
            <div className="flex min-h-screen bg-[#F6F4EF] text-[#1B2D27]">
      <Navbar usuario={usuario} abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} />
      {}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar usuario={usuario} alAbrirMenu={() => setMenuAbierto(true)} />
        {}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>

        <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-4 pb-6 text-[11px] text-[#A3B0AB] sm:px-8">
          <span>© 2026 BiblioWeb Manager</span>
          <span>Operación exclusiva del personal bibliotecario</span>
        </footer>
      </div>
    </div>
        )
    }