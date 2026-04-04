"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { criaEvento, atualizaEvento } from "@/lib/db/eventos";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { TIPO_OPTIONS, getTipo } from "@/lib/agenda/tipos";
import type { Evento, NovoEvento } from "@/types";

interface Props {
  open:         boolean;
  onClose:      () => void;
  evento?:      Evento | null;
  dataPadrao?:  string;     // "YYYY-MM-DD" — pré-preenche ao clicar no dia
  onSaved:      () => void;
}

type FormState = {
  titulo:      string
  data_ini:    string
  data_fim:    string
  tipo:        string
  hora:        string
  responsavel: string
  obs:         string
}

const DEFAULT = (data?: string): FormState => ({
  titulo:      "",
  data_ini:    data ?? "",
  data_fim:    "",
  tipo:        "culto",
  hora:        "",
  responsavel: "",
  obs:         "",
})

export default function ModalEvento({ open, onClose, evento, dataPadrao, onSaved }: Props) {
  const isEdit = !!evento;
  const [form, setForm]           = useState<FormState>(DEFAULT(dataPadrao));
  const [tituloError, setTituloError] = useState("");
  const [dataError, setDataError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (evento) {
      setForm({
        titulo:      evento.titulo       ?? "",
        data_ini:    evento.data_ini     ?? "",
        data_fim:    evento.data_fim     ?? "",
        tipo:        evento.tipo         ?? "culto",
        hora:        evento.hora         ?? "",
        responsavel: evento.responsavel  ?? "",
        obs:         evento.obs          ?? "",
      });
    } else {
      setForm(DEFAULT(dataPadrao));
    }
    setTituloError("");
    setDataError("");
    setServerError("");
  }, [evento, dataPadrao, open]);

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "titulo") setTituloError("");
    if (key === "data_ini") setDataError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!form.titulo.trim()) { setTituloError("Título é obrigatório"); ok = false; }
    if (!form.data_ini)      { setDataError("Data de início é obrigatória"); ok = false; }
    if (!ok) return;

    setLoading(true);
    setServerError("");
    try {
      const supabase = createClient();
      const payload: NovoEvento = {
        titulo:      form.titulo.trim(),
        data_ini:    form.data_ini,
        data_fim:    form.data_fim     || undefined,
        tipo:        form.tipo,
        hora:        form.hora         || undefined,
        responsavel: form.responsavel  || undefined,
        obs:         form.obs          || undefined,
      };

      if (isEdit && evento) {
        await atualizaEvento(supabase, evento.id, payload);
      } else {
        await criaEvento(supabase, payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  const tipoAtual = getTipo(form.tipo);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar evento" : "Novo evento"}
      description={isEdit ? `Editando: ${evento?.titulo}` : "Preencha os dados do evento"}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Título */}
        <Input
          label="Título *"
          value={form.titulo}
          onChange={(e) => set("titulo", e.target.value)}
          error={tituloError}
          placeholder="Ex: Santa Ceia, Batismo, Convenção..."
          autoFocus
        />

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--ink)]">Tipo de evento</label>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ background: tipoAtual.cor }}
            />
            <select
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value)}
              className="flex-1 h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            >
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data início *"
            type="date"
            value={form.data_ini}
            onChange={(e) => set("data_ini", e.target.value)}
            error={dataError}
          />
          <Input
            label="Data fim (opcional)"
            type="date"
            value={form.data_fim}
            onChange={(e) => set("data_fim", e.target.value)}
          />
        </div>

        {/* Hora + Responsável */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Horário"
            type="time"
            value={form.hora}
            onChange={(e) => set("hora", e.target.value)}
          />
          <Input
            label="Responsável"
            value={form.responsavel}
            onChange={(e) => set("responsavel", e.target.value)}
            placeholder="Ex: Pr. Fagner"
          />
        </div>

        {/* Obs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--ink)]">Observações</label>
          <textarea
            value={form.obs}
            onChange={(e) => set("obs", e.target.value)}
            rows={2}
            placeholder="Informações adicionais..."
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </div>

        {serverError && (
          <p className="text-sm text-[var(--red)] bg-[#fde8e6] px-3 py-2 rounded-[var(--radius)]">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)] mt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? "Salvar alterações" : "Criar evento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
