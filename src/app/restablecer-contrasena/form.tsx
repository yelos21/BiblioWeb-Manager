"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Props = {
  token: string | null;
  tokenError: string | null;
};

export default function RestablecerContrasenaForm({
  token,
  tokenError,
}: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invalidToken = !token || Boolean(tokenError);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (invalidToken) {
      setError("El enlace no es válido o ya expiró. Solicita uno nuevo.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (authError) {
        setError(
          "El enlace no es válido o ya expiró. Solicita uno nuevo para continuar.",
        );
        return;
      }

      setDone(true);
    } catch {
      setError(
        "No se pudo restablecer la contraseña. Inténtalo de nuevo en unos minutos.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Seguridad de la cuenta"
      title={
        invalidToken
          ? "Enlace no válido"
          : done
            ? "Contraseña actualizada"
            : "Define una nueva contraseña"
      }
      description={
        invalidToken
          ? "El enlace que abriste no es válido o ya expiró."
          : done
            ? "Tu contraseña fue actualizada correctamente."
            : "Elige una contraseña segura para volver a iniciar sesión."
      }
      asideTitle={
        <>
          Un nuevo
          <br />
          comienzo,
          <br />
          seguro.
        </>
      }
      asideDescription="Restablece tu contraseña y continúa gestionando la biblioteca."
      quote="La constancia también construye bibliotecas."
    >
      {invalidToken ? (
        <div className="space-y-5">
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm leading-relaxed text-red-700"
          >
            El enlace no es válido o ya expiró. Solicita uno nuevo para
            restablecer tu contraseña.
          </div>

          <Button
            href="/recuperar-contrasena"
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<ArrowLeft size={16} />}
          >
            Solicitar un nuevo enlace
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D5C4B] hover:underline"
            >
              <ArrowLeft size={14} />
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      ) : done ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#DDE4E0] bg-[#F5F8F6] p-5">
            <div className="flex items-center gap-2 text-[#1D5C4B]">
              <CheckCircle2 size={18} />
              <p className="text-sm font-semibold">Contraseña actualizada</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#3F4F49]">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <Button
            href="/login"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ChevronRight size={16} />}
          >
            Ir a iniciar sesión
          </Button>
        </div>
      ) : (
        <>
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
              leftIcon={<LockKeyhole size={16} />}
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
              leftIcon={<ShieldCheck size={16} />}
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

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D5C4B] hover:underline"
            >
              <ArrowLeft size={14} />
              Volver a iniciar sesión
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
