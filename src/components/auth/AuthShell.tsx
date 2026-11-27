import type { ReactNode } from "react";
import { BookText } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  asideTitle: ReactNode;
  asideDescription: string;
  quote?: string;
  children: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  asideTitle,
  asideDescription,
  quote = "Una biblioteca es una puerta a muchas vidas.",
  children,
}: AuthShellProps) {
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
            {asideTitle}
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#96C2B8]">
            {asideDescription}
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-[#BFD9D1]">
          <BookText size={16} strokeWidth={1.75} className="shrink-0" />
          <p className="font-display text-sm">“{quote}”</p>
        </div>
      </aside>

      {/* ───────── Derecha: formulario ───────── */}
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
              {eyebrow}
            </span>
            <h2 className="font-display mt-2 text-3xl font-normal text-[#1B2D27]">
              {title}
            </h2>
            <p className="mt-2 text-sm text-[#7A8B85]">{description}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-[11px] text-[#A3B0AB]">
            Acceso exclusivo para personal bibliotecario autorizado
          </p>
        </div>
      </main>
    </div>
  );
}
