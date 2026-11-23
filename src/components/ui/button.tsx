import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type size = "sm" | "md"

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
        "bg-[#111827] text-white hover:bg-[#1f2937] focus:ring-[#111827] shadow-sm",
        secondary:
        "bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#F9FAFB] focus:ring-[#9CA3AF]",
        ghost:
        "bg-transparent text-[#374151] hover:text-[#111827] hover:bg-[#F3F4F6] focus:ring-[#9CA3AF]",
    };

    const sizes: Record<size, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    };

    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";


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
        return( <Link href={href} className= {combinedClassName}>
            {content}
        </Link> );
    }

    return (
        <button
        type={type}
        disabled={isDisabled}
        className={combinedClassName}
        {...props}
        >
        {content}
        </button>
    );
}