import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "link" | "ghost";
type size = "sm" | "md" | "lg"

type props = ButtonHTMLAttributes<HTMLButtonElement> &{
    variant?: Variant; 
    size?: size;
    loading?: boolean;
    href?: string;
    leftIcon?: ReactNode;
    children: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
    fullWidth?: boolean;
} 


   const variants: Record<Variant, string> = {
    primary:
        "bg-[#1D5C4B] text-white shadow-[0_6px_16px_-6px_rgba(29,92,75,0.6)] hover:bg-[#174A3C] active:bg-[#123C30]",
    secondary:
        "bg-white text-[#1B2D27] border border-[#DDE4E0] hover:bg-[#F3F7F5] active:bg-[#E8F3EF]",
    ghost:
        "bg-transparent text-[#3F4F49] hover:bg-[#E8F3EF] hover:text-[#1D5C4B]",
    link: "bg-transparent text-[#1D5C4B] hover:underline",
};

    const sizes: Record<size, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "h-11 px-5 text-sm",
    };

    const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D5C4B]/40 focus-visible:ring-offset-2 " +
    "disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer select-none";

export default function Button(
   { 
    variant = "primary",
    size = "md",
    loading = false,
    href,
    leftIcon = null,
    rightIcon = null,
    fullWidth = false,
    children,
    className = "",
    disabled,
    type = "button",
    ...props
    }: props
){

    const widthStyle = fullWidth ? "w-full" : "";
    const isDisabled = disabled || loading;
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`.trim(); 
        
   const content = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </>
    );

    if(href){
         return (
      <Link
            href={href}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : undefined}
            className={`${combinedClassName} ${isDisabled ? "pointer-events-none opacity-60" : ""}`.trim()}
        >
            {content}
        </Link>
        );
    }

    return (
        <button
          type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={combinedClassName}
      {...props}
    >
      {content}
        </button>
    );
}