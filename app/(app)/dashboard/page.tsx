"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getTipo } from "@/lib/agenda/tipos";
import Topbar from "@/components/layout/Topbar";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { Pessoa, Evento } from "@/types";

// ── Dados mockados ────────────────────────────────────────────────────────────

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_PT     = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// Percentuais de frequência dos últimos 12 meses (mock)
const FREQ_MENSAL = [72, 68, 75, 64, 70, 58, 65, 71, 68, 74, 62, 66];
const FREQ_MEDIA  = Math.round(FREQ_MENSAL.reduce((a, b) => a + b, 0) / FREQ_MENSAL.length);

const FOLLOWUPS_MOCK = [
  { nome: "Roberto Alves",     obs: "Perdeu o emprego, necessitando apoio pastoral",    dias: 21 },
  { nome: "Carla Santos",      obs: "Passou por cirurgia, não voltou ao culto",          dias: 18 },
  { nome: "Família Oliveira",  obs: "Sem contato após conflito familiar relatado",       dias: 14 },
];

const MINISTERIOS = [
  { icon: "🎵", nome: "Louvor",        integrantes: 18, membros: ["Ana Lima", "Carlos Souza", "Marta Costa"] },
  { icon: "👶", nome: "Infantil",      integrantes: 24, membros: ["Beatriz Silva", "João Pedro", "Lúcia Alves"] },
  { icon: "🤝", nome: "Recepção",      integrantes: 12, membros: ["Fernando Cruz", "Patrícia Nunes", "Ricardo Rios"] },
  { icon: "📖", nome: "Escola Bíblica", integrantes: 9, membros: ["Marcos Paulo", "Débora Lemos", "Paulo Gomes"] },
];

// ── Utilitários ───────────────────────────────────────────────────────────────

function formatDataPT(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatHoje(): string {
  const hoje = new Date();
  const dia  = String(hoje.getDate()).padStart(2, "0");
  const mes  = MESES_PT[hoje.getMonth()];
  const ano  = hoje.getFullYear();
  const diasSemana = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  const semana = diasSemana[hoje.getDay()];
  return `${semana}, ${dia} de ${mes} de ${ano}`;
}

function tipoLabel(tipo: Pessoa["tipo"]): { label: string; variant: "gold" | "blue" | "green" } {
  if (tipo === "membro")      return { label: "Membro",      variant: "gold"  };
  if (tipo === "em_processo") return { label: "Em Processo", variant: "blue"  };
  return                             { label: "Visitante",   variant: "green" };
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const supabase = createClient();

  // KPI counts
  const [totalMembros,    setTotalMembros]    = useState<number | null>(null);
  const [visitantesNovos, setVisitantesNovos] = useState<number | null>(null);
  const [membrosAtivos,   setMembrosAtivos]   = useState<number | null>(null);
  const [emProcesso,      setEmProcesso]      = useState<number | null>(null);
  const [inativos,        setInativos]        = useState<number | null>(null);

  // Eventos
  const [proxEventos,     setProxEventos]     = useState<Evento[]>([]);
  const [loadingEventos,  setLoadingEventos]  = useState(true);

  // Cadastros recentes
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
      // Total membros
      const { count: cMembros } = await supabase
        .from("pessoas").select("id", { count: "exact", head: true })
        .eq("tipo", "membro");
      setTotalMembros(cMembros ?? 0);

      // Membros ativos
      const { count: cAtivos } = await supabase
        .from("pessoas").select("id", { count: "exact", head: true })
        .eq("tipo", "membro").eq("status", "ativo");
      setMembrosAtivos(cAtivos ?? 0);

      // Em processo
      const { count: cProcesso } = await supabase
        .from("pessoas").select("id", { count: "exact", head: true })
        .eq("tipo", "em_processo");
      setEmProcesso(cProcesso ?? 0);

      // Inativos
      const { count: cInativos } = await supabase
        .from("pessoas").select("id", { count: "exact", head: true })
        .eq("status", "inativo");
      setInativos(cInativos ?? 0);

      // Visitantes (tipo = visitante)
      const { count: cVisitantes } = await supabase
        .from("pessoas").select("id", { count: "exact", head: true })
        .eq("tipo", "visitante");
      setVisitantesNovos(cVisitantes ?? 0);

    } catch (e) {
      console.error("Erro ao carregar KPIs:", e);
    }
  }

  async function carregarEventos() {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .gte("data_ini", hoje)
        .order("data_ini", { ascending: true })
        .limit(5);
      if (error) throw error;
      setProxEventos(data ?? []);
    } catch (e) {
      console.error("Erro ao carregar eventos:", e);
    } finally {
      setLoadingEventos(false);
    }
  }

  async function carregarRecentes() {
    try {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentes(data ?? []);
    } catch (e) {
      console.error("Erro ao carregar recentes:", e);
    } finally {
      setLoadingRecentes(false);
    }
  }

  // Totais para mini-cards abaixo do gráfico
  const totalGeral = (totalMembros ?? 0) + (emProcesso ?? 0);
  const pctAtivos  = totalGeral > 0 ? Math.round(((membrosAtivos ?? 0) / totalGeral) * 100) : 93;
  const pctProcess = totalGeral > 0 ? Math.round(((emProcesso   ?? 0) / totalGeral) * 100) : 5;
  const pctInativos= totalGeral > 0 ? Math.round(((inativos     ?? 0) / totalGeral) * 100) : 2;

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={formatHoje()}
        actions={<span />}
      />

      <main
        style={{ paddingTop: "var(--topbar-h)" }}
        className="flex-1 p-6 space-y-6"
      >
        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon="👥"
            label="Total Membros"
            value={totalMembros}
            delta="+12 este mês"
            meta="Meta: 500"
            color="var(--gold)"
            delay={0}
          />
          <KpiCard
            icon="🙋"
            label="Visitantes Novos"
            value={visitantesNovos}
            delta="+5 esta semana"
            meta="Acompanhar todos"
            color="var(--green)"
            delay={60}
          />
          <KpiCard
            icon="✝️"
            label="Frequência Último Culto"
            value="64%"
            delta="312 presentes"
            meta="Meta: 70%"
            color="var(--blue)"
            delay={120}
          />
          <KpiCard
            icon="⚠️"
            label="Follow-up Pendentes"
            value={7}
            delta="3 urgentes"
            meta="Resolver esta semana"
            color="var(--red)"
            delay={180}
          />
        </div>

        {/* ── Linha 2: Frequência + Eventos ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Frequência Mensal */}
          <div
            className="card p-5 lg:col-span-3 animate-fade-in"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)]"
                  style={{ fontFamily: "var(--font-display)" }}>
                  Frequência Mensal
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">Cultos Dominicais — Média: {FREQ_MEDIA}%</p>
              </div>
              <span className="text-xs text-[var(--ink-muted)] bg-[var(--surface-2)] px-2 py-1 rounded-full border border-[var(--border)]">
                Últimos 12 meses
              </span>
            </div>

            {/* Gráfico de barras */}
            <div className="flex items-end gap-1.5" style={{ height: 120 }}>
              {FREQ_MENSAL.map((pct, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${MESES_PT[i]}: ${pct}%`}>
                  <span className="text-[9px] text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {pct}%
                  </span>
                  <div
                    className="w-full rounded-t-[4px] transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${(pct / 100) * 96}px`,
                      background: pct >= 70
                        ? "var(--gold)"
                        : pct >= 60
                        ? "var(--gold-light)"
                        : "#e8d5a3",
                      border: "1px solid var(--gold-light)",
                    }}
                  />
                  <span className="text-[9px] text-[var(--ink-muted)] leading-none">{MESES_CURTOS[i]}</span>
                </div>
              ))}
            </div>

            {/* Linha de média */}
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-[10px] text-[var(--ink-muted)]">Média {FREQ_MEDIA}%</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Mini-cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <MiniStat
                label="Membros Ativos"
                value={membrosAtivos ?? 451}
                pct={pctAtivos || 93}
                color="var(--green)"
              />
              <MiniStat
                label="Em Processo"
                value={emProcesso ?? 23}
                pct={pctProcess || 5}
                color="var(--blue)"
              />
              <MiniStat
                label="Inativos"
                value={inativos ?? 13}
                pct={pctInativos || 2}
                color="var(--red)"
              />
            </div>
          </div>

          {/* Próximos Eventos */}
          <div
            className="card p-5 lg:col-span-2 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}>
                Próximos Eventos
              </h2>
              <Link
                href="/agenda"
                className="text-xs text-[var(--gold-dark)] hover:underline font-medium"
              >
                Agenda completa →
              </Link>
            </div>

            {loadingEventos ? (
              <EventosSkeleton />
            ) : proxEventos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <span className="text-2xl">📅</span>
                <p className="text-xs text-[var(--ink-muted)]">Nenhum evento próximo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {proxEventos.map((ev) => {
                  const cfg = getTipo(ev.tipo);
                  return (
                    <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                      <span className="text-xs text-[var(--ink-muted)] w-12 shrink-0">
                        {formatDataPT(ev.data_ini)}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: cfg.bg, color: cfg.cor }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="text-xs text-[var(--ink)] truncate flex-1">{ev.titulo}</span>
                      {ev.hora && (
                        <span className="text-xs text-[var(--ink-muted)] shrink-0">{ev.hora}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Linha 3: Cadastros Recentes + Follow-up ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Cadastros Recentes */}
          <div
            className="card p-5 animate-fade-in"
            style={{ animationDelay: "360ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}>
                Cadastros Recentes
              </h2>
              <Link
                href="/membros"
                className="text-xs text-[var(--gold-dark)] hover:underline font-medium"
              >
                Ver todos →
              </Link>
            </div>

            {loadingRecentes ? (
              <RecentesSkeleton />
            ) : recentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <span className="text-2xl">👥</span>
                <p className="text-xs text-[var(--ink-muted)]">Nenhum cadastro recente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentes.map((p) => {
                  const { label, variant } = tipoLabel(p.tipo);
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                      <Avatar name={p.nome} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)] truncate">{p.nome}</p>
                        <p className="text-xs text-[var(--ink-muted)]">
                          {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                      <Badge variant={p.status === "ativo" ? "green" : "muted"} dot>
                        {p.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Follow-up Pastoral */}
          <div
            className="card p-5 animate-fade-in"
            style={{ animationDelay: "420ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}>
                Follow-up Pastoral
              </h2>
              <span className="text-xs text-[var(--ink-muted)] bg-[#fde8e6] text-[#9b1c1c] border border-[#fca5a5] px-2 py-0.5 rounded-full font-medium">
                7 pendentes
              </span>
            </div>

            <div className="space-y-3">
              {FOLLOWUPS_MOCK.map((fu) => (
                <div key={fu.nome} className="flex items-start gap-3 p-3 rounded-[var(--radius)] bg-[var(--surface-2)] border border-[var(--border)]">
                  <Avatar name={fu.nome} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-[var(--ink)] truncate">{fu.nome}</p>
                      {fu.dias >= 14 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#fde8e6] text-[#9b1c1c] border border-[#fca5a5] shrink-0">
                          ⚠️ Urgente
                        </span>
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

            <p className="text-xs text-[var(--ink-muted)] mt-3 text-center">
              + 4 outros pendentes · Follow-up completo em breve
            </p>
          </div>
        </div>

        {/* ── Ministérios ───────────────────────────────────────────────── */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: "480ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}>
              Ministérios
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MINISTERIOS.map((m) => (
              <MinisterioCard key={m.nome} {...m} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, delta, meta, color, delay,
}: {
  icon: string;
  label: string;
  value: number | string | null;
  delta: string;
  meta: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="card p-5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          style={{ background: color + "18", color }}
          className="w-11 h-11 rounded-[var(--radius)] flex items-center justify-center text-xl shrink-0"
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0 text-right">
          <p
            className="text-3xl font-bold leading-none"
            style={{ color, fontFamily: "var(--font-display)" }}
          >
            {value === null ? (
              <span className="inline-block w-16 h-7 bg-[var(--border)] rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
          <p className="text-xs text-[var(--ink-muted)] mt-1 leading-tight">{label}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color }}>
          ↑ {delta}
        </span>
        <span className="text-[11px] text-[var(--ink-muted)]">{meta}</span>
      </div>
    </div>
  );
}

function MiniStat({
  label, value, pct, color,
}: {
  label: string; value: number; pct: number; color: string;
}) {
  return (
    <div className="bg-[var(--surface-2)] rounded-[var(--radius)] p-3 border border-[var(--border)]">
      <p className="text-lg font-bold text-[var(--ink)] leading-none">{value}</p>
      <p className="text-[10px] text-[var(--ink-muted)] mt-0.5 leading-tight">{label}</p>
      <div className="mt-2 h-1 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-[10px] mt-0.5" style={{ color }}>{pct}%</p>
    </div>
  );
}

function MinisterioCard({
  icon, nome, integrantes, membros,
}: {
  icon: string; nome: string; integrantes: number; membros: string[];
}) {
  const extras = integrantes - membros.length;

  return (
    <div className="card p-4 group relative overflow-hidden cursor-default transition-shadow hover:shadow-md">
      {/* Conteúdo padrão */}
      <div className="transition-opacity duration-200 group-hover:opacity-0">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center text-xl"
            style={{ background: "var(--gold)" + "18" }}
          >
            {icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{nome}</p>
            <p className="text-xs text-[var(--ink-muted)]">{integrantes} integrantes</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mt-3">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, (integrantes / 30) * 100)}%`, background: "var(--gold)" }}
          />
        </div>
      </div>

      {/* Overlay no hover */}
      <div className="absolute inset-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[var(--surface)] flex flex-col justify-center">
        <p className="text-xs font-semibold text-[var(--ink)] mb-2">{icon} {nome}</p>
        <div className="space-y-1.5">
          {membros.map((m) => (
            <div key={m} className="flex items-center gap-2">
              <Avatar name={m} size="xs" />
              <span className="text-xs text-[var(--ink)] truncate">{m}</span>
            </div>
          ))}
          {extras > 0 && (
            <p className="text-xs text-[var(--ink-muted)] pl-8">+{extras} mais</p>
          )}
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
          <div className="w-12 h-3 bg-[var(--border)] rounded animate-pulse" />
          <div className="w-20 h-5 bg-[var(--border)] rounded-full animate-pulse" />
          <div className="flex-1 h-3 bg-[var(--border)] rounded animate-pulse" />
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
          <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-[var(--border)] rounded w-32 animate-pulse" />
            <div className="h-2.5 bg-[var(--border)] rounded w-20 animate-pulse" />
          </div>
          <div className="w-16 h-5 bg-[var(--border)] rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}
