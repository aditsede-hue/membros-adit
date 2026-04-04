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
      // Auto-cancela após 3s
      setTimeout(() => setConfirmDelete((cur) => (cur === p.id ? null : cur)), 3000);
    }
  }

  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0"
          >
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
        <span className="text-4xl">👥</span>
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
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide"
                >
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
                {/* Nome + Avatar */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.nome} size="sm" />
                    <div>
                      <p className="font-medium text-[var(--ink)] leading-tight">{p.nome}</p>
                      {p.email && (
                        <p className="text-xs text-[var(--ink-muted)] leading-tight">{p.email}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contato */}
                <td className="px-5 py-3.5 text-[var(--ink-muted)]">
                  {p.contato ?? <span className="text-[var(--border)]">—</span>}
                </td>

                {/* Tipo */}
                <td className="px-5 py-3.5">
                  <Badge variant={TIPO_BADGE[p.tipo] ?? "gray"}>
                    {TIPO_LABEL[p.tipo] ?? p.tipo}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <Badge variant={p.status === "ativo" ? "green" : "muted"} dot>
                    {p.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </td>

                {/* Ações */}
                <td
                  className="px-5 py-3.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1 justify-end">
                    {/* Visualizar */}
                    <ActionBtn
                      title="Visualizar"
                      onClick={() => onView(p)}
                    >
                      👁️
                    </ActionBtn>

                    {/* Editar */}
                    <ActionBtn
                      title="Editar"
                      onClick={() => onEdit(p)}
                    >
                      ✏️
                    </ActionBtn>

                    {/* Deletar com confirmação inline */}
                    <button
                      title={confirmDelete === p.id ? "Clique novamente para confirmar" : "Excluir"}
                      onClick={() => handleDeleteClick(p)}
                      className={[
                        "h-8 px-2 rounded-[var(--radius)] text-xs font-medium transition-all duration-150",
                        confirmDelete === p.id
                          ? "bg-[var(--red)] text-white"
                          : "text-[var(--ink-muted)] hover:bg-[#fde8e6] hover:text-[var(--red)]",
                      ].join(" ")}
                    >
                      {confirmDelete === p.id ? "Confirmar?" : "🗑️"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden divide-y divide-[var(--border)]">
        {pessoas.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-2)] cursor-pointer"
            onClick={() => onView(p)}
          >
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
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors text-base"
    >
      {children}
    </button>
  );
}
