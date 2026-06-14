"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePerfil } from "@/lib/usePerfil";
import { podeAcessar, ROLE_LABEL } from "@/lib/permissoes";
import { useIgreja } from "@/lib/IgrejaProvider";

interface NavItem {
  href: string;
  label: string;
  badge?: number;
  color: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard", label: "Visão Geral", color: "#3b82f6",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5"/></svg>,
  },
  {
    href: "/membros", label: "Membros", badge: 3, color: "#1e5fa8",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.761 2.239-4 5-4s5 1.239 5 4"/><circle cx="12.5" cy="5.5" r="2"/><path d="M15 13c0-1.9-1.1-3-2.5-3.5"/></svg>,
  },
  {
    href: "/visitantes", label: "Visitantes", badge: 7, color: "#2d7a5f",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13c0-2.5 1.8-4 4-4"/><circle cx="6" cy="5" r="2.5"/><path d="M9 8.5l4.5 4.5M13.5 8.5L9 13"/></svg>,
  },
  {
    href: "/agenda", label: "Agenda", color: "#7c3aed",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/><path d="M1.5 6.5h13M5 1v3M11 1v3M5 9.5h1M8 9.5h1M11 9.5h1M5 12h1M8 12h1"/></svg>,
  },
  {
    href: "/tarefas", label: "Tarefas", color: "#d97706",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4.5l1.5 1.5L7 3M3 11.5l1.5 1.5L7 10"/><path d="M9 5h5M9 12h5"/></svg>,
  },
  {
    href: "/escalas", label: "Escalas", color: "#0891b2",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M1.5 6h13M6 1.5v13M9.5 9.5h2M9.5 12h2M3.5 9.5h1.5M3.5 12h1.5"/></svg>,
  },
  {
    href: "/documentos", label: "Documentos", color: "#64748b",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5H3.5A1.5 1.5 0 002 3v10a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0014 13V6.5L9 1.5z"/><path d="M9 1.5V6.5h5M5 9h6M5 11.5h4"/></svg>,
  },
  {
    href: "/relatorios", label: "Relatórios", color: "#16a34a",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M4.5 11V12M7.5 8v4M10.5 5.5v6.5M4.5 9l3-3 3-2"/></svg>,
  },
  {
    href: "/comunicados", label: "Comunicados", color: "#dc2626",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2.5L9.5 6H4a1.5 1.5 0 000 3h.5v3l3-3H9.5l4.5 3.5V2.5z"/></svg>,
  },
  {
    href: "/usuarios", label: "Usuários", color: "#9333ea",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"/></svg>,
  },
  {
    href: "/configuracoes", label: "Configurações", color: "#6b7280",
    icon: <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>,
  },
];

const navGroups = [
  { label: "Principal",  hrefs: ["/dashboard"] },
  { label: "Pessoas",    hrefs: ["/membros", "/visitantes"] },
  { label: "Ministério", hrefs: ["/agenda", "/escalas", "/tarefas"] },
  { label: "Gestão",     hrefs: ["/documentos", "/relatorios", "/comunicados", "/usuarios", "/configuracoes"] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { perfil } = usePerfil();
  const { config } = useIgreja();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const w = collapsed ? 64 : 240;

  const iniciais = perfil?.nome
    ? perfil.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "··";

  return (
    <aside style={{
      width: w, minWidth: w,
      position: "fixed", top: 0, left: 0, height: "100%",
      display: "flex", flexDirection: "column",
      background: "#1a1d26",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      zIndex: 30,
      transition: "width 0.25s ease",
      overflow: "hidden",
    }}>

      {/* Logo + Toggle */}
      <div style={{
        height: 64, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 14px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <img
            src={config.logo_url || "/logo-secretaria.jpeg"}
            alt={config.nome}
            style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
          />
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {config.nome || "Secretaria Geral"}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {config.subtitulo || "Assembleia de Deus"}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button onClick={onToggle} title="Recolher menu" style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            cursor: "pointer", color: "rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 2L4 6.5 9 11"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: "10px 8px",
        display: "flex", flexDirection: "column", gap: 1,
      }}>
        {navGroups.map((group) => {
          const items = navItems.filter(
            (i) => group.hrefs.includes(i.href) && podeAcessar(perfil?.role ?? null, i.href)
          );
          if (items.length === 0) return null;
          return (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <p style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.22)",
                  padding: "8px 8px 3px", margin: 0,
                }}>
                  {group.label}
                </p>
              )}
              {collapsed && <div style={{ height: 8 }} />}
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: collapsed ? 0 : 10,
                      padding: collapsed ? "7px 0" : "7px 8px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      background: active ? "#1e3a5f" : "transparent",
                      transition: "all 0.15s ease",
                      position: "relative",
                      marginBottom: 1,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                      }
                    }}
                  >
                    {active && (
                      <span style={{
                        position: "absolute", left: 0, top: "50%",
                        transform: "translateY(-50%)",
                        width: 3, height: 20, borderRadius: "0 3px 3px 0",
                        background: item.color,
                      }} />
                    )}
                    <span style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: active ? item.color : `${item.color}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: active ? "#fff" : item.color,
                      transition: "all 0.15s",
                    }}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span style={{
                        minWidth: 18, height: 18, padding: "0 5px",
                        borderRadius: 999, fontSize: 10, fontWeight: 700,
                        background: "#3b82f6", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1,
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: collapsed ? "12px 8px" : "12px 14px",
        flexShrink: 0,
      }}>
        {collapsed ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#eff6ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#1d4ed8",
            }}>
              {iniciais}
            </div>
            <button onClick={onToggle} title="Expandir menu" style={{
              width: 30, height: 30, borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              cursor: "pointer", color: "rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 2l5 4.5L4 11"/>
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "#eff6ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#1d4ed8",
            }}>
              {iniciais}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {perfil?.nome ?? "Carregando…"}
              </p>
              <p style={{ fontSize: 11, color: "#93c5fd", margin: 0, fontWeight: 500 }}>
                {perfil ? ROLE_LABEL[perfil.role] : ""}
              </p>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </aside>
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
      style={{
        width: 30, height: 30, borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        cursor: "pointer", color: "rgba(255,255,255,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)";
        (e.currentTarget as HTMLElement).style.color = "#dc2626";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.3)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2.5"/>
        <path d="M9.5 9.5L12 7l-2.5-2.5M12 7H5.5"/>
      </svg>
    </button>
  );
}
