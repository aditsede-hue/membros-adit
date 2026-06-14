"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { deletaPessoa } from "@/lib/db/pessoas";
import Topbar from "@/components/layout/Topbar";
import TabelaVisitantes from "@/components/visitantes/TabelaVisitantes";
import ModalVisitante from "@/components/visitantes/ModalVisitante";
import Button from "@/components/ui/Button";
import type { Pessoa } from "@/types";

const POR_PAGINA = 20;

type FiltroVisita = "" | "primeira" | "retorno";

export default function VisitantesPage() {
  const [visitantes, setVisitantes]         = useState<Pessoa[]>([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [pagina, setPagina]                 = useState(0);

  const [buscaInput, setBuscaInput]         = useState("");
  const [busca, setBusca]                   = useState("");
  const [filtroVisita, setFiltroVisita]     = useState<FiltroVisita>("");

  const [modalAberto, setModalAberto]       = useState(false);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput), 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  useEffect(() => { setPagina(0); }, [busca, filtroVisita]);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      let base = supabase
        .from("pessoas")
        .select("*", { count: "exact" })
        .eq("tipo", "visitante")
        .order("criado_em", { ascending: false });

      if (busca.trim()) base = base.ilike("nome", `%${busca.trim()}%`);
      if (filtroVisita === "primeira") base = base.eq("primeira_vez", true);
      else if (filtroVisita === "retorno") base = base.eq("primeira_vez", false);

      const { data, error, count } = await base.range(
        pagina * POR_PAGINA,
        (pagina + 1) * POR_PAGINA - 1
      );

      if (error) throw error;
      setVisitantes((data ?? []) as Pessoa[]);
      setTotal(count ?? 0);
    } catch (e) {
      console.error("Erro ao carregar visitantes:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, filtroVisita, pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setPessoaSelecionada(null);
    setModalAberto(true);
  }

  function abrirEditar(p: Pessoa) {
    setPessoaSelecionada(p);
    setModalAberto(true);
  }

  async function handleDelete(p: Pessoa) {
    try {
      await deletaPessoa(supabase, p.id);
      carregar();
    } catch (e) {
      console.error("Erro ao deletar:", e);
    }
  }

  function exportarCSV() {
    const headers = ["Nome", "Contato", "Email", "Tipo Visita", "Registrado em"];
    const rows = visitantes.map((v) => [
      v.nome,
      v.contato ?? "",
      v.email ?? "",
      v.primeira_vez ? "1ª visita" : "Retornou",
      new Date(v.criado_em).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitantes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const temFiltro = !!(busca || filtroVisita);
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  const primeiraVez = visitantes.filter((v) => v.primeira_vez).length;
  const retornaram  = visitantes.filter((v) => !v.primeira_vez).length;

  return (
    <>
      <Topbar
        title="Visitantes"
        subtitle={
          loading
            ? "Carregando..."
            : `${total} ${total === 1 ? "visitante registrado" : "visitantes registrados"}`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportarCSV}>Exportar</Button>
            <Button variant="primary" size="sm" onClick={abrirNovo}>
              + Novo visitante
            </Button>
          </div>
        }
      />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 p-5 flex flex-col gap-4">

        {!loading && total > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} label="Total" value={total} color="var(--blue)" />
            <StatCard icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>} label="1ª visita" value={primeiraVez} color="var(--primary)" />
            <StatCard icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>} label="Retornaram" value={retornaram} color="var(--green)" />
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              type="search"
              placeholder="Buscar visitante..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <select
            value={filtroVisita}
            onChange={(e) => setFiltroVisita(e.target.value as FiltroVisita)}
            className="h-9 px-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Todas as visitas</option>
            <option value="primeira">1ª visita</option>
            <option value="retorno">Retornou</option>
          </select>

          {temFiltro && (
            <button
              onClick={() => { setBuscaInput(""); setFiltroVisita(""); }}
              className="h-9 px-3 text-sm text-[var(--ink-muted)] hover:text-[var(--red)] hover:bg-[#fde8e6] rounded-[var(--radius)] transition-colors"
            >
              × Limpar
            </button>
          )}
        </div>

        <TabelaVisitantes
          pessoas={visitantes}
          loading={loading}
          onEdit={abrirEditar}
          onDelete={handleDelete}
        />

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between text-sm text-[var(--ink-muted)]">
            <span>
              {pagina * POR_PAGINA + 1}–{Math.min((pagina + 1) * POR_PAGINA, total)} de {total}
            </span>
            <div className="flex gap-1">
              <PagBtn disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>← Anterior</PagBtn>
              {Array.from({ length: Math.min(totalPaginas, 5) }).map((_, i) => (
                <PagBtn key={i} active={i === pagina} onClick={() => setPagina(i)}>{i + 1}</PagBtn>
              ))}
              <PagBtn disabled={pagina >= totalPaginas - 1} onClick={() => setPagina((p) => p + 1)}>Próxima →</PagBtn>
            </div>
          </div>
        )}
      </main>

      <ModalVisitante
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        pessoa={pessoaSelecionada}
        onSaved={carregar}
      />
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <span style={{ background: color + "18", color }} className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold text-[var(--ink)] leading-tight">{value}</p>
        <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      </div>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-8 px-3 rounded-[var(--radius)] text-sm font-medium transition-colors",
        active ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--surface-2)] text-[var(--ink-muted)]",
        disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}