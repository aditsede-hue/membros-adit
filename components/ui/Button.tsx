"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] shadow-sm active:scale-[.98]",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--surface-2)] active:scale-[.98]",
  ghost:
    "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] active:scale-[.98]",
  danger:
    "bg-[var(--red)] text-white hover:opacity-90 shadow-sm active:scale-[.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8  px-3 text-xs gap-1.5 rounded-[6px]",
  md: "h-9  px-4 text-sm gap-2   rounded-[var(--radius)]",
  lg: "h-11 px-5 text-sm gap-2   rounded-[var(--radius)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      loading,
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          styles[variant],
          sizes[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
