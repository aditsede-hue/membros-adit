"use client";

import Button from "@/components/ui/Button";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      style={{
        height: "var(--topbar-h)",
        marginLeft: "var(--sidebar-w)",
      }}
      className="fixed top-0 right-0 left-0 z-20 flex items-center justify-between gap-4 px-6 bg-[var(--surface)] border-b border-[var(--border)]"
    >
      {/* Title */}
      <div className="min-w-0">
        <h1
          className="text-lg font-semibold text-[var(--ink)] leading-tight truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--ink-muted)] leading-tight truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {actions ?? <DefaultActions />}
      </div>
    </header>
  );
}

function DefaultActions() {
  return (
    <>
      <Button variant="ghost" size="sm">
        Importar
      </Button>
      <Button variant="primary" size="sm">
        + Novo
      </Button>
      <NotificationButton />
    </>
  );
}

function NotificationButton() {
  return (
    <button className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5A5.5 5.5 0 003.5 7v3.5L2 12h14l-1.5-1.5V7A5.5 5.5 0 009 1.5zM7 12.5a2 2 0 004 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Dot indicator */}
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--red)] border-2 border-[var(--surface)]" />
    </button>
  );
}
