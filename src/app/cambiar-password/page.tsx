"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
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
    <AuthShell
      eyebrow="Seguridad de la cuenta"
      title="Actualiza tu contraseña"
      description="Por seguridad, cambia la contraseña temporal antes de continuar."
      asideTitle={
        <>
          Tu cuenta,
          <br />
          segura y
          <br />
          actualizada.
        </>
      }
      asideDescription="Actualiza tu contraseña temporal para continuar gestionando la biblioteca."
      quote="La seguridad también es parte de una buena gestión."
    >
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
    </AuthShell>
  );
}
