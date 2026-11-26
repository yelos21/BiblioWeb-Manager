"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookText, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Aquí conecta tu autenticación real (Better Auth). Ejemplo:
      // const { error } = await authClient.signIn.email({ email, password, rememberMe });
      // if (error) { setError("Correo o contraseña incorrectos."); return; }
      if (!email.trim() || !password.trim()) {
        setError("Por favor ingresa tu correo institucional y contraseña.");
        return;
      }

      // Simulación breve de autenticación
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard"); // Panel de inicio (pantalla 02 del prototipo)
    } catch {
      setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white text-[#1B2D27] lg:grid-cols-[1.1fr_1fr]">
      {/* ───────── Izquierda: identidad de BiblioWeb Manager ───────── */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1D5C4B] p-12 text-white lg:flex xl:p-14">
        {/* Círculos decorativos del prototipo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-48 -top-40 h-[480px] w-[480px] rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-28 h-[340px] w-[340px] rounded-full border border-white/10"
        />

        {/* Logo */}
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1D5C4B] shadow-sm">
          <BookText size={22} strokeWidth={2} />
        </div>

        {/* Mensaje principal */}
        <div className="relative max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A8CBC0]">
            BiblioWeb Manager
          </p>
          <h1 className="font-display mt-5 text-5xl font-normal leading-[1.05] tracking-tight xl:text-6xl">
            La biblioteca,
            <br />
            mejor
            <br />
            organizada.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#96C2B8]">
            Gestiona lectores, préstamos e inventario desde un solo lugar.
          </p>
        </div>

        {/* Cita */}
        <div className="relative flex items-center gap-3 text-[#BFD9D1]">
          <BookText size={16} strokeWidth={1.75} className="shrink-0" />
          <p className="font-display text-sm">
            “Una biblioteca es una puerta a muchas vidas.”
          </p>
        </div>
      </aside>

      {/* ───────── Derecha: acceso del personal ───────── */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          {/* Marca compacta: solo en pantallas donde se oculta el panel verde */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D5C4B] text-white">
              <BookText size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">BiblioWeb</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7B9E92]">
                Manager
              </div>
            </div>
          </div>

          <div className="mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B9E92]">
              Acceso del personal
            </span>
            <h2 className="font-display mt-2 text-3xl font-normal text-[#1B2D27]">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm text-[#7A8B85]">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="email"
              label="Correo institucional"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@biblioweb.co"
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[#7A8B85]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-[#DDE4E0] accent-[#1D5C4B]"
                />
                <span>Recordarme</span>
              </label>

              <Link
                href="/recuperar-contrasena"
                className="font-semibold text-[#1D5C4B] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={<ChevronRight size={16} />}
            >
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#A3B0AB]">
            Acceso exclusivo para personal bibliotecario autorizado
          </p>
        </div>
      </main>
    </div>
  );
}