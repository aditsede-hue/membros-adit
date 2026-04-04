type BadgeVariant =
  | "gold"
  | "green"
  | "blue"
  | "red"
  | "gray"
  | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold:  "bg-[#fdf3d7] text-[#8b6314] border border-[#e8d5a3]",
  green: "bg-[#d4ede5] text-[#1a5c42] border border-[#a8d5c2]",
  blue:  "bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]",
  red:   "bg-[#fde8e6] text-[#9b1c1c] border border-[#fca5a5]",
  gray:  "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border)]",
  muted: "bg-transparent text-[var(--ink-muted)] border border-[var(--border)]",
};

const dotColors: Record<BadgeVariant, string> = {
  gold:  "bg-[var(--gold)]",
  green: "bg-[var(--green)]",
  blue:  "bg-[var(--blue)]",
  red:   "bg-[var(--red)]",
  gray:  "bg-[var(--ink-muted)]",
  muted: "bg-[var(--ink-muted)]",
};

export default function Badge({
  variant = "gray",
  children,
  className = "",
  dot,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={["w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant]].join(" ")}
        />
      )}
      {children}
    </span>
  );
}
