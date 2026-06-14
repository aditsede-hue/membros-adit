interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header style={{
      height: "var(--topbar-h)",
      position: "sticky",
      top: 0,
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "0 24px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      boxShadow: "0 1px 4px rgba(15,17,23,0.06)",
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: 0, lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {actions ?? <NotificationButton />}
      </div>
    </header>
  );
}

function NotificationButton() {
  return (
    <button style={{
      width: 36, height: 36, borderRadius: "var(--radius)",
      border: "1px solid var(--border)", background: "var(--surface)",
      cursor: "pointer", color: "var(--ink-muted)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", transition: "all 0.15s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
        (e.currentTarget as HTMLElement).style.color = "var(--ink)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface)";
        (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)";
      }}
    >
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5A5.5 5.5 0 003.5 7v3.5L2 12h14l-1.5-1.5V7A5.5 5.5 0 009 1.5zM7 12.5a2 2 0 004 0"/>
      </svg>
      <span style={{
        position: "absolute", top: 7, right: 7,
        width: 7, height: 7, borderRadius: "50%",
        background: "var(--red)", border: "2px solid var(--surface)",
      }} />
    </button>
  );
}