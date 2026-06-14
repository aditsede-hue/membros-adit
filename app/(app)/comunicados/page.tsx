"use client";

import { useState } from "react";

/* ── Types ──────────────────────────────────────────────── */
type Categoria = "Aviso" | "Urgente" | "Informativo";

interface Comunicado {
  id: number;
  titulo: string;
  mensagem: string;
  categoria: Categoria;
  autor: string;
  data: string;
}

/* ── Mock data ──────────────────────────────────────────── */
const mockComunicados: Comunicado[] = [
  {
    id: 1,
    titulo: "Reunião de liderança — sábado 19h",
    mensagem: "Todos os secretários e ministros devem estar presentes na reunião de liderança deste sábado às 19h no salão principal. Confirmar presença com Fagner até sexta-feira.",
    categoria: "Aviso",
    autor: "Fagner Silva",
    data: "2026-04-14",
  },
  {
    id: 2,
    titulo: "Sistema PGA — novo módulo disponível",
    mensagem: "O módulo de Usuários foi adicionado ao sistema. Cada secretário deve acessar e verificar seus dados cadastrais. Em caso de divergência, informar ao administrador.",
    categoria: "Informativo",
    autor: "Fagner Silva",
    data: "2026-04-13",
  },
  {
    id: 3,
    titulo: "Atenção — escala de domingo alterada",
    mensagem: "A escala do ministério de louvor para o domingo 20/04 foi alterada. Consultar o módulo de Agenda para verificar as mudanças. Todos os envolvidos já foram notificados.",
    categoria: "Urgente",
    autor: "Fagner Silva",
    data: "2026-04-12",
  },
];

/* ── Config de categoria ────────────────────────────────── */
const categoriaConfig: Record<Categoria, { color: string; bg: string }> = {
  Aviso:       { color: "#a87e2e", bg: "#fdf3d7" },
  Urgente:     { color: "#c0392b", bg: "#fdecea" },
  Informativo: { color: "#1e5fa8", bg: "#e8f0fb" },
};

/* ── Formatar data ──────────────────────────────────────── */
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* ── Perfil simulado (depois virá do contexto real) ─────── */
const perfilAtual: "Administrador" | "Secretário" | "Leitor" = "Administrador";

/* ── Modal ──────────────────────────────────────────────── */
const modalVazio: Omit<Comunicado, "id" | "autor" | "data"> = {
  titulo: "",
  mensagem: "",
  categoria: "Aviso",
};

function ModalComunicado({
  comunicado,
  onSalvar,
  onFechar,
}: {
  comunicado?: Comunicado;
  onSalvar: (dados: Omit<Comunicado, "id" | "autor" | "data">) => void;
  onFechar: () => void;
}) {
  const [form, setForm] = useState(
    comunicado
      ? { titulo: comunicado.titulo, mensagem: comunicado.mensagem, categoria: comunicado.categoria }
      : modalVazio
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensagem.trim()) return;
    onSalvar(form);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(15,17,23,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div className="card animate-scale-in" style={{ width: "100%", maxWidth: 520, padding: 28 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>
            {comunicado ? "Editar Comunicado" : "Novo Comunicado"}
          </h2>
          <button
            onClick={onFechar}
            style={{
              width: 32, height: 32, borderRadius: "var(--radius)",
              border: "none", background: "var(--surface-2)",
              cursor: "pointer", color: "var(--ink-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Título */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--ink)" }}>Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Reunião de liderança — sábado 19h"
              required
              style={{
                padding: "9px 12px", borderRadius: "var(--radius)",
                border: "1px solid var(--border)", fontSize: 14,
                outline: "none", background: "var(--surface)", color: "var(--ink)",
              }}
            />
          </div>

          {/* Mensagem */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--ink)" }}>Mensagem *</label>
            <textarea
              value={form.mensagem}
              onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
              placeholder="Escreva o comunicado completo aqui..."
              required
              rows={5}
              style={{
                padding: "9px 12px", borderRadius: "var(--radius)",
                border: "1px solid var(--border)", fontSize: 14,
                outline: "none", background: "var(--surface)", color: "var(--ink)",
                resize: "vertical", fontFamily: "var(--font-body)",
              }}
            />
          </div>

          {/* Categoria */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--ink)" }}>Categoria *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as Categoria }))}
              style={{
                padding: "9px 12px", borderRadius: "var(--radius)",
                border: "1px solid var(--border)", fontSize: 14,
                outline: "none", background: "var(--surface)",
                color: "var(--ink)", cursor: "pointer",
              }}
            >
              <option value="Aviso">Aviso</option>
              <option value="Urgente">Urgente</option>
              <option value="Informativo">Informativo</option>
            </select>
          </div>

          {/* Ações */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              onClick={onFechar}
              style={{
                padding: "9px 20px", borderRadius: "var(--radius)",
                border: "1px solid var(--border)", background: "var(--surface)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--ink-muted)",
              }}
            >Cancelar</button>
            <button
              type="submit"
              style={{
                padding: "9px 20px", borderRadius: "var(--radius)",
                border: "none", background: "var(--ink)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--primary)",
              }}
            >{comunicado ? "Salvar alterações" : "Publicar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Página principal ───────────────────────────────────── */
export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>(mockComunicados);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Comunicado | undefined>();
  const [filtro, setFiltro] = useState<Categoria | "Todos">("Todos");

  const isAdmin = perfilAtual === "Administrador";

  const filtrados = comunicados
    .filter((c) => filtro === "Todos" || c.categoria === filtro)
    .sort((a, b) => b.data.localeCompare(a.data));

  function abrirNovo() {
    setEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(c: Comunicado) {
    setEditando(c);
    setModalAberto(true);
  }

  function salvar(dados: Omit<Comunicado, "id" | "autor" | "data">) {
    if (editando) {
      setComunicados((prev) =>
        prev.map((c) => (c.id === editando.id ? { ...c, ...dados } : c))
      );
    } else {
      const novoId = Math.max(...comunicados.map((c) => c.id)) + 1;
      setComunicados((prev) => [
        { ...dados, id: novoId, autor: "Fagner Silva", data: new Date().toISOString().split("T")[0] },
        ...prev,
      ]);
    }
    setModalAberto(false);
  }

  function excluir(id: number) {
    if (confirm("Excluir este comunicado?")) {
      setComunicados((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: 860, margin: "0 auto" }}>

      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Comunicados</h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>
            {filtrados.length} comunicado{filtrados.length !== 1 ? "s" : ""} publicado{filtrados.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={abrirNovo}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: "var(--radius)",
              border: "none", background: "#3b82f6",
              fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#fff",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span style={{ fontSize: 16 }}>+</span> Novo Comunicado
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {(["Todos", "Aviso", "Urgente", "Informativo"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s",
              border: filtro === cat ? "none" : "1px solid var(--border)",
              background: filtro === cat ? "#3b82f6" : "var(--surface)",
              color: filtro === cat ? "#fff" : "var(--ink-muted)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtrados.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)" }}>
            Nenhum comunicado encontrado.
          </div>
        ) : (
          filtrados.map((c) => {
            const cfg = categoriaConfig[c.categoria];
            return (
              <div
                key={c.id}
                className="card animate-fade-in"
                style={{ padding: "20px 24px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>

                  {/* Conteúdo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 999,
                        fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg,
                      }}>
                        {c.categoria}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                        {formatarData(c.data)} · {c.autor}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, margin: "0 0 8px 0", fontWeight: 600 }}>{c.titulo}</h3>
                    <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
                      {c.mensagem}
                    </p>
                  </div>

                  {/* Ações admin */}
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => abrirEdicao(c)}
                        title="Editar"
                        style={{
                          width: 32, height: 32, borderRadius: "var(--radius)",
                          border: "1px solid var(--border)", background: "var(--surface)",
                          cursor: "pointer", color: "var(--ink-muted)", fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button
                        onClick={() => excluir(c.id)}
                        title="Excluir"
                        style={{
                          width: 32, height: 32, borderRadius: "var(--radius)",
                          border: "1px solid var(--border)", background: "var(--surface)",
                          cursor: "pointer", color: "var(--red)", fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <ModalComunicado
          comunicado={editando}
          onSalvar={salvar}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}