"use client";

import { useState } from "react";
import { getTipo } from "@/lib/agenda/tipos";
import type { Evento } from "@/types";

interface Props {
  eventos:  Evento[];
  onEdit:   (e: Evento) => void;
  onDelete: (e: Evento) => void;
}

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function formatHora(h?: string | null) {
  if (!h) return null;
  return h.slice(0, 5); // "HH:MM"
}

function formatDataCurta(iso: string) {
  const [, , d] = iso.split("-");
  return parseInt(d, 10);
}

function formatMesAno(ano: number, mes: number) {
  return `${MESES[mes]} ${ano}`;
}

export default function ListaEventos({ eventos, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleDelete(ev: Evento) {
    if (confirmDelete === ev.id) {
      onDelete(ev);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(ev.id);
      setTimeout(() => setConfirmDelete((c) => (c === ev.id ? null : c)), 3000);
    }
  }

  if (eventos.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-4xl">📅</span>
        <p className="text-sm font-medium text-[var(--ink)]">Nenhum evento cadastrado</p>
        <p className="text-xs text-[var(--ink-muted)]">Clique em "+ Novo evento" para adicionar.</p>
      </div>
    );
  }

  // Agrupa por ano-mês
  const grupos = new Map<string, Evento[]>();
  for (const ev of eventos) {
    const [y, m] = ev.data_ini.split("-").map(Number);
    const chave  = `${y}-${String(m).padStart(2, "0")}`;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(ev);
  }

  // Ordena grupos cronologicamente
  const gruposOrdenados = [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-6">
      {gruposOrdenados.map(([chave, evs]) => {
        const [y, m] = chave.split("-").map(Number);

        return (
          <div key={chave}>
            {/* Cabeçalho do mês */}
            <div className="flex items-center gap-3 mb-3">
              <h3
                className="text-sm font-semibold text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatMesAno(y, m - 1)}
              </h3>
              <span className="text-xs text-[var(--ink-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                {evs.length} {evs.length === 1 ? "evento" : "eventos"}
              </span>
            </div>

            <div className="card overflow-hidden">
              {evs.map((ev, i) => {
                const cfg  = getTipo(ev.tipo);
                const dia  = formatDataCurta(ev.data_ini);
                const hora = formatHora(ev.hora);
                const isLast = i === evs.length - 1;

                return (
                  <div
                    key={ev.id}
                    className={[
                      "flex items-start gap-4 px-5 py-4 hover:bg-[var(--surface-2)] transition-colors group",
                      !isLast ? "border-b border-[var(--border)]" : "",
                    ].join(" ")}
                  >
                    {/* Data */}
                    <div className="shrink-0 w-10 flex flex-col items-center">
                      <span className="text-xl font-bold text-[var(--ink)] leading-none">
                        {dia}
                      </span>
                      <span className="text-[10px] text-[var(--ink-muted)] uppercase">
                        {MESES[m - 1].slice(0, 3)}
                      </span>
                    </div>

                    {/* Linha colorida */}
                    <div
                      className="w-0.5 self-stretch rounded-full mt-1 shrink-0"
                      style={{ background: cfg.cor, opacity: 0.6 }}
                    />

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base leading-none">{cfg.icon}</span>
                        <p className="font-medium text-[var(--ink)] leading-tight truncate">
                          {ev.titulo}
                        </p>
                        {ev.data_fim && ev.data_fim !== ev.data_ini && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            até {formatDataCurta(ev.data_fim)}/{m}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--ink-muted)] flex-wrap">
                        {hora && <span>🕐 {hora}</span>}
                        {ev.responsavel && <span>👤 {ev.responsavel}</span>}
                        {ev.obs && (
                          <span
                            className="truncate max-w-[200px]"
                            title={ev.obs}
                          >
                            💬 {ev.obs}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tipo badge */}
                    <span
                      style={{ background: cfg.bg, color: cfg.cor }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline"
                    >
                      {cfg.label}
                    </span>

                    {/* Ações */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Editar"
                        onClick={() => onEdit(ev)}
                        className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        title={confirmDelete === ev.id ? "Confirmar exclusão" : "Excluir"}
                        onClick={() => handleDelete(ev)}
                        className={[
                          "h-7 px-1.5 rounded-[var(--radius)] text-xs font-medium transition-all",
                          confirmDelete === ev.id
                            ? "bg-[var(--red)] text-white"
                            : "text-[var(--ink-muted)] hover:bg-[#fde8e6] hover:text-[var(--red)]",
                        ].join(" ")}
                      >
                        {confirmDelete === ev.id ? "Confirmar?" : "🗑️"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
