"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookText, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { cambiarPassword } from "./actions";

export default function CambiarPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError("Debes ingresar tu contraseña actual.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("La nueva contraseña debe ser distinta a la actual.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const result = await cambiarPassword({
        currentPassword,
        newPassword,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white text-[#1B2D27] lg:grid-cols-[1.1fr_1fr]">
      {/* ───────── Izquierda: identidad de BiblioWeb Manager ───────── */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1D5C4B] p-12 text-white lg:flex xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-48 -top-40 h-[480px] w-[480px] rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-28 h-[340px] w-[340px] rounded-full border border-white/10"
        />

        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1D5C4B] shadow-sm">
          <BookText size={22} strokeWidth={2} />
        </div>

        <div className="relative max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A8CBC0]">
            BiblioWeb Manager
          </p>
          <h1 className="font-display mt-5 text-5xl font-normal leading-[1.05] tracking-tight xl:text-6xl">
            Tu cuenta,
            <br />
            segura y
            <br />
            actualizada.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#96C2B8]">
            Actualiza tu contraseña temporal para continuar gestionando la
            biblioteca.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-[#BFD9D1]">
          <BookText size={16} strokeWidth={1.75} className="shrink-0" />
          <p className="font-display text-sm">
            “La seguridad también es parte de una buena gestión.”
          </p>
        </div>
      </aside>

      {/* ───────── Derecha: cambio de contraseña ───────── */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
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
              Seguridad de la cuenta
            </span>
            <h2 className="font-display mt-2 text-3xl font-normal text-[#1B2D27]">
              Actualiza tu contraseña
            </h2>
            <p className="mt-2 text-sm text-[#7A8B85]">
              Por seguridad, cambia la contraseña temporal antes de continuar.
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
              id="currentPassword"
              label="Contraseña actual"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />

            <Input
              id="newPassword"
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              hint="Mínimo 8 caracteres."
              disabled={loading}
            />

            <Input
              id="confirmPassword"
              label="Confirmar nueva contraseña"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={<ChevronRight size={16} />}
            >
              Guardar nueva contraseña
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
