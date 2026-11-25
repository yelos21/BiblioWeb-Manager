import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
};

// Campo de formulario del prototipo P14: etiqueta en negritas pequeñas,
// caja blanca de borde suave y foco verde.
export default function Input({
  label,
  hint,
  error,
  leftIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold text-[#3F4F49]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 inline-flex items-center text-[#9AA8A2]">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={
            `h-11 w-full rounded-lg border bg-white text-sm text-[#1B2D27] placeholder:text-[#B5C0BB] ` +
            `transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F3F7F5] disabled:text-[#9AA8A2] ` +
            `${leftIcon ? "pl-10 pr-3.5" : "px-3.5"} ` +
            `${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
              : "border-[#DDE4E0] focus:border-[#1D5C4B] focus:ring-[#1D5C4B]/15"} ${className}`
          }
          {...props}
        />
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-[#7A8B85]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}