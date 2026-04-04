"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { Pessoa } from "@/types";

interface Props {
  pessoas:  Pessoa[];
  loading:  boolean;
  onEdit:   (p: Pessoa) => void;
  onDelete: (p: Pessoa) => void;
}

/** Remove tudo que não seja dígito e prefixa +55 para o link wa.me */
function fmtWhatsApp(contato?: string | null): string | null {
  if (!contato) return null;
  const digits = contato.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // Se já vier com DDI, usa direto; senão adiciona 55 (Brasil)
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TabelaVisitantes({
  pessoas,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleDeleteClick(p: Pessoa) {
    if (confirmDelete === p.id) {
      onDelete(p);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(p.id);
      setTimeout(() => setConfirmDelete((c) => (c === p.id ? null : c)), 3000);
    }
  }

  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0">
            <div className="w-9 h-9 rounded-full bg-[var(--border)] animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-36 bg-[var(--border)] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[var(--border)] rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-[var(--border)] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (pessoas.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-4xl">🤝</span>
        <p className="text-sm font-medium text-[var(--ink)]">Nenhum visitante encontrado</p>
        <p className="text-xs text-[var(--ink-muted)]">
          Registre a visita de uma nova pessoa clicando em "+ Novo visitante".
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {["Nome", "Contato", "Visita", "Registrado em", ""].map((h) => (
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
            {pessoas.map((p) => {
              const wa   = fmtWhatsApp(p.contato);
              const tel  = p.contato?.replace(/\D/g, "") ?? null;

              return (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors"
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

                  {/* Tipo visita */}
                  <td className="px-5 py-3.5">
                    {p.primeira_vez ? (
                      <Badge variant="blue" dot>1ª visita</Badge>
                    ) : (
                      <Badge variant="green" dot>Retornou</Badge>
                    )}
                  </td>

                  {/* Data */}
                  <td className="px-5 py-3.5 text-[var(--ink-muted)] text-xs">
                    {formatDate(p.criado_em)}
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {/* Ligar */}
                      {tel && (
                        <a
                          href={`tel:${tel}`}
                          title="Ligar"
                          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--blue)] transition-colors text-base"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📞
                        </a>
                      )}

                      {/* WhatsApp */}
                      {wa && (
                        <a
                          href={`https://wa.me/${wa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir WhatsApp"
                          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] transition-colors text-base"
                          style={{ color: "#6b7280" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#25d366")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                          onClick={(e) => e.stopPropagation()}
                        >
                          💬
                        </a>
                      )}

                      {/* Editar */}
                      <button
                        title="Editar"
                        onClick={() => onEdit(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors text-base"
                      >
                        ✏️
                      </button>

                      {/* Deletar */}
                      <button
                        title={confirmDelete === p.id ? "Clique para confirmar exclusão" : "Excluir"}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden divide-y divide-[var(--border)]">
        {pessoas.map((p) => {
          const wa  = fmtWhatsApp(p.contato);
          const tel = p.contato?.replace(/\D/g, "") ?? null;

          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
              <Avatar name={p.nome} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--ink)] truncate">{p.nome}</p>
                <p className="text-xs text-[var(--ink-muted)]">{p.contato ?? "—"}</p>
                <div className="mt-1">
                  {p.primeira_vez
                    ? <Badge variant="blue" dot>1ª visita</Badge>
                    : <Badge variant="green" dot>Retornou</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {tel && (
                  <a href={`tel:${tel}`} className="text-lg">📞</a>
                )}
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-lg">💬</a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
