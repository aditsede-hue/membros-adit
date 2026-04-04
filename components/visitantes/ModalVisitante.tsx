"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { criaPessoa, atualizaPessoa } from "@/lib/db/pessoas";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Pessoa, NovaPessoa } from "@/types";

interface Props {
  open:    boolean;
  onClose: () => void;
  pessoa?: Pessoa | null;
  onSaved: () => void;
}

type FormState = {
  nome:          string
  contato:       string
  email:         string
  como_conheceu: string
  primeira_vez:  boolean
  obs_pastoral:  string
  endereco:      string
}

const COMO_CONHECEU_OPTIONS = [
  { value: "amigo",         label: "Indicação de amigo" },
  { value: "familiar",      label: "Familiar" },
  { value: "redes_sociais", label: "Redes sociais" },
  { value: "convite",       label: "Convite pessoal" },
  { value: "panfleto",      label: "Panfleto / material" },
  { value: "outro",         label: "Outro" },
];

const DEFAULT: FormState = {
  nome:          "",
  contato:       "",
  email:         "",
  como_conheceu: "",
  primeira_vez:  true,
  obs_pastoral:  "",
  endereco:      "",
};

export default function ModalVisitante({ open, onClose, pessoa, onSaved }: Props) {
  const isEdit = !!pessoa;
  const [form, setForm]           = useState<FormState>(DEFAULT);
  const [nomeError, setNomeError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (pessoa) {
      setForm({
        nome:          pessoa.nome          ?? "",
        contato:       pessoa.contato       ?? "",
        email:         pessoa.email         ?? "",
        como_conheceu: pessoa.como_conheceu ?? "",
        primeira_vez:  pessoa.primeira_vez  ?? true,
        obs_pastoral:  pessoa.obs_pastoral  ?? "",
        endereco:      pessoa.endereco      ?? "",
      });
    } else {
      setForm(DEFAULT);
    }
    setNomeError("");
    setServerError("");
  }, [pessoa, open]);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "nome") setNomeError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setNomeError("Nome é obrigatório"); return; }

    setLoading(true);
    setServerError("");
    try {
      const supabase = createClient();

      // Mapeia para NovaPessoa, limpa strings vazias → null
      const payload: NovaPessoa = {
        nome:          form.nome.trim(),
        tipo:          "visitante",
        status:        "ativo",
        contato:       form.contato       || undefined,
        email:         form.email         || undefined,
        como_conheceu: form.como_conheceu || undefined,
        primeira_vez:  form.primeira_vez,
        obs_pastoral:  form.obs_pastoral  || undefined,
        endereco:      form.endereco      || undefined,
      };

      if (isEdit && pessoa) {
        await atualizaPessoa(supabase, pessoa.id, payload);
      } else {
        await criaPessoa(supabase, payload);
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar visitante" : "Novo visitante"}
      description={isEdit ? `Editando ${pessoa?.nome}` : "Registre a visita de uma nova pessoa"}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Nome */}
        <Input
          label="Nome completo *"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
          error={nomeError}
          placeholder="Ex: Maria Oliveira"
          autoFocus
        />

        {/* Contato */}
        <Input
          label="WhatsApp / Telefone"
          value={form.contato}
          onChange={(e) => set("contato", e.target.value)}
          placeholder="(61) 9 0000-0000"
          type="tel"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 9.5c0 .2-.05.4-.15.58-.1.19-.24.36-.42.5-.3.26-.63.38-.99.38-.26 0-.54-.06-.83-.19a8.4 8.4 0 01-.84-.46 14.7 14.7 0 01-.8-.64 14.4 14.4 0 01-.64-.8 8.4 8.4 0 01-.46-.84c-.13-.29-.19-.57-.19-.83 0-.35.12-.68.36-.98.24-.3.54-.46.87-.46.12 0 .24.03.35.08.11.06.21.14.29.26l.97 1.37c.08.11.14.22.18.32.04.1.06.2.06.29 0 .11-.03.22-.09.33-.06.11-.14.22-.24.33l-.33.34c-.05.05-.07.1-.07.16 0 .03 0 .06.02.09l.03.08c.1.18.27.41.5.68.23.27.48.55.74.82.27.26.54.5.82.72.27.22.5.38.68.47l.08.04c.03.01.06.02.1.02.06 0 .12-.03.16-.08l.33-.34c.11-.11.22-.19.33-.24.1-.06.22-.09.34-.09.1 0 .2.02.3.06.1.04.21.1.33.19l1.39.98c.12.09.2.19.25.31.05.12.07.24.07.37z" stroke="currentColor" strokeWidth="1.1"/>
            </svg>
          }
        />

        {/* Email */}
        <Input
          label="E-mail"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="email@exemplo.com"
          type="email"
        />

        {/* Como conheceu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--ink)]">
            Como conheceu a Igreja
          </label>
          <select
            value={form.como_conheceu}
            onChange={(e) => set("como_conheceu", e.target.value)}
            className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          >
            <option value="">— Selecione —</option>
            {COMO_CONHECEU_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Primeira vez */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => set("primeira_vez", !form.primeira_vez)}
            className={[
              "w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors shrink-0",
              form.primeira_vez
                ? "bg-[var(--gold)] border-[var(--gold)]"
                : "bg-[var(--surface)] border-[var(--border)] group-hover:border-[var(--gold)]",
            ].join(" ")}
          >
            {form.primeira_vez && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-[var(--ink)]">
            Primeira vez na igreja
          </span>
        </label>

        {/* Endereço */}
        <Input
          label="Endereço (opcional)"
          value={form.endereco}
          onChange={(e) => set("endereco", e.target.value)}
          placeholder="Bairro / Cidade"
        />

        {/* Observações */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--ink)]">
            Observações
          </label>
          <textarea
            value={form.obs_pastoral}
            onChange={(e) => set("obs_pastoral", e.target.value)}
            rows={3}
            placeholder="Pedidos de oração, necessidades especiais..."
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </div>

        {serverError && (
          <p className="text-sm text-[var(--red)] bg-[#fde8e6] px-3 py-2 rounded-[var(--radius)]">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)] mt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? "Salvar alterações" : "Registrar visita"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
