"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { criaPessoa, atualizaPessoa } from "@/lib/db/pessoas";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Pessoa, NovaPessoa } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  pessoa?: Pessoa | null;
  onSaved: () => void;
}

const TIPO_OPTIONS = [
  { value: "visitante",    label: "Visitante" },
  { value: "em_processo",  label: "Em processo" },
  { value: "membro",       label: "Membro" },
];

const STATUS_OPTIONS = [
  { value: "ativo",   label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

const ESTADO_CIVIL_OPTIONS = [
  { value: "solteiro",   label: "Solteiro(a)" },
  { value: "casado",     label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo",      label: "Viúvo(a)" },
  { value: "outro",      label: "Outro" },
];

const EMPTY: Omit<NovaPessoa, "status" | "tipo"> = {
  nome: "",
  contato: "",
  email: "",
  endereco: "",
  data_nascimento: "",
  data_batismo: "",
  estado_civil: "",
  obs_pastoral: "",
  como_conheceu: "",
  primeira_vez: true,
};

type FormState = Omit<NovaPessoa, "status" | "tipo"> & {
  tipo:   Pessoa["tipo"]
  status: Pessoa["status"]
}

const DEFAULT_FORM: FormState = { ...EMPTY, tipo: "visitante", status: "ativo" }

export default function ModalMembro({ open, onClose, pessoa, onSaved }: Props) {
  const isEdit = !!pessoa;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NovaPessoa, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Preenche form ao editar
  useEffect(() => {
    if (pessoa) {
      setForm({
        nome:            pessoa.nome ?? "",
        tipo:            pessoa.tipo ?? "visitante",
        status:          pessoa.status ?? "ativo",
        contato:         pessoa.contato ?? "",
        email:           pessoa.email ?? "",
        endereco:        pessoa.endereco ?? "",
        data_nascimento: pessoa.data_nascimento ?? "",
        data_batismo:    pessoa.data_batismo ?? "",
        estado_civil:    pessoa.estado_civil ?? "",
        obs_pastoral:    pessoa.obs_pastoral ?? "",
        como_conheceu:   pessoa.como_conheceu ?? "",
        primeira_vez:    pessoa.primeira_vez ?? false,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
    setServerError("");
  }, [pessoa, open]);

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.nome.trim()) errs.nome = "Nome é obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const supabase = createClient();
      // Remove campos vazios opcionais para não enviar "" para o banco
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
      ) as NovaPessoa;

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
      title={isEdit ? "Editar membro" : "Novo membro"}
      description={isEdit ? `Editando ${pessoa?.nome}` : "Preencha os dados para cadastrar"}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Grid 2 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="sm:col-span-2">
            <Input
              label="Nome completo *"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              error={errors.nome}
              placeholder="Ex: João da Silva"
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            >
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Contato */}
          <Input
            label="WhatsApp / Telefone"
            value={form.contato ?? ""}
            onChange={(e) => set("contato", e.target.value)}
            placeholder="(61) 9 0000-0000"
            type="tel"
          />

          {/* Email */}
          <Input
            label="E-mail"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@exemplo.com"
            type="email"
          />

          {/* Data nascimento */}
          <Input
            label="Data de nascimento"
            value={form.data_nascimento ?? ""}
            onChange={(e) => set("data_nascimento", e.target.value)}
            type="date"
          />

          {/* Data batismo */}
          <Input
            label="Data de batismo"
            value={form.data_batismo ?? ""}
            onChange={(e) => set("data_batismo", e.target.value)}
            type="date"
          />

          {/* Estado civil */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">Estado civil</label>
            <select
              value={form.estado_civil ?? ""}
              onChange={(e) => set("estado_civil", e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            >
              <option value="">— Selecione —</option>
              {ESTADO_CIVIL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Como conheceu */}
          <Input
            label="Como conheceu a igreja"
            value={form.como_conheceu ?? ""}
            onChange={(e) => set("como_conheceu", e.target.value)}
            placeholder="Ex: amigo, redes sociais..."
          />

          {/* Endereço */}
          <div className="sm:col-span-2">
            <Input
              label="Endereço"
              value={form.endereco ?? ""}
              onChange={(e) => set("endereco", e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </div>

          {/* Obs pastoral */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">
              Observações pastorais
            </label>
            <textarea
              value={form.obs_pastoral ?? ""}
              onChange={(e) => set("obs_pastoral", e.target.value)}
              rows={3}
              placeholder="Anotações internas, pedidos de oração..."
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
          </div>
        </div>

        {/* Erro servidor */}
        {serverError && (
          <p className="mt-4 text-sm text-[var(--red)] bg-[#fde8e6] px-3 py-2 rounded-[var(--radius)]">
            {serverError}
          </p>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? "Salvar alterações" : "Cadastrar membro"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
