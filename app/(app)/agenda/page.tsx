"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEventos, deletaEvento } from "@/lib/db/eventos";
import { seedEventos, TOTAL_SEED } from "@/lib/agenda/seed";
import { getTipo, TIPOS } from "@/lib/agenda/tipos";
import Topbar from "@/components/layout/Topbar";
import CalendarioMes from "@/components/agenda/CalendarioMes";
import ListaEventos from "@/components/agenda/ListaEventos";
import ModalEvento from "@/components/agenda/ModalEvento";
import Button from "@/components/ui/Button";
import type { Evento } from "@/types";

const MESES_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

type View = "mes" | "lista";

export default function AgendaPage() {
  const hoje  = new Date();
  const [ano, setAno]     = useState(hoje.getFullYear());
  const [mes, setMes]     = useState(hoje.getMonth());
  const [view, setView]   = useState<View>("mes");

  const [eventos, setEventos]     = useState<Evento[]>([]);
  const [todosEventos, setTodosEventos] = useState<Evento[]>([]);
  const [loading, setLoading]     = useState(true);
  const [seeding, setSeeding]     = useState(false);

  const [modalAberto, setModalAberto]       = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [dataPadrao, setDataPadrao]         = useState<string | undefined>();

  const supabase = createClient();

  // Carrega eventos do mês atual
  const carregarMes = useCallback(async () => {
    setLoading(true);
    try {
      // Primeiro dia e último dia do mês
      const dataIni = `${ano}-${String(mes + 1).padStart(2, "0")}-01`;
      const dataFim = new Date(ano, mes + 1, 0).toISOString().split("T")[0];

      const data = await getEventos(supabase, { data_de: dataIni, data_ate: dataFim });
      setEventos(data);
    } catch (e) {
      console.error("Erro ao carregar eventos:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano, mes]);

  // Carrega TODOS eventos (para lista completa e estatísticas)
  const carregarTodos = useCallback(async () => {
    try {
      const data = await getEventos(supabase);
      setTodosEventos(data);
    } catch (e) {
      console.error(e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarMes();
    carregarTodos();
  }, [carregarMes, carregarTodos]);

  function navMes(delta: number) {
    const d = new Date(ano, mes + delta);
    setAno(d.getFullYear());
    setMes(d.getMonth());
  }

  function abrirNovo(data?: string) {
    setEventoSelecionado(null);
    setDataPadrao(data);
    setModalAberto(true);
  }

  function abrirEditar(ev: Evento) {
    setEventoSelecionado(ev);
    setDataPadrao(undefined);
    setModalAberto(true);
  }

  async function handleDelete(ev: Evento) {
    try {
      await deletaEvento(supabase, ev.id);
      carregarMes();
      carregarTodos();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const n = await seedEventos(supabase);
      await carregarMes();
      await carregarTodos();
      alert(`✅ ${n} eventos importados com sucesso!`);
    } catch (e: unknown) {
      alert("Erro ao importar: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSeeding(false);
    }
  }

  // Estatísticas do mês
  const tiposNoMes = new Set(eventos.map((e) => e.tipo)).size;
  const proximoEvento = eventos.find((e) => e.data_ini >= new Date().toISOString().split("T")[0]);

  // Exportar PDF do mês
  function exportarPDF() {
    const titulo = `Agenda Oficial — ${MESES_PT[mes]} ${ano}`;
    const linhas = eventos
      .map((ev) => {
        const cfg  = getTipo(ev.tipo);
        const dia  = ev.data_ini.split("-")[2];
        const hora = ev.hora ? ev.hora.slice(0, 5) : "—";
        const resp = ev.responsavel ?? "—";
        return `
          <tr>
            <td>${dia}/${mes + 1}/${ano}</td>
            <td>${cfg.icon} ${ev.titulo}${ev.data_fim && ev.data_fim !== ev.data_ini ? ` (até ${ev.data_fim.split("-")[2]}/${mes + 1})` : ""}</td>
            <td>${cfg.label}</td>
            <td>${hora}</td>
            <td>${resp}</td>
          </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, serif; color: #0f1117; padding: 40px; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #c9a84c; padding-bottom: 24px; }
  .cross { font-size: 40px; }
  h1 { font-size: 22px; margin: 8px 0 4px; }
  .subtitle { color: #6b7280; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #0f1117; color: #c9a84c; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
  td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #e8e3d8; vertical-align: top; }
  tr:nth-child(even) td { background: #f8f7f4; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e8e3d8; padding-top: 16px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="cross">✝️</div>
    <h1>${titulo}</h1>
    <p class="subtitle">Assembleia de Deus do Itapoã · Campo ADIT · ${eventos.length} eventos</p>
  </div>
  <table>
    <thead>
      <tr><th>Data</th><th>Evento</th><th>Tipo</th><th>Horário</th><th>Responsável</th></tr>
    </thead>
    <tbody>${linhas}</tbody>
  </table>
  <div class="footer">
    <p>Campo ADIT · Assembleia de Deus do Itapoã · Documento gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
  </div>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  }

  const eventosParaLista = view === "lista" ? todosEventos : eventos;

  return (
    <>
      <Topbar
        title="Agenda"
        subtitle={`Campo ADIT · ${ano}`}
        actions={
          <div className="flex items-center gap-2">
            {todosEventos.length === 0 && (
              <Button variant="ghost" size="sm" loading={seeding} onClick={handleSeed}>
                Importar Agenda 2026
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={exportarPDF}>
              📄 PDF
            </Button>
            <Button variant="primary" size="sm" onClick={() => abrirNovo()}>
              + Novo evento
            </Button>
          </div>
        }
      />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 p-5 flex flex-col gap-4">

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ResumoCard
            icon="📅"
            label={`Eventos em ${MESES_PT[mes]}`}
            value={loading ? "…" : String(eventos.length)}
            color="var(--gold)"
          />
          <ResumoCard
            icon="🏷️"
            label="Tipos diferentes"
            value={loading ? "…" : String(tiposNoMes)}
            color="var(--blue)"
          />
          <ResumoCard
            icon="⏭️"
            label="Próximo evento"
            value={
              loading
                ? "…"
                : proximoEvento
                ? proximoEvento.titulo.slice(0, 22) + (proximoEvento.titulo.length > 22 ? "…" : "")
                : "—"
            }
            color="var(--green)"
            small
          />
        </div>

        {/* Barra de controles */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Navegação de mês */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navMes(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors text-[var(--ink-muted)]"
            >
              ‹
            </button>
            <span
              className="text-base font-semibold text-[var(--ink)] min-w-[180px] text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {MESES_PT[mes].toUpperCase()} {ano}
            </span>
            <button
              onClick={() => navMes(1)}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors text-[var(--ink-muted)]"
            >
              ›
            </button>
            <button
              onClick={() => { setAno(hoje.getFullYear()); setMes(hoje.getMonth()); }}
              className="ml-1 h-8 px-3 text-xs rounded-[var(--radius)] border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--ink-muted)] transition-colors"
            >
              Hoje
            </button>
          </div>

          {/* View switcher */}
          <div className="flex rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
            {(["mes", "lista"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "px-4 h-8 text-sm font-medium transition-colors",
                  view === v
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)]",
                ].join(" ")}
              >
                {v === "mes" ? "📅 Mês" : "📋 Lista"}
              </button>
            ))}
          </div>
        </div>

        {/* Legenda de tipos */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(TIPOS).map(([key, cfg]) => (
            <span
              key={key}
              style={{ background: cfg.bg, color: cfg.cor }}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            >
              {cfg.icon} {cfg.label}
            </span>
          ))}
        </div>

        {/* Views */}
        {view === "mes" ? (
          <CalendarioMes
            ano={ano}
            mes={mes}
            eventos={eventos}
            onDiaClick={(data) => abrirNovo(data)}
            onEventoClick={(ev) => abrirEditar(ev)}
          />
        ) : (
          <ListaEventos
            eventos={eventosParaLista}
            onEdit={abrirEditar}
            onDelete={handleDelete}
          />
        )}
      </main>

      <ModalEvento
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        evento={eventoSelecionado}
        dataPadrao={dataPadrao}
        onSaved={() => { carregarMes(); carregarTodos(); }}
      />
    </>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function ResumoCard({
  icon, label, value, color, small,
}: { icon: string; label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <span
        style={{ background: color + "18", color }}
        className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center text-lg shrink-0"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={[
            "font-bold text-[var(--ink)] leading-tight truncate",
            small ? "text-sm" : "text-2xl",
          ].join(" ")}
          title={value}
        >
          {value}
        </p>
        <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      </div>
    </div>
  );
}
