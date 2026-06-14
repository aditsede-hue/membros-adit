"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { Pessoa } from "@/types";

type BadgeVariant = "gold" | "green" | "blue" | "gray" | "red" | "muted";

interface Props {
  pessoas:   Pessoa[];
  loading:   boolean;
  onEdit:    (p: Pessoa) => void;
  onDelete:  (p: Pessoa) => void;
  onView:    (p: Pessoa) => void;
}

const TIPO_LABEL: Record<string, string> = {
  membro:       "Membro",
  visitante:    "Visitante",
  em_processo:  "Em processo",
};

const TIPO_BADGE: Record<string, BadgeVariant> = {
  membro:      "gold",
  visitante:   "blue",
  em_processo: "green",
};

export default function TabelaMembros({
  pessoas,
  loading,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleDeleteClick(p: Pessoa) {
    if (confirmDelete === p.id) {
      onDelete(p);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(p.id);
      setTimeout(() => setConfirmDelete((cur) => (cur === p.id ? null : cur)), 3000);
    }
  }

  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0">
            <div className="w-9 h-9 rounded-full bg-[var(--border)] animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-40 bg-[var(--border)] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[var(--border)] rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-[var(--border)] rounded-full animate-pulse" />
            <div className="h-5 w-12 bg-[var(--border)] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (pessoas.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <p className="text-sm font-medium text-[var(--ink)]">Nenhum resultado encontrado</p>
        <p className="text-xs text-[var(--ink-muted)]">Tente ajustar os filtros ou cadastre um novo membro.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {["Nome", "Contato", "Tipo", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pessoas.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                onClick={() => onView(p)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.nome} size="sm" />
                    <div>
                      <p className="font-medium text-[var(--ink)] leading-tight">{p.nome}</p>
                      {p.email && <p className="text-xs text-[var(--ink-muted)] leading-tight">{p.email}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[var(--ink-muted)]">
                  {p.contato ?? <span className="text-[var(--border)]">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={TIPO_BADGE[p.tipo] ?? "gray"}>{TIPO_LABEL[p.tipo] ?? p.tipo}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={p.status === "ativo" ? "green" : "muted"} dot>
                    {p.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 justify-end">
                    <ActionBtn title="Visualizar" onClick={() => onView(p)} color="#3b82f6">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </ActionBtn>
                    <ActionBtn title="Editar" onClick={() => onEdit(p)} color="#3b82f6">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </ActionBtn>
                    <button
                      title={confirmDelete === p.id ? "Clique novamente para confirmar" : "Excluir"}
                      onClick={() => handleDeleteClick(p)}
                      className={[
                        "h-8 px-2 rounded-[var(--radius)] text-xs font-medium transition-all duration-150",
                        confirmDelete === p.id
                          ? "bg-[var(--red)] text-white"
                          : "text-[var(--red)] hover:bg-[#fde8e6]",
                      ].join(" ")}
                    >
                      {confirmDelete === p.id ? "Confirmar?" : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden divide-y divide-[var(--border)]">
        {pessoas.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-2)] cursor-pointer" onClick={() => onView(p)}>
            <Avatar name={p.nome} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--ink)] truncate">{p.nome}</p>
              <p className="text-xs text-[var(--ink-muted)] truncate">{p.contato ?? p.email ?? "—"}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={TIPO_BADGE[p.tipo] ?? "gray"}>{TIPO_LABEL[p.tipo]}</Badge>
              <Badge variant={p.status === "ativo" ? "green" : "muted"} dot>
                {p.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({
  title, onClick, children, color,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--surface-2)] transition-colors"
      style={{ color }}
    >
      {children}
    </button>
  );
}