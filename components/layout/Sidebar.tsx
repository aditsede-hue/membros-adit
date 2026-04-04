"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/dashboard",   icon: "⛪",  label: "Visão Geral" },
  { href: "/membros",     icon: "👥",  label: "Membros",      badge: 3 },
  { href: "/celulas",     icon: "🏠",  label: "Células" },
  { href: "/visitantes",  icon: "🤝",  label: "Visitantes",   badge: 7 },
  { href: "/agenda",     icon: "📅",  label: "Agenda" },
  { href: "/financeiro",  icon: "💰",  label: "Financeiro" },
  { href: "/relatorios",  icon: "📊",  label: "Relatórios" },
  { href: "/configuracoes", icon: "⚙️", label: "Configurações" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: "var(--sidebar-w)" }}
      className="fixed top-0 left-0 h-full flex flex-col border-r border-[var(--border)] bg-[var(--surface)] z-30"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
        <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-[var(--radius)] bg-[var(--ink)]">
          <CrossIcon />
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-semibold leading-tight text-[var(--ink)] truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Campo ADIT
          </p>
          <p className="text-[11px] text-[var(--ink-muted)] leading-tight truncate">
            Assembleia de Deus
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-[#fdf3d7] text-[var(--gold-dark)]"
                  : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--red)] text-white text-[10px] font-bold leading-none">
                  {item.badge}
                </span>
              )}
              {active && (
                <span className="w-1 h-4 rounded-full bg-[var(--gold)] shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user */}
      <div className="border-t border-[var(--border)] px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name="Fagner Silva" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--ink)] truncate leading-tight">
              Fagner Silva
            </p>
            <p className="text-[11px] text-[var(--ink-muted)] leading-tight truncate">
              Administrador
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="8" y="2" width="4" height="16" rx="1.5" fill="#c9a84c" />
      <rect x="3" y="7" width="14" height="4" rx="1.5" fill="#c9a84c" />
    </svg>
  );
}

function LogoutButton() {
  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      title="Sair"
      className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--red)] transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
