"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const correo = email.trim();
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email: correo,
        redirectTo: "/restablecer-contrasena",
      });

      if (authError) {
        setError(
          "No se pudo procesar la solicitud. Inténtalo de nuevo en unos minutos.",
        );
        return;
      }

      setSent(true);
    } catch {
      setError(
        "No se pudo procesar la solicitud. Inténtalo de nuevo en unos minutos.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Acceso del personal"
      title="Recupera tu contraseña"
      description="Ingresa tu correo y te enviaremos un enlace para restablecerla."
      asideTitle={
        <>
          Volvamos a
          <br />
          tu biblioteca.
        </>
      }
      asideDescription="Te enviaremos un enlace seguro para que recuperes el acceso a tu cuenta."
      quote="Nunca es tarde para volver a una buena historia."
    >
      {sent ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#DDE4E0] bg-[#F5F8F6] p-5">
            <div className="flex items-center gap-2 text-[#1D5C4B]">
              <CheckCircle2 size={18} />
              <p className="text-sm font-semibold">Solicitud enviada</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#3F4F49]">
              Si el correo está registrado, recibirás un enlace para restablecer
              tu contraseña. Revisa también la carpeta de spam.
            </p>
          </div>

          <Button
            href="/login"
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver a iniciar sesión
          </Button>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="mx-auto block text-xs font-semibold text-[#1D5C4B] hover:underline"
          >
            Solicitar otro enlace
          </button>
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
              id="email"
              label="Correo"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@biblioweb.co"
              leftIcon={<Mail size={16} />}
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
              Enviar enlace de recuperación
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
