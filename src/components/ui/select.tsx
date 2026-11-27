import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOpcion = { valor: string; etiqueta: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  opciones: SelectOpcion[];
};


export default function Select({
  label,
  hint,
  error,
  placeholder = "Seleccionar",
  opciones,
  className = "",
  id,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs font-semibold text-[#3F4F49]">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={
            `h-11 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-10 text-sm text-[#1B2D27] ` +
            `transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F3F7F5] disabled:text-[#9AA8A2] ` +
            `${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
              : "border-[#DDE4E0] focus:border-[#1D5C4B] focus:ring-[#1D5C4B]/15"} ${className}`
          }
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA8A2]"
        />
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-[#7A8B85]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}