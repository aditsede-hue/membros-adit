"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getTipo } from "@/lib/agenda/tipos";
import Topbar from "@/components/layout/Topbar";
import Badge from "@/components/ui/Badge";
import type { Pessoa, Evento } from "@/types";

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const FREQ_MENSAL = [72, 68, 75, 64, 70, 58, 65, 71, 68, 74, 62, 66];
const FREQ_MEDIA = Math.round(FREQ_MENSAL.reduce((a, b) => a + b, 0) / FREQ_MENSAL.length);

const FOLLOWUPS_MOCK = [
  { nome: "Roberto Alves",    obs: "Perdeu o emprego, necessitando apoio pastoral",  dias: 21 },
  { nome: "Carla Santos",     obs: "Passou por cirurgia, não voltou ao culto",        dias: 18 },
  { nome: "Família Oliveira", obs: "Sem contato após conflito familiar relatado",     dias: 14 },
];

const MINISTERIOS = [
  { nome: "Louvor",        integrantes: 18, membros: ["Ana Lima", "Carlos Souza", "Marta Costa"] },
  { nome: "Infantil",      integrantes: 24, membros: ["Beatriz Silva", "João Pedro", "Lúcia Alves"] },
  { nome: "Recepção",      integrantes: 12, membros: ["Fernando Cruz", "Patrícia Nunes", "Ricardo Rios"] },
  { nome: "Escola Bíblica", integrantes: 9, membros: ["Marcos Paulo", "Débora Lemos", "Paulo Gomes"] },
];

function formatDataPT(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatHoje(): string {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = MESES_PT[hoje.getMonth()];
  const ano = hoje.getFullYear();
  const diasSemana = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  return `${diasSemana[hoje.getDay()]}, ${dia} de ${mes} de ${ano}`;
}

function tipoLabel(tipo: Pessoa["tipo"]): { label: string; variant: "gold" | "blue" | "green" } {
  if (tipo === "membro")      return { label: "Membro",      variant: "gold"  };
  if (tipo === "em_processo") return { label: "Em Processo", variant: "blue"  };
  return                             { label: "Visitante",   variant: "green" };
}

function AvatarSimples({ nome, size = 32 }: { nome: string; size?: number }) {
  const initials = nome.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("");
  const colors = [
    ["#fdf3d7","#8b6314"], ["#d4ede5","#1a5c42"], ["#dbeafe","#1e40af"],
    ["#fce7f3","#9d174d"], ["#ede9fe","#5b21b6"], ["#fde8e6","#9b1c1c"],
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  const [bg, fg] = colors[Math.abs(hash) % colors.length];
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>{initials}</span>
  );
}

export default function DashboardPage() {
  const supabase = createClient();
  const [totalMembros,    setTotalMembros]    = useState<number | null>(null);
  const [visitantesNovos, setVisitantesNovos] = useState<number | null>(null);
  const [membrosAtivos,   setMembrosAtivos]   = useState<number | null>(null);
  const [emProcesso,      setEmProcesso]      = useState<number | null>(null);
  const [inativos,        setInativos]        = useState<number | null>(null);
  const [proxEventos,     setProxEventos]     = useState<Evento[]>([]);
  const [loadingEventos,  setLoadingEventos]  = useState(true);
  const [recentes,        setRecentes]        = useState<Pessoa[]>([]);
  const [loadingRecentes, setLoadingRecentes] = useState(true);

  useEffect(() => {
    carregarKPIs();
    carregarEventos();
    carregarRecentes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarKPIs() {
    try {
      const { count: cMembros } = await supabase.from("pessoas").select("id", { count: "exact", head: true }).eq("tipo", "membro");
      setTotalMembros(cMembros ?? 0);
      const { count: cAtivos } = await supabase.from("pessoas").select("id", { count: "exact", head: true }).eq("tipo", "membro").eq("status", "ativo");
      setMembrosAtivos(cAtivos ?? 0);
      const { count: cProcesso } = await supabase.from("pessoas").select("id", { count: "exact", head: true }).eq("tipo", "em_processo");
      setEmProcesso(cProcesso ?? 0);
      const { count: cInativos } = await supabase.from("pessoas").select("id", { count: "exact", head: true }).eq("status", "inativo");
      setInativos(cInativos ?? 0);
      const { count: cVisitantes } = await supabase.from("pessoas").select("id", { count: "exact", head: true }).eq("tipo", "visitante");
      setVisitantesNovos(cVisitantes ?? 0);
    } catch (e) { console.error("Erro KPIs:", e); }
  }

  async function carregarEventos() {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase.from("eventos").select("*").gte("data_ini", hoje).order("data_ini", { ascending: true }).limit(5);
      if (error) throw error;
      setProxEventos(data ?? []);
    } catch (e) { console.error("Erro eventos:", e); }
    finally { setLoadingEventos(false); }
  }

  async function carregarRecentes() {
    try {
      const { data, error } = await supabase.from("pessoas").select("*").order("criado_em", { ascending: false }).limit(5);
      if (error) throw error;
      setRecentes(data ?? []);
    } catch (e) { console.error("Erro recentes:", e); }
    finally { setLoadingRecentes(false); }
  }

  const totalGeral  = (totalMembros ?? 0) + (emProcesso ?? 0);
  const pctAtivos   = totalGeral > 0 ? Math.round(((membrosAtivos ?? 0) / totalGeral) * 100) : 93;
  const pctProcess  = totalGeral > 0 ? Math.round(((emProcesso   ?? 0) / totalGeral) * 100) : 5;
  const pctInativos = totalGeral > 0 ? Math.round(((inativos     ?? 0) / totalGeral) * 100) : 2;

  return (
    <>
      <Topbar title="Dashboard" subtitle={formatHoje()} actions={<span />} />
      <main style={{ paddingTop: 0 }} className="flex-1 p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="6" r="3"/><path d="M2 18c0-3.314 2.686-5 6-5s6 1.686 6 5"/><circle cx="15" cy="7" r="2.5"/><path d="M18 18c0-2.5-1.5-4-3-4.5"/></svg>}
            label="Total Membros" value={totalMembros} delta="+12 este mês" meta="Meta: 500" color="#1e5fa8" delay={0}
          />
          <KpiCard
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c0-3 2-4.5 5-4.5"/><circle cx="8" cy="6" r="3"/><path d="M12 10.5l6 6M18 10.5l-6 6"/></svg>}
            label="Visitantes Novos" value={visitantesNovos} delta="+5 esta semana" meta="Acompanhar todos" color="#2d7a5f" delay={60}
          />
          <KpiCard
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3H3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1z"/><path d="M2 8h16M7 3v5M13 3v5"/></svg>}
            label="Frequência Último Culto" value="64%" delta="312 presentes" meta="Meta: 70%" color="var(--primary)" delay={120}
          />
          <KpiCard
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2a6 6 0 00-6 6v4l-1.5 2h15L16 12V8a6 6 0 00-6-6z"/><path d="M8 16a2 2 0 004 0"/></svg>}
            label="Follow-up Pendentes" value={7} delta="3 urgentes" meta="Resolver esta semana" color="var(--primary)" delay={180}
          />
        </div>

        {/* Linha 2: Frequência + Eventos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="card p-5 lg:col-span-3 animate-fade-in" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)]">Frequência Mensal</h2>
                <p className="text-xs text-[var(--ink-muted)]">Cultos Dominicais — Média: {FREQ_MEDIA}%</p>
              </div>
              <span className="text-xs text-[var(--ink-muted)] bg-[var(--surface-2)] px-2 py-1 rounded-full border border-[var(--border)]">Últimos 12 meses</span>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 120 }}>
              {FREQ_MENSAL.map((pct, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${MESES_PT[i]}: ${pct}%`}>
                  <span className="text-[9px] text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity">{pct}%</span>
                  <div className="w-full rounded-t-[4px] transition-all duration-300 hover:opacity-80" style={{ height: `${(pct/100)*96}px`, background: pct >= 70 ? "var(--primary)" : pct >= 60 ? "#60a5fa" : "#bfdbfe", border: "1px solid #bfdbfe" }}/>
                  <span className="text-[9px] text-[var(--ink-muted)] leading-none">{MESES_CURTOS[i]}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }}/>
              <span className="text-[10px] text-[var(--ink-muted)]">Média {FREQ_MEDIA}%</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }}/>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <MiniStat label="Membros Ativos"  value={membrosAtivos ?? 451} pct={pctAtivos  || 93} color="var(--green)"/>
              <MiniStat label="Em Processo"     value={emProcesso   ?? 23}  pct={pctProcess || 5}  color="var(--blue)"/>
              <MiniStat label="Inativos"        value={inativos     ?? 13}  pct={pctInativos|| 2}  color="var(--red)"/>
            </div>
          </div>

          <div className="card p-5 lg:col-span-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink)]">Próximos Eventos</h2>
              <Link href="/agenda" className="text-xs text-[var(--primary)] hover:underline font-medium">Agenda completa →</Link>
            </div>
            {loadingEventos ? <EventosSkeleton /> : proxEventos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
                <p className="text-xs text-[var(--ink-muted)]">Nenhum evento próximo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {proxEventos.map((ev) => {
                  const cfg = getTipo(ev.tipo);
                  return (
                    <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                      <span className="text-xs text-[var(--ink-muted)] w-12 shrink-0">{formatDataPT(ev.data_ini)}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.icon} {cfg.label}</span>
                      <span className="text-xs text-[var(--ink)] truncate flex-1">{ev.titulo}</span>
                      {ev.hora && <span className="text-xs text-[var(--ink-muted)] shrink-0">{ev.hora}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Linha 3: Cadastros Recentes + Follow-up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 animate-fade-in" style={{ animationDelay: "360ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink)]">Cadastros Recentes</h2>
              <Link href="/membros" className="text-xs text-[var(--primary)] hover:underline font-medium">Ver todos →</Link>
            </div>
            {loadingRecentes ? <RecentesSkeleton /> : recentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                <p className="text-xs text-[var(--ink-muted)]">Nenhum cadastro recente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentes.map((p) => {
                  const { label, variant } = tipoLabel(p.tipo);
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                      <AvatarSimples nome={p.nome} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)] truncate">{p.nome}</p>
                        <p className="text-xs text-[var(--ink-muted)]">{new Date(p.criado_em).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                      <Badge variant={p.status === "ativo" ? "green" : "muted"} dot>{p.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5 animate-fade-in" style={{ animationDelay: "420ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink)]">Follow-up Pastoral</h2>
              <span className="text-xs bg-[#fde8e6] text-[#9b1c1c] border border-[#fca5a5] px-2 py-0.5 rounded-full font-medium">7 pendentes</span>
            </div>
            <div className="space-y-3">
              {FOLLOWUPS_MOCK.map((fu) => (
                <div key={fu.nome} className="flex items-start gap-3 p-3 rounded-[var(--radius)] bg-[var(--surface-2)] border border-[var(--border)]">
                  <AvatarSimples nome={fu.nome} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-[var(--ink)] truncate">{fu.nome}</p>
                      {fu.dias >= 14 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#fde8e6] text-[#9b1c1c] border border-[#fca5a5] shrink-0">Urgente</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] line-clamp-1">{fu.obs}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[var(--red)] leading-none">{fu.dias}</p>
                    <p className="text-[10px] text-[var(--ink-muted)]">dias</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--ink-muted)] mt-3 text-center">+ 4 outros pendentes · Follow-up completo em breve</p>
          </div>
        </div>

        {/* Ministérios */}
        <div className="animate-fade-in" style={{ animationDelay: "480ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--ink)]">Ministérios</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MINISTERIOS.map((m) => <MinisterioCard key={m.nome} {...m} />)}
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────── */

function iconBg(color: string, alpha = 0.09): string {
  if (color.startsWith("var(")) return `rgba(59,130,246,${alpha})`;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function KpiCard({ icon, label, value, delta, meta, color, delay }: {
  icon: React.ReactNode; label: string; value: number | string | null;
  delta: string; meta: string; color: string; delay: number;
}) {
  return (
    <div className="card p-5 animate-fade-in" style={{ animationDelay: `${delay}ms`, borderLeft: "3px solid var(--primary)" }}>
      <div className="flex items-start justify-between gap-3">
        <span style={{ background: iconBg(color), color }} className="w-11 h-11 rounded-[var(--radius)] flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-3xl font-bold leading-none" style={{ color }}>
            {value === null ? <span className="inline-block w-16 h-7 bg-[var(--border)] rounded animate-pulse" /> : value}
          </p>
          <p className="text-xs text-[var(--ink-muted)] mt-1 leading-tight">{label}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color }}>↑ {delta}</span>
        <span className="text-[11px] text-[var(--ink-muted)]">{meta}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div className="bg-[var(--surface-2)] rounded-[var(--radius)] p-3 border border-[var(--border)]">
      <p className="text-lg font-bold text-[var(--ink)] leading-none">{value}</p>
      <p className="text-[10px] text-[var(--ink-muted)] mt-0.5 leading-tight">{label}</p>
      <div className="mt-2 h-1 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}/>
      </div>
      <p className="text-[10px] mt-0.5" style={{ color }}>{pct}%</p>
    </div>
  );
}

function MinisterioCard({ nome, integrantes, membros }: { nome: string; integrantes: number; membros: string[] }) {
  const extras = integrantes - membros.length;
  return (
    <div className="card p-4 group relative overflow-hidden cursor-default transition-shadow hover:shadow-md">
      <div className="transition-opacity duration-200 group-hover:opacity-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center" style={{ background: iconBg("var(--primary)"), color: "var(--primary-dark)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 15c0-2.5 2-4 5-4s5 1.5 5 4"/><circle cx="13" cy="6" r="2"/><path d="M16 15c0-2-1.2-3-3-3.5"/></svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{nome}</p>
            <p className="text-xs text-[var(--ink-muted)]">{integrantes} integrantes</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mt-3">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100,(integrantes/30)*100)}%`, background: "var(--primary)" }}/>
        </div>
      </div>
      <div className="absolute inset-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[var(--surface)] flex flex-col justify-center">
        <p className="text-xs font-semibold text-[var(--ink)] mb-2">{nome}</p>
        <div className="space-y-1.5">
          {membros.map((m) => (
            <div key={m} className="flex items-center gap-2">
              <AvatarSimples nome={m} size={20} />
              <span className="text-xs text-[var(--ink)] truncate">{m}</span>
            </div>
          ))}
          {extras > 0 && <p className="text-xs text-[var(--ink-muted)] pl-6">+{extras} mais</p>}
        </div>
      </div>
    </div>
  );
}

function EventosSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-12 h-3 bg-[var(--border)] rounded animate-pulse"/>
          <div className="w-20 h-5 bg-[var(--border)] rounded-full animate-pulse"/>
          <div className="flex-1 h-3 bg-[var(--border)] rounded animate-pulse"/>
        </div>
      ))}
    </div>
  );
}

function RecentesSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse shrink-0"/>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-[var(--border)] rounded w-32 animate-pulse"/>
            <div className="h-2.5 bg-[var(--border)] rounded w-20 animate-pulse"/>
          </div>
          <div className="w-16 h-5 bg-[var(--border)] rounded-full animate-pulse"/>
        </div>
      ))}
    </div>
  );
}