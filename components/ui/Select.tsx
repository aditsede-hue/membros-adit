"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, options, className = "", id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[var(--ink)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              "w-full h-10 rounded-[var(--radius)] border bg-[var(--surface)] text-[var(--ink)]",
              "text-sm appearance-none px-3 pr-8 cursor-pointer",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]",
              error
                ? "border-[var(--red)] focus:ring-[var(--red)]"
                : "border-[var(--border)]",
              className,
            ].join(" ")}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ink-muted)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--ink-muted)]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
