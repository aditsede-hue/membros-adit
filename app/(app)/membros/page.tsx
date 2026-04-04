"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPessoas, deletaPessoa } from "@/lib/db/pessoas";
import Topbar from "@/components/layout/Topbar";
import TabelaMembros from "@/components/membros/TabelaMembros";
import ModalMembro from "@/components/membros/ModalMembro";
import ModalDetalhes from "@/components/membros/ModalDetalhes";
import Button from "@/components/ui/Button";
import type { Pessoa, FiltroPessoas } from "@/types";

const POR_PAGINA = 20;

export default function MembrosPage() {
  const [pessoas, setPessoas]           = useState<Pessoa[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [pagina, setPagina]             = useState(0);

  // Filtros
  const [busca, setBusca]               = useState("");
  const [filtroTipo, setFiltroTipo]     = useState<FiltroPessoas["tipo"] | "">("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroPessoas["status"] | "">("");

  // Modais
  const [modalAberto, setModalAberto]     = useState(false);
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);

  const supabase = createClient();

  const carregarPessoas = useCallback(async () => {
    setLoading(true);
    try {
      const filtros: FiltroPessoas = {};
      if (filtroTipo)   filtros.tipo   = filtroTipo;
      if (filtroStatus) filtros.status = filtroStatus;
      if (busca.trim()) filtros.busca  = busca.trim();

      // Busca total para paginação
      let queryCount = supabase.from("pessoas").select("id", { count: "exact", head: true });
      if (filtros.tipo)   queryCount = queryCount.eq("tipo",   filtros.tipo);
      if (filtros.status) queryCount = queryCount.eq("status", filtros.status);
      if (filtros.busca)  queryCount = queryCount.ilike("nome", `%${filtros.busca}%`);
      const { count } = await queryCount;
      setTotal(count ?? 0);

      // Busca dados paginados
      let query = supabase
        .from("pessoas")
        .select("*")
        .order("nome", { ascending: true })
        .range(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA - 1);

      if (filtros.tipo)   query = query.eq("tipo",   filtros.tipo);
      if (filtros.status) query = query.eq("status", filtros.status);
      if (filtros.busca)  query = query.ilike("nome", `%${filtros.busca}%`);

      const { data, error } = await query;
      if (error) throw error;
      setPessoas((data ?? []) as Pessoa[]);
    } catch (e) {
      console.error("Erro ao carregar membros:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroStatus, busca, pagina]);

  // Recarrega ao mudar filtros — reseta para página 0
  useEffect(() => {
    setPagina(0);
  }, [filtroTipo, filtroStatus, busca]);

  useEffect(() => {
    carregarPessoas();
  }, [carregarPessoas]);

  // Debounce busca
  const [buscaInput, setBuscaInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput), 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  function abrirNovo() {
    setPessoaSelecionada(null);
    setModalAberto(true);
  }

  function abrirEditar(p: Pessoa) {
    setPessoaSelecionada(p);
    setModalAberto(true);
  }

  function abrirDetalhes(p: Pessoa) {
    setPessoaSelecionada(p);
    setDetalhesAberto(true);
  }

  async function handleDelete(p: Pessoa) {
    try {
      await deletaPessoa(supabase, p.id);
      carregarPessoas();
    } catch (e) {
      console.error("Erro ao deletar:", e);
    }
  }

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <>
      <Topbar
        title="Membros"
        subtitle={
          loading
            ? "Carregando..."
            : `${total} ${total === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Exportar
            </Button>
            <Button variant="primary" size="sm" onClick={abrirNovo}>
              + Novo membro
            </Button>
          </div>
        }
      />

      <main
        style={{ paddingTop: "var(--topbar-h)" }}
        className="flex-1 p-5 flex flex-col gap-4"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Busca */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              type="search"
              placeholder="Buscar por nome..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
          </div>

          {/* Filtro tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroPessoas["tipo"] | "")}
            className="h-9 px-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          >
            <option value="">Todos os tipos</option>
            <option value="membro">Membro</option>
            <option value="visitante">Visitante</option>
            <option value="em_processo">Em processo</option>
          </select>

          {/* Filtro status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroPessoas["status"] | "")}
            className="h-9 px-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>

          {/* Limpa filtros */}
          {(filtroTipo || filtroStatus || busca) && (
            <button
              onClick={() => { setFiltroTipo(""); setFiltroStatus(""); setBuscaInput(""); }}
              className="h-9 px-3 text-sm text-[var(--ink-muted)] hover:text-[var(--red)] hover:bg-[#fde8e6] rounded-[var(--radius)] transition-colors"
            >
              ✕ Limpar
            </button>
          )}
        </div>

        {/* Tabela */}
        <TabelaMembros
          pessoas={pessoas}
          loading={loading}
          onEdit={abrirEditar}
          onDelete={handleDelete}
          onView={abrirDetalhes}
        />

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between text-sm text-[var(--ink-muted)]">
            <span>
              {pagina * POR_PAGINA + 1}–{Math.min((pagina + 1) * POR_PAGINA, total)} de {total}
            </span>
            <div className="flex gap-1">
              <PagBtn
                disabled={pagina === 0}
                onClick={() => setPagina((p) => p - 1)}
              >
                ← Anterior
              </PagBtn>
              {Array.from({ length: Math.min(totalPaginas, 5) }).map((_, i) => {
                const page = i;
                return (
                  <PagBtn
                    key={page}
                    active={page === pagina}
                    onClick={() => setPagina(page)}
                  >
                    {page + 1}
                  </PagBtn>
                );
              })}
              <PagBtn
                disabled={pagina >= totalPaginas - 1}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima →
              </PagBtn>
            </div>
          </div>
        )}
      </main>

      {/* Modal criar/editar */}
      <ModalMembro
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        pessoa={pessoaSelecionada}
        onSaved={carregarPessoas}
      />

      {/* Modal detalhes */}
      <ModalDetalhes
        open={detalhesAberto}
        onClose={() => setDetalhesAberto(false)}
        pessoa={pessoaSelecionada}
        onEdit={(p) => { setDetalhesAberto(false); abrirEditar(p); }}
      />
    </>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-8 px-3 rounded-[var(--radius)] text-sm font-medium transition-colors",
        active
          ? "bg-[var(--gold)] text-white"
          : "hover:bg-[var(--surface-2)] text-[var(--ink-muted)]",
        disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
