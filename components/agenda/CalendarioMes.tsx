"use client";

import { useMemo } from "react";
import { getTipo } from "@/lib/agenda/tipos";
import type { Evento } from "@/types";

interface Props {
  ano:      number;
  mes:      number;  // 0–11
  eventos:  Evento[];
  onDiaClick:    (data: string) => void;
  onEventoClick: (e: Evento) => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function hoje() {
  return new Date().toISOString().split("T")[0];
}

export default function CalendarioMes({ ano, mes, eventos, onDiaClick, onEventoClick }: Props) {
  const HOJE = hoje();

  // Mapa de data → eventos
  const eventosPorDia = useMemo(() => {
    const map = new Map<string, Evento[]>();
    for (const ev of eventos) {
      if (!ev.data_ini) continue;

      // Para eventos multi-dia, adiciona em todos os dias do intervalo
      const inicio = new Date(ev.data_ini + "T12:00:00");
      const fim    = ev.data_fim ? new Date(ev.data_fim + "T12:00:00") : inicio;

      let cur = new Date(inicio);
      while (cur <= fim) {
        const key = cur.toISOString().split("T")[0];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [eventos]);

  // Gera grid do mês
  const { cells } = useMemo(() => {
    const primeiroDia = new Date(ano, mes, 1).getDay(); // 0=dom
    const diasNoMes   = new Date(ano, mes + 1, 0).getDate();
    const cells: Array<{ dia: number | null; iso: string }> = [];

    // Células vazias antes do dia 1
    for (let i = 0; i < primeiroDia; i++) cells.push({ dia: null, iso: "" });

    // Dias do mês
    for (let d = 1; d <= diasNoMes; d++) {
      cells.push({ dia: d, iso: isoDate(ano, mes, d) });
    }

    // Completa para múltiplo de 7
    while (cells.length % 7 !== 0) cells.push({ dia: null, iso: "" });

    return { cells };
  }, [ano, mes]);

  return (
    <div className="card overflow-hidden">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {DIAS_SEMANA.map((d, i) => (
          <div
            key={d}
            className={[
              "py-2 text-center text-xs font-semibold uppercase tracking-wide",
              i === 0 || i === 6 ? "text-[var(--red)]" : "text-[var(--ink-muted)]",
            ].join(" ")}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (!cell.dia) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[100px] border-b border-r border-[var(--border)] bg-[var(--surface-2)] last-of-type:border-r-0"
              />
            );
          }

          const isHoje   = cell.iso === HOJE;
          const isFimSem = (idx % 7 === 0) || (idx % 7 === 6);
          const evsDia   = eventosPorDia.get(cell.iso) ?? [];
          const MAX      = 3;
          const visiveis = evsDia.slice(0, MAX);
          const extras   = evsDia.length - MAX;

          return (
            <div
              key={cell.iso}
              onClick={() => onDiaClick(cell.iso)}
              className={[
                "min-h-[100px] p-1.5 border-b border-r border-[var(--border)] cursor-pointer transition-colors",
                "hover:bg-[var(--surface-2)] flex flex-col gap-1",
                isFimSem ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]",
              ].join(" ")}
            >
              {/* Número do dia */}
              <span
                className={[
                  "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mx-auto shrink-0",
                  isHoje
                    ? "bg-[var(--gold)] text-white"
                    : isFimSem
                    ? "text-[var(--red)]"
                    : "text-[var(--ink)]",
                ].join(" ")}
              >
                {cell.dia}
              </span>

              {/* Pílulas de eventos */}
              <div className="flex flex-col gap-0.5">
                {visiveis.map((ev) => {
                  const cfg = getTipo(ev.tipo);
                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventoClick(ev); }}
                      title={ev.titulo}
                      style={{ background: cfg.bg, color: cfg.cor }}
                      className="w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight hover:opacity-80 transition-opacity"
                    >
                      {cfg.icon} {ev.titulo}
                    </button>
                  );
                })}
                {extras > 0 && (
                  <span className="text-[10px] text-[var(--ink-muted)] pl-1">
                    +{extras} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
