"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--ink)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full h-10 rounded-[var(--radius)] border bg-[var(--surface)] text-[var(--ink)]",
              "text-sm placeholder:text-[var(--ink-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-0 focus:border-[var(--gold)]",
              error
                ? "border-[var(--red)] focus:ring-[var(--red)]"
                : "border-[var(--border)]",
              icon ? "pl-9 pr-3" : "px-3",
              className,
            ].join(" ")}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--red)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--ink-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
