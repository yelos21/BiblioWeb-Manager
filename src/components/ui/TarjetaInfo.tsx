import type { ReactNode } from "react";
import { Check } from "lucide-react";

type Props = {
  icono: ReactNode;
  titulo: string;
  children: ReactNode;
  nota?: string;
};


export default function TarjetaInfo({
  icono,
  titulo,
  children,
  nota = "Operación realizada por personal autorizado",
}: Props) {
  return (
    <aside className="rounded-2xl bg-[#1D5C4B] p-5 text-white shadow-sm">
      <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">{icono}</span>
      <h2 className="font-display text-xl font-normal">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#BFD9D1]">{children}</p>
      <div className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 text-xs text-[#BFD9D1]">
        <Check size={14} aria-hidden="true" className="mt-px shrink-0" />
        <span>{nota}</span>
      </div>
    </aside>
  );
}