"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-[#DDE4E0] bg-white px-3 py-2 text-sm font-medium text-[#1B2D27] transition hover:bg-[#F5F8F6] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut size={16} />
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
