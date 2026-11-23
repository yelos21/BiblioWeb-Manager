"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Aquí conecta tu endpoint real de autenticación (ej. /api/auth/login)
      if (!email.trim() || !password.trim()) {
        setError("Por favor ingresa tu correo institucional y contraseña.");
        return;
      }

      // Simulación breve de autenticación
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard"); // Ajusta a la ruta de tu panel principal (02 PANEL DE INICIO)
    } catch {
      setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F9FAFB] text-[#111827]">
      {/* Columna izquierda: Identidad de BiblioWeb Manager */}
      <aside className="hidden lg:flex flex-col justify-between bg-[#111827] text-white p-10">
        <div>
          <div className="text-sm font-bold tracking-wider uppercase text-gray-300">
            BiblioWeb Manager
          </div>
          <div className="mt-16 max-w-md space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              La biblioteca, mejor organizada.
            </h1>
            <p className="text-gray-300 text-base leading-relaxed">
              Gestiona lectores, préstamos e inventario desde un solo lugar.
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-800 pt-6 text-sm text-gray-400">
          <p className="italic">“Una biblioteca es una puerta a muchas vidas.”</p>
          <p className="text-xs">
            Acceso exclusivo para personal bibliotecario autorizado
          </p>
        </div>
      </aside>

      {/* Columna derecha: Formulario de acceso del personal */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">
              Acceso del personal
            </span>
            <h2 className="mt-1 text-2xl font-bold text-[#111827]">
              Bienvenido de nuevo
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo institucional
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@biblioweb.co"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-gray-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-gray-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/15"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#111827] focus:ring-[#111827]"
                />
                <span>Recordarme</span>
              </label>

              <Link
                href="/recuperar-contrasena"
                className="font-medium text-gray-700 hover:text-[#111827] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                rightIcon={<ChevronRight size={16} />}
              >
                Iniciar sesión
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400 lg:hidden">
            Acceso exclusivo para personal bibliotecario autorizado
          </p>
        </div>
      </main>
    </div>
  );
}