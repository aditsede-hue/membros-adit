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
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
                          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--blue)] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
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
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                      )}

                      {/* Editar */}
                      <button
                        title="Editar"
                        onClick={() => onEdit(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
                        {confirmDelete === p.id ? "Confirmar?" : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>}
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
                  <a href={`tel:${tel}`} className="w-8 h-8 flex items-center justify-center text-[var(--ink-muted)]"><svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
                )}
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 28 28" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
