"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPessoas } from "@/lib/db/pessoas";
import { getTarefas } from "@/lib/db/tarefas";
import Topbar from "@/components/layout/Topbar";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { Pessoa, Tarefa } from "@/types";

// ── Constantes & Mock ─────────────────────────────────────────────────────────

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const CRESCIMENTO_ANUAL = [
  { mes: "Mai/25", membros: 450, visitantes: 38 },
  { mes: "Jun/25", membros: 452, visitantes: 42 },
  { mes: "Jul/25", membros: 458, visitantes: 31 },
  { mes: "Ago/25", membros: 461, visitantes: 45 },
  { mes: "Set/25", membros: 465, visitantes: 39 },
  { mes: "Out/25", membros: 468, visitantes: 52 },
  { mes: "Nov/25", membros: 471, visitantes: 28 },
  { mes: "Dez/25", membros: 475, visitantes: 61 },
  { mes: "Jan/26", membros: 477, visitantes: 35 },
  { mes: "Fev/26", membros: 480, visitantes: 40 },
  { mes: "Mar/26", membros: 484, visitantes: 34 },
  { mes: "Abr/26", membros: 487, visitantes: 34 },
];

const FREQUENCIA_SEMANAL = [
  { semana: "09/02", presentes: 295, total: 488 },
  { semana: "16/02", presentes: 312, total: 488 },
  { semana: "23/02", presentes: 328, total: 488 },
  { semana: "02/03", presentes: 341, total: 488 },
  { semana: "09/03", presentes: 298, total: 488 },
  { semana: "16/03", presentes: 352, total: 488 },
  { semana: "23/03", presentes: 320, total: 488 },
  { semana: "30/03", presentes: 312, total: 488 },
];

const MINISTERIOS = [
  { icon: "🎵", nome: "Louvor",         cor: "#c9a84c", integrantes: 18, membros: ["Ana Lima", "Carlos Souza", "Marta Costa"] },
  { icon: "👶", nome: "Infantil",       cor: "#1e5fa8", integrantes: 24, membros: ["Beatriz Silva", "João Pedro", "Lúcia Alves"] },
  { icon: "🤝", nome: "Recepção",       cor: "#2d7a5f", integrantes: 12, membros: ["Fernando Cruz", "Patrícia Nunes", "Ricardo Rios"] },
  { icon: "📖", nome: "Escola Bíblica", cor: "#7c3d8a", integrantes:  9, membros: ["Marcos Paulo", "Débora Lemos", "Paulo Gomes"] },
];

type Aniversariante = {
  nome: string;
  dia: number;
  idade: number;
  tipo: string;
  contato: string;
};

const ANIVERSARIANTES_MOCK: Aniversariante[] = [
  { nome: "Ana Paula Lima",    dia: 3,  idade: 28, tipo: "membro",    contato: "(61) 99123-4567" },
  { nome: "Carlos Eduardo",    dia: 7,  idade: 35, tipo: "membro",    contato: "(61) 98765-4321" },
  { nome: "Marta Costa",       dia: 12, idade: 42, tipo: "membro",    contato: "(61) 97654-3210" },
  { nome: "João Pedro Santos", dia: 15, idade: 8,  tipo: "visitante", contato: "(61) 96543-2109" },
  { nome: "Lúcia Ferreira",    dia: 19, idade: 61, tipo: "membro",    contato: "(61) 95432-1098" },
  { nome: "Roberto Alves",     dia: 24, idade: 29, tipo: "membro",    contato: "(61) 94321-0987" },
  { nome: "Sandra Oliveira",   dia: 28, idade: 47, tipo: "visitante", contato: "(61) 93210-9876" },
];

const RESPONSAVEIS_CORES: Record<string, string> = {
  "Fagner Silva":   "var(--gold)",
  "Lisandra Souza": "var(--blue)",
  "Adriana Lima":   "var(--green)",
  "Marco Aurélio":  "var(--red)",
};

type RelatorioId = "crescimento" | "frequencia" | "aniversariantes" | "ministerios" | "produtividade";
type Periodo = "mes" | "tri" | "sem" | "ano";

const RELATORIOS_GRID = [
  { id: "crescimento"    as RelatorioId, icon: "📈", titulo: "Crescimento Mensal",     desc: "Evolução de membros e visitantes ao longo do tempo",   cor: "var(--green)",  bg: "#d4ede5" },
  { id: "frequencia"     as RelatorioId, icon: "⛪", titulo: "Frequência nos Cultos",  desc: "Taxa de presença nos cultos dominicais por semana",     cor: "var(--blue)",   bg: "#dbeafe" },
  { id: "aniversariantes"as RelatorioId, icon: "🎂", titulo: "Aniversariantes do Mês", desc: "Lista de aniversariantes para mensagens e celebrações", cor: "#d97706",       bg: "#fef3c7" },
  { id: "ministerios"    as RelatorioId, icon: "⚙️", titulo: "Membros por Ministério", desc: "Distribuição de integrantes em cada ministério",        cor: "var(--gold)",   bg: "#fdf3d7" },
  { id: "produtividade"  as RelatorioId, icon: "🏆", titulo: "Produtividade da Equipe",desc: "Tarefas criadas, concluídas e taxa de conclusão",       cor: "var(--red)",    bg: "#fde8e6" },
];

const CORTES: Record<Periodo, number> = { mes: 1, tri: 3, sem: 6, ano: 12 };
const CORTES_FREQ: Record<Periodo, number> = { mes: 2, tri: 4, sem: 6, ano: 8 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function pctFreq(f: { presentes: number; total: number }) {
  return Math.round((f.presentes / f.total) * 100);
}

function crescimentoPct(atual: number, anterior: number) {
  if (!anterior) return 0;
  return ((atual - anterior) / anterior * 100).toFixed(1);
}

function formatDataHoje() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function mesAtual() {
  return MESES_PT[new Date().getMonth()];
}

// ── Gráfico de Linha (SVG) ────────────────────────────────────────────────────

function GraficoLinha({ series, labels }: {
  series: Array<{ label: string; color: string; data: number[] }>;
  labels: string[];
}) {
  const W = 560, H = 180;
  const P = { t: 12, r: 16, b: 28, l: 52 };
  const pw = W - P.l - P.r;
  const ph = H - P.t - P.b;

  const allVals = series.flatMap((s) => s.data);
  const mn = Math.min(...allVals);
  const mx = Math.max(...allVals);
  const rng = mx - mn || 1;

  const xp = (i: number) =>
    labels.length < 2 ? P.l + pw / 2 : P.l + (i / (labels.length - 1)) * pw;
  const yp = (v: number) => P.t + ph - ((v - mn) / rng) * ph;

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(mn + t * rng));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid lines */}
      {gridVals.map((v) => {
        const yy = yp(v);
        return (
          <g key={v}>
            <line x1={P.l} y1={yy} x2={W - P.r} y2={yy}
              stroke="#e8e3d8" strokeWidth={0.5} />
            <text x={P.l - 4} y={yy + 3.5} textAnchor="end"
              fontSize={8} fill="#6b7280">{v}</text>
          </g>
        );
      })}

      {/* Lines + dots */}
      {series.map((s) => {
        const pts = s.data.map((v, i) => `${xp(i)},${yp(v)}`).join(" ");
        return (
          <g key={s.label}>
            <polyline points={pts} fill="none"
              stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
            {s.data.map((v, i) => (
              <circle key={i} cx={xp(i)} cy={yp(v)} r={3}
                fill={s.color} stroke="white" strokeWidth={1.5} />
            ))}
          </g>
        );
      })}

      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={xp(i)} y={H - 4} textAnchor="middle"
          fontSize={7.5} fill="#6b7280">{l}</text>
      ))}
    </svg>
  );
}

// ── Gráfico de Barras (CSS) ───────────────────────────────────────────────────

function GraficoBarra({ dados, meta }: {
  dados: Array<{ label: string; pct: number; presentes: number }>;
  meta?: number;
}) {
  const maxH = 120;
  return (
    <div className="relative">
      {/* Linha de meta */}
      {meta && (
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-[var(--red)] z-10"
          style={{ bottom: 20 + (meta / 100) * maxH, marginLeft: 8, marginRight: 8 }}
        >
          <span className="absolute right-0 -top-4 text-[9px] text-[var(--red)] font-semibold bg-white px-1">
            Meta {meta}%
          </span>
        </div>
      )}

      <div className="flex items-end gap-1.5" style={{ height: maxH + 24 }}>
        {dados.map((d) => {
          const abaixoMeta = meta && d.pct < meta;
          const cor = abaixoMeta ? "var(--red)" : "var(--gold)";
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group"
              title={`${d.label}: ${d.pct}% (${d.presentes} presentes)`}>
              <span className="text-[9px] text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                {d.pct}%
              </span>
              <div
                className="w-full rounded-t-[3px] transition-all duration-300"
                style={{ height: (d.pct / 100) * maxH, background: cor, minHeight: 4 }}
              />
              <span className="text-[8px] text-[var(--ink-muted)] leading-none">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Gráfico Donut (SVG) ───────────────────────────────────────────────────────

function DonutChart({ pct, cor }: { pct: number; cor: string }) {
  const r = 22, cx = 28, cy = 28;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e3d8" strokeWidth={7} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={7}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fontWeight="700" fill={cor}>
        {pct}%
      </text>
    </svg>
  );
}

// ── Gráfico Horizontal (CSS) ──────────────────────────────────────────────────

function BarraHorizontal({ valor, maximo, cor, label }: {
  valor: number; maximo: number; cor: string; label: string;
}) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--ink-muted)] w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]">
        <div
          className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${pct}%`, background: cor, minWidth: 20 }}
        >
          <span className="text-[9px] text-white font-semibold">{valor}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[var(--ink)] w-8 text-right shrink-0">{pct}%</span>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const supabase = createClient();

  const [relatorio,   setRelatorio]   = useState<RelatorioId | null>(null);
  const [periodo,     setPeriodo]     = useState<Periodo>("ano");
  const [loading,     setLoading]     = useState(true);

  // Dados do banco
  const [totalMembros,    setTotalMembros]    = useState(0);
  const [totalVisitantes, setTotalVisitantes] = useState(0);
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>(ANIVERSARIANTES_MOCK);
  const [tarefas,         setTarefas]         = useState<Tarefa[]>([]);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = useCallback(async () => {
    try {
      const [pessoas, tasks] = await Promise.all([
        getPessoas(supabase),
        getTarefas(supabase),
      ]);

      setTotalMembros(pessoas.filter((p) => p.tipo === "membro" && p.status === "ativo").length);
      setTotalVisitantes(pessoas.filter((p) => p.tipo === "visitante").length);
      setTarefas(tasks);

      // Aniversariantes reais do mês atual
      const mesNum = new Date().getMonth() + 1;
      const reais = pessoas
        .filter((p) => {
          if (!p.data_nascimento) return false;
          const m = parseInt(p.data_nascimento.split("-")[1], 10);
          return m === mesNum;
        })
        .map((p) => {
          const [y, m, d] = (p.data_nascimento ?? "").split("-");
          const idade = new Date().getFullYear() - parseInt(y ?? "0", 10);
          return {
            nome: p.nome,
            dia: parseInt(d ?? "0", 10),
            idade,
            tipo: p.tipo as "membro" | "visitante" | "em_processo",
            contato: p.contato ?? "—",
          };
        })
        .sort((a, b) => a.dia - b.dia);

      if (reais.length > 0) setAniversariantes(reais);
    } catch (e) {
      console.error("Erro ao carregar relatórios:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dados filtrados por período
  const corte = CORTES[periodo];
  const corteFreq = CORTES_FREQ[periodo];
  const crescimentoFiltrado = CRESCIMENTO_ANUAL.slice(-corte);
  const frequenciaFiltrada  = FREQUENCIA_SEMANAL.slice(-corteFreq);

  // Produtividade da equipe (do banco de dados)
  const produtividade = useMemo(() => {
    const responsaveis = ["Fagner Silva", "Lisandra Souza", "Adriana Lima", "Marco Aurélio"];
    return responsaveis.map((nome) => {
      const minhas = tarefas.filter((t) => t.responsavel === nome);
      const concluidas = minhas.filter((t) => t.status === "concluido").length;
      const total = minhas.length;
      const taxa = total > 0 ? Math.round((concluidas / total) * 100) : 0;
      return { nome, total, concluidas, taxa };
    }).sort((a, b) => b.taxa - a.taxa);
  }, [tarefas]);

  function handleExportarPDF() {
    const cfgAtual = relatorio
      ? RELATORIOS_GRID.find((r) => r.id === relatorio)
      : null;

    const titulo = cfgAtual
      ? `Campo ADIT — ${cfgAtual.titulo}`
      : "Campo ADIT — Relatórios";

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${titulo}</title>
  <style>
    body { font-family: 'DM Sans', system-ui, sans-serif; font-size: 13px; color: #0f1117; margin: 0; padding: 24px 32px; }
    h1 { font-family: Georgia, serif; font-size: 22px; margin-bottom: 4px; }
    h2 { font-family: Georgia, serif; font-size: 16px; margin: 20px 0 8px; }
    .meta { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
    th, td { border: 1px solid #e8e3d8; padding: 6px 10px; text-align: left; }
    th { background: #f8f7f4; font-weight: 600; }
    .footer { margin-top: 40px; font-size: 11px; color: #6b7280; border-top: 1px solid #e8e3d8; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>⛪ Campo ADIT — Assembleia de Deus</h1>
  <div class="meta">
    Relatório gerado em: ${formatDataHoje()} &nbsp;|&nbsp;
    Período: ${periodo === "mes" ? "Este mês" : periodo === "tri" ? "Últimos 3 meses" : periodo === "sem" ? "Últimos 6 meses" : "Último ano"}
  </div>

  ${relatorio === "crescimento" || !relatorio ? `
  <h2>📈 Crescimento Mensal</h2>
  <table>
    <thead><tr><th>Mês</th><th>Membros</th><th>Visitantes</th><th>Δ Membros</th></tr></thead>
    <tbody>
      ${crescimentoFiltrado.map((r, i) => {
        const ant = crescimentoFiltrado[i - 1];
        const delta = ant ? `+${Number(crescimentoPct(r.membros, ant.membros))}%` : "—";
        return `<tr><td>${r.mes}</td><td>${r.membros}</td><td>${r.visitantes}</td><td>${delta}</td></tr>`;
      }).join("")}
    </tbody>
  </table>` : ""}

  ${relatorio === "frequencia" || !relatorio ? `
  <h2>⛪ Frequência nos Cultos</h2>
  <table>
    <thead><tr><th>Semana</th><th>Presentes</th><th>Total</th><th>%</th><th>Faltantes</th></tr></thead>
    <tbody>
      ${frequenciaFiltrada.map((f) => `
        <tr><td>${f.semana}</td><td>${f.presentes}</td><td>${f.total}</td>
        <td>${pctFreq(f)}%</td><td>${f.total - f.presentes}</td></tr>
      `).join("")}
    </tbody>
  </table>` : ""}

  ${relatorio === "aniversariantes" || !relatorio ? `
  <h2>🎂 Aniversariantes — ${mesAtual()}</h2>
  <table>
    <thead><tr><th>Dia</th><th>Nome</th><th>Idade</th><th>Tipo</th><th>Contato</th></tr></thead>
    <tbody>
      ${aniversariantes.map((a) => `
        <tr><td>${String(a.dia).padStart(2,"0")}/${String(new Date().getMonth()+1).padStart(2,"0")}</td>
        <td>${a.nome}</td><td>${a.idade} anos</td>
        <td>${a.tipo === "membro" ? "Membro" : "Visitante"}</td>
        <td>${a.contato}</td></tr>
      `).join("")}
    </tbody>
  </table>` : ""}

  ${relatorio === "ministerios" || !relatorio ? `
  <h2>⚙️ Membros por Ministério</h2>
  <table>
    <thead><tr><th>Ministério</th><th>Integrantes</th><th>% do Total</th></tr></thead>
    <tbody>
      ${MINISTERIOS.map((m) => {
        const tot = MINISTERIOS.reduce((a, x) => a + x.integrantes, 0);
        return `<tr><td>${m.icon} ${m.nome}</td><td>${m.integrantes}</td><td>${Math.round(m.integrantes/tot*100)}%</td></tr>`;
      }).join("")}
    </tbody>
  </table>` : ""}

  ${relatorio === "produtividade" || !relatorio ? `
  <h2>🏆 Produtividade da Equipe</h2>
  <table>
    <thead><tr><th>Posição</th><th>Responsável</th><th>Tarefas</th><th>Concluídas</th><th>Taxa</th></tr></thead>
    <tbody>
      ${produtividade.map((p, i) => `
        <tr><td>${["🥇","🥈","🥉"][i] ?? `${i+1}º`}</td>
        <td>${p.nome}</td><td>${p.total}</td><td>${p.concluidas}</td><td>${p.taxa}%</td></tr>
      `).join("")}
    </tbody>
  </table>` : ""}

  <div class="footer">
    Sistema de Gestão — Campo ADIT &nbsp;|&nbsp; Impresso em ${formatDataHoje()}
  </div>
</body></html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  }

  const cfgRelatorio = relatorio ? RELATORIOS_GRID.find((r) => r.id === relatorio) : null;

  return (
    <>
      <Topbar
        title="Relatórios"
        subtitle={relatorio ? cfgRelatorio?.titulo : "Análise Institucional"}
        actions={
          <div className="flex items-center gap-2">
            {relatorio && (
              <Button variant="ghost" size="sm" onClick={() => setRelatorio(null)}>
                ← Todos
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleExportarPDF}>
              📄 Exportar PDF
            </Button>
          </div>
        }
      />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 p-6">

        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 card">
          <span className="text-xs font-medium text-[var(--ink-muted)]">Período:</span>
          {(["mes","tri","sem","ano"] as Periodo[]).map((p) => {
            const labels: Record<Periodo, string> = {
              mes: "Este mês", tri: "3 meses", sem: "6 meses", ano: "1 ano",
            };
            return (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={[
                  "px-3 h-7 rounded-full text-xs font-medium transition-all border",
                  periodo === p
                    ? "bg-[var(--gold)] text-white border-[var(--gold)]"
                    : "bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)]",
                ].join(" ")}
              >
                {labels[p]}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-[var(--ink-muted)]">
            {relatorio
              ? `Relatório: ${cfgRelatorio?.titulo}`
              : `${RELATORIOS_GRID.length} relatórios disponíveis`}
          </span>
        </div>

        {/* ── Grid de relatórios ──────────────────────────────────── */}
        {!relatorio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {RELATORIOS_GRID.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setRelatorio(r.id)}
                className="card p-5 text-left hover:border-[var(--gold)] hover:shadow-md transition-all animate-fade-in group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: r.bg, color: r.cor }}
                  >
                    {r.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--gold-dark)] transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}>
                      {r.titulo}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                  <span className="text-[var(--ink-muted)] group-hover:text-[var(--gold)] transition-colors text-lg shrink-0">→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Conteúdo do relatório ───────────────────────────────── */}
        {relatorio === "crescimento"     && <RelatorioCrescimento  dados={crescimentoFiltrado} />}
        {relatorio === "frequencia"      && <RelatorioFrequencia   dados={frequenciaFiltrada} />}
        {relatorio === "aniversariantes" && <RelatorioAniversariantes aniversariantes={aniversariantes} />}
        {relatorio === "ministerios"     && <RelatorioMinisterios />}
        {relatorio === "produtividade"   && <RelatorioProdutividade produtividade={produtividade} loading={loading} />}

        {/* ── Preview mini quando na grid ────────────────────────── */}
        {!relatorio && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MiniPreviewCrescimento dados={crescimentoFiltrado} />
            <MiniPreviewFrequencia  dados={frequenciaFiltrada} />
          </div>
        )}
      </main>
    </>
  );
}

// ── Relatório 1: Crescimento ──────────────────────────────────────────────────

function RelatorioCrescimento({ dados }: {
  dados: typeof CRESCIMENTO_ANUAL;
}) {
  const ultimo  = dados[dados.length - 1];
  const primeiro = dados[0];
  const deltaMembros   = ultimo.membros - primeiro.membros;
  const deltaVisitantes = ultimo.visitantes - primeiro.visitantes;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--green)]">{ultimo.membros}</p>
          <p className="text-xs text-[var(--ink-muted)]">Membros Ativos</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--blue)]">{ultimo.visitantes}</p>
          <p className="text-xs text-[var(--ink-muted)]">Visitantes ({dados[dados.length-1]?.mes})</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--gold)]">+{deltaMembros}</p>
          <p className="text-xs text-[var(--ink-muted)]">Crescimento no período</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Evolução — Membros e Visitantes
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-[var(--gold)] inline-block"/>&nbsp;Membros</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-[var(--blue)] inline-block"/>&nbsp;Visitantes</span>
          </div>
        </div>
        <GraficoLinha
          labels={dados.map((d) => d.mes)}
          series={[
            { label: "Membros",    color: "var(--gold)", data: dados.map((d) => d.membros)    },
            { label: "Visitantes", color: "var(--blue)", data: dados.map((d) => d.visitantes) },
          ]}
        />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Dados Mensais</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Mês</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Membros</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Visitantes</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Δ Membros</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Crescimento</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((row, i) => {
                const ant = dados[i - 1];
                const delta = ant ? row.membros - ant.membros : 0;
                const pct   = ant ? crescimentoPct(row.membros, ant.membros) : "—";
                return (
                  <tr key={row.mes} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
                    <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{row.mes}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--ink)]">{row.membros}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--ink)]">{row.visitantes}</td>
                    <td className="px-4 py-2.5 text-right">
                      {ant && (
                        <span className={delta >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}>
                          {delta >= 0 ? "+" : ""}{delta}
                        </span>
                      )}
                      {!ant && <span className="text-[var(--ink-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {ant ? (
                        <Badge variant={Number(pct) >= 0 ? "green" : "red"}>
                          {Number(pct) >= 0 ? "+" : ""}{pct}%
                        </Badge>
                      ) : <span className="text-[var(--ink-muted)] text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Relatório 2: Frequência ───────────────────────────────────────────────────

function RelatorioFrequencia({ dados }: {
  dados: typeof FREQUENCIA_SEMANAL;
}) {
  const media = Math.round(dados.reduce((a, f) => a + pctFreq(f), 0) / dados.length);
  const melhor = dados.reduce((a, b) => pctFreq(a) > pctFreq(b) ? a : b);
  const META = 75;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: media >= META ? "var(--green)" : "var(--red)" }}>{media}%</p>
          <p className="text-xs text-[var(--ink-muted)]">Média do período</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--green)]">{pctFreq(melhor)}%</p>
          <p className="text-xs text-[var(--ink-muted)]">Melhor semana ({melhor.semana})</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--blue)]">{META}%</p>
          <p className="text-xs text-[var(--ink-muted)]">Meta estabelecida</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Frequência por Semana
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-[var(--gold)] inline-block"/>Acima da meta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-[var(--red)] inline-block"/>Abaixo da meta
            </span>
            <span className="flex items-center gap-1.5 text-[var(--red)]">
              - - Meta {META}%
            </span>
          </div>
        </div>
        <GraficoBarra
          meta={META}
          dados={dados.map((f) => ({ label: f.semana, pct: pctFreq(f), presentes: f.presentes }))}
        />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Dados por Semana</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Semana</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Presentes</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Faltantes</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Total</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Frequência</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Meta</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((f) => {
              const pct = pctFreq(f);
              const atingiu = pct >= META;
              return (
                <tr key={f.semana} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
                  <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{f.semana}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--green)]">{f.presentes}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--red)]">{f.total - f.presentes}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--ink-muted)]">{f.total}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="font-semibold" style={{ color: atingiu ? "var(--green)" : "var(--red)" }}>
                      {pct}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={atingiu ? "green" : "red"}>{atingiu ? "✓ Atingiu" : "✗ Abaixo"}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Relatório 3: Aniversariantes ──────────────────────────────────────────────

function RelatorioAniversariantes({ aniversariantes }: {
  aniversariantes: Aniversariante[];
}) {
  const mesNum = new Date().getMonth() + 1;
  const mesStr = String(mesNum).padStart(2, "0");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
            🎂 Aniversariantes de {mesAtual()}
          </h3>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            {aniversariantes.length} pessoa{aniversariantes.length !== 1 ? "s" : ""} fazem aniversário este mês
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => alert("Integração WhatsApp em desenvolvimento")}
          >
            💬 WhatsApp em massa
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => alert("Integração Email em desenvolvimento")}
          >
            📧 Email em massa
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Data</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Nome</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Idade</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Contato</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Ação</th>
            </tr>
          </thead>
          <tbody>
            {aniversariantes.map((a) => {
              const hoje = new Date().getDate();
              const ehHoje = a.dia === hoje;
              return (
                <tr key={a.nome} className={[
                  "border-b border-[var(--border)] last:border-0",
                  ehHoje ? "bg-[#fdf3d7]" : "hover:bg-[var(--surface-2)]",
                ].join(" ")}>
                  <td className="px-4 py-3 font-medium">
                    {ehHoje && <span className="text-[var(--gold-dark)] mr-1">🎂</span>}
                    <span className={ehHoje ? "text-[var(--gold-dark)] font-semibold" : "text-[var(--ink)]"}>
                      {String(a.dia).padStart(2,"0")}/{mesStr}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={a.nome} size="xs" />
                      <span className="text-[var(--ink)] font-medium">{a.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--ink-muted)]">{a.idade} anos</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={a.tipo === "membro" ? "gold" : "green"}>
                      {a.tipo === "membro" ? "Membro" : "Visitante"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">{a.contato}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => alert(`Enviar para ${a.nome}: ${a.contato}`)}
                      className="text-xs text-[var(--green)] hover:underline"
                    >
                      💬 Enviar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Relatório 4: Ministérios ──────────────────────────────────────────────────

function RelatorioMinisterios() {
  const total = MINISTERIOS.reduce((a, m) => a + m.integrantes, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-[var(--ink)]">{total}</p>
          <p className="text-xs text-[var(--ink-muted)]">Total de integrantes em ministérios</p>
        </div>
        <p className="text-xs text-[var(--ink-muted)]">{MINISTERIOS.length} ministérios ativos</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MINISTERIOS.map((m) => {
          const pct = Math.round((m.integrantes / total) * 100);
          const extras = m.integrantes - m.membros.length;
          return (
            <div key={m.nome} className="card p-5 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center text-xl"
                    style={{ background: m.cor + "20" }}>
                    {m.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">{m.nome}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{m.integrantes} integrantes</p>
                  </div>
                </div>
                <DonutChart pct={pct} cor={m.cor} />
              </div>

              {/* Progress */}
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.cor }} />
              </div>

              {/* Membros */}
              <div className="flex items-center gap-1.5">
                {m.membros.map((n) => (
                  <Avatar key={n} name={n} size="xs" />
                ))}
                {extras > 0 && (
                  <span className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[9px] font-medium text-[var(--ink-muted)]">
                    +{extras}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela resumo */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Distribuição por Ministério</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Ministério</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Integrantes</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">% do Total</th>
              <th className="px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Proporção</th>
            </tr>
          </thead>
          <tbody>
            {MINISTERIOS.map((m) => {
              const pct = Math.round((m.integrantes / total) * 100);
              return (
                <tr key={m.nome} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
                  <td className="px-4 py-2.5">
                    <span className="mr-2">{m.icon}</span>
                    <span className="font-medium text-[var(--ink)]">{m.nome}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[var(--ink)]">{m.integrantes}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Badge variant="gold">{pct}%</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden w-full">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.cor }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Relatório 5: Produtividade ────────────────────────────────────────────────

const MEDALHAS = ["🥇", "🥈", "🥉"];

function RelatorioProdutividade({ produtividade, loading }: {
  produtividade: Array<{ nome: string; total: number; concluidas: number; taxa: number }>;
  loading: boolean;
}) {
  const maxCriadas   = Math.max(...produtividade.map((p) => p.total),   1);
  const maxConcluidas = Math.max(...produtividade.map((p) => p.concluidas), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3">
        <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--ink-muted)]">Calculando produtividade…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Ranking */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {produtividade.slice(0, 3).map((p, i) => (
          <div key={p.nome} className={[
            "card p-4 text-center",
            i === 0 ? "border-[var(--gold)] shadow-md" : "",
          ].join(" ")}>
            <p className="text-2xl mb-1">{MEDALHAS[i]}</p>
            <Avatar name={p.nome} size="sm" className="mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--ink)]">{p.nome.split(" ")[0]}</p>
            <p className="text-xl font-bold mt-1"
              style={{ color: RESPONSAVEIS_CORES[p.nome] ?? "var(--ink)" }}>
              {p.taxa}%
            </p>
            <p className="text-xs text-[var(--ink-muted)]">taxa de conclusão</p>
          </div>
        ))}
      </div>

      {/* Gráfico horizontal */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
          Tarefas Criadas
        </h3>
        {produtividade.map((p) => (
          <BarraHorizontal
            key={p.nome + "_total"}
            label={p.nome.split(" ")[0]}
            valor={p.total}
            maximo={maxCriadas}
            cor={RESPONSAVEIS_CORES[p.nome] ?? "var(--ink-muted)"}
          />
        ))}
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
          Tarefas Concluídas
        </h3>
        {produtividade.map((p) => (
          <BarraHorizontal
            key={p.nome + "_conc"}
            label={p.nome.split(" ")[0]}
            valor={p.concluidas}
            maximo={maxConcluidas}
            cor="var(--green)"
          />
        ))}
      </div>

      {/* Tabela completa */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Ranking Completo</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-center px-4 py-2 text-xs font-semibold text-[var(--ink-muted)] w-12">#</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Responsável</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Tarefas</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Concluídas</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Taxa</th>
              <th className="px-4 py-2 text-xs font-semibold text-[var(--ink-muted)]">Desempenho</th>
            </tr>
          </thead>
          <tbody>
            {produtividade.map((p, i) => (
              <tr key={p.nome} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
                <td className="px-4 py-3 text-center text-lg">
                  {MEDALHAS[i] ?? <span className="text-sm text-[var(--ink-muted)]">{i + 1}º</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.nome} size="xs" />
                    <span className="font-medium text-[var(--ink)]">{p.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ink)]">{p.total}</td>
                <td className="px-4 py-3 text-right text-[var(--green)] font-medium">{p.concluidas}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold"
                    style={{ color: RESPONSAVEIS_CORES[p.nome] ?? "var(--ink)" }}>
                    {p.taxa}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden w-full">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${p.taxa}%`, background: RESPONSAVEIS_CORES[p.nome] ?? "var(--ink-muted)" }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Mini-previews (na grid) ───────────────────────────────────────────────────

function MiniPreviewCrescimento({ dados }: { dados: typeof CRESCIMENTO_ANUAL }) {
  const ultimo = dados[dados.length - 1];
  const primeiro = dados[0];
  const delta = ultimo.membros - primeiro.membros;

  return (
    <div className="card p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
          📈 Crescimento — Prévia
        </h3>
        <span className="text-xs font-semibold text-[var(--green)]">+{delta} membros</span>
      </div>
      <GraficoLinha
        labels={dados.map((d) => d.mes)}
        series={[
          { label: "Membros",    color: "var(--gold)", data: dados.map((d) => d.membros)    },
          { label: "Visitantes", color: "var(--blue)", data: dados.map((d) => d.visitantes) },
        ]}
      />
    </div>
  );
}

function MiniPreviewFrequencia({ dados }: { dados: typeof FREQUENCIA_SEMANAL }) {
  const media = Math.round(dados.reduce((a, f) => a + pctFreq(f), 0) / dados.length);
  return (
    <div className="card p-5 animate-fade-in" style={{ animationDelay: "360ms" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-display)" }}>
          ⛪ Frequência — Prévia
        </h3>
        <span className="text-xs font-semibold text-[var(--blue)]">Média: {media}%</span>
      </div>
      <GraficoBarra
        meta={75}
        dados={dados.map((f) => ({ label: f.semana, pct: pctFreq(f), presentes: f.presentes }))}
      />
    </div>
  );
}
