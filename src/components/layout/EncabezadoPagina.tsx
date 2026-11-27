import type { ReactNode } from "react";

type Props = { seccion: string; titulo: string; acciones?: ReactNode };

export default function EncabezadoPagina({ seccion, titulo, acciones }: Props) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B9E92]">
             {seccion}
            </p>
            <h1 className="font-display mt-2 text-3xl font-normal text-[#1B2D27]">{titulo}</h1>
          </div>
          {acciones}
        </div>
    );
}