"use client";

import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { Pessoa } from "@/types";

interface Props {
  open:    boolean;
  onClose: () => void;
  pessoa:  Pessoa | null;
  onEdit:  (p: Pessoa) => void;
}

const TIPO_LABEL: Record<string, string> = {
  membro:      "Membro",
  visitante:   "Visitante",
  em_processo: "Em processo",
};

const TIPO_BADGE: Record<string, "gold" | "blue" | "green" | "gray"> = {
  membro:      "gold",
  visitante:   "blue",
  em_processo: "green",
};

function formatDate(s?: string | null) {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
        {label}
      </span>
      <span className="text-sm text-[var(--ink)]">{value || "—"}</span>
    </div>
  );
}

export default function ModalDetalhes({ open, onClose, pessoa, onEdit }: Props) {
  if (!pessoa) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
    >
      {/* Header com avatar */}
      <div className="flex items-start gap-4 pb-5 border-b border-[var(--border)] -mt-1">
        <Avatar name={pessoa.nome} size="lg" />
        <div className="flex-1 min-w-0">
          <h2
            className="text-xl font-semibold text-[var(--ink)] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {pessoa.nome}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={TIPO_BADGE[pessoa.tipo] ?? "gray"}>
              {TIPO_LABEL[pessoa.tipo] ?? pessoa.tipo}
            </Badge>
            <Badge variant={pessoa.status === "ativo" ? "green" : "muted"} dot>
              {pessoa.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(pessoa)}
        >
          ✏️ Editar
        </Button>
      </div>

      {/* Dados em grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5">
        <Campo label="Contato"         value={pessoa.contato} />
        <Campo label="E-mail"          value={pessoa.email} />
        <Campo label="Data nascimento" value={formatDate(pessoa.data_nascimento)} />
        <Campo label="Data batismo"    value={formatDate(pessoa.data_batismo)} />
        <Campo label="Estado civil"    value={pessoa.estado_civil} />
        <Campo label="Como conheceu"   value={pessoa.como_conheceu} />
        <div className="col-span-2">
          <Campo label="Endereço"      value={pessoa.endereco} />
        </div>
        {pessoa.obs_pastoral && (
          <div className="col-span-2 p-3 rounded-[var(--radius)] bg-[#fdf3d7] border border-[var(--gold-light)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b6314] mb-1">
              Obs. pastoral
            </p>
            <p className="text-sm text-[var(--ink)]">{pessoa.obs_pastoral}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--ink-muted)] mt-5 pt-4 border-t border-[var(--border)]">
        Cadastrado em {formatDate(pessoa.criado_em?.split("T")[0])}
      </p>
    </Modal>
  );
}
