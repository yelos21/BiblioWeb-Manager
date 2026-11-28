import type { ReactNode } from "react";

export type TonoChip = "verde" | "rojo" | "ambar" | "gris";

const tonos: Record<TonoChip, string> = {
  verde: "bg-[#E8F1EC] text-[#1D5C4B]",
  rojo: "bg-[#FBEAEA] text-[#B42318]",
  ambar: "bg-[#FDF3E0] text-[#B54708]",
  gris: "bg-[#F0F2F1] text-[#5E6E68]",
};


export default function Chip({ tono, children }: { tono: TonoChip; children: ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  );
}