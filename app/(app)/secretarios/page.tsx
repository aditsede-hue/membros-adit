"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getResponsaveis, criaResponsavel, atualizaResponsavel, deletaResponsavel } from "@/lib/db/responsaveis";
import Topbar from "@/components/layout/Topbar";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import type { Responsavel, NovoResponsavel } from "@/types";

const SEED_RESPONSAVEIS: NovoResponsavel[] = [
  { nome: "Fagner Silva Ribeiro", email: "fagner@adit.com.br",  whatsapp: "(61) 99999-1111", cor_hex: "#1e3a5f", ativo: true },
  { nome: "Adriana de Jesus",     email: "adriana@adit.com.br", whatsapp: "(61) 98888-2222", cor_hex: "#7c3aed", ativo: true },
];

function getIniciais(nome: string): string {
  return nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarTelefone(tel: string): boolean {
  return /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(tel.trim());
}

export default function SecretariosPage() {
  const supabase = createClient();

  const [responsaveis,        setResponsaveis]        = useState<Responsavel[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [modalAberto,         setModalAberto]         = useState(false);
  const [secretarioEditando,  setSecretarioEditando]  = useState<Responsavel | null>(null);
  const [form,                setForm]                = useState<{ nome: string; email: string; telefone: string }>({ nome: "", email: "", telefone: "" });
  const [salvando,            setSalvando]            = useState(false);
  const [deletando,           setDeletando]           = useState(false);
  const [erros,               setErros]               = useState<{ nome?: string; email?: string; telefone?: string }>({});
  const [busca,               setBusca]               = useState("");
  const [confirmDelete,       setConfirmDelete]       = useState<Responsavel | null>(null);

  const carregarResponsaveis = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await getResponsaveis(supabase);
      setResponsaveis(lista);
      if (lista.length === 0) {
        const inseridos = await Promise.all(SEED_RESPONSAVEIS.map((s) => criaResponsavel(supabase, s)));
        setResponsaveis(inseridos);
      }
    } catch (e) {
      console.error("Erro ao carregar secretários:", e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { carregarResponsaveis(); }, [carregarResponsaveis]);

  function abrirCriar() {
    setSecretarioEditando(null);
    setForm({ nome: "", email: "", telefone: "" });
    setErros({});
    setModalAberto(true);
  }

  function abrirEditar(s: Responsavel) {
    setSecretarioEditando(s);
    setForm({ nome: s.nome, email: s.email ?? "", telefone: s.whatsapp ?? "" });
    setErros({});
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setSecretarioEditando(null);
  }

  async function salvar(avatarFile: File | null) {
    const errosNovos: typeof erros = {};
    if (!form.nome.trim())               errosNovos.nome     = "Nome é obrigatório";
    if (!validarEmail(form.email))        errosNovos.email    = "E-mail inválido";
    if (!validarTelefone(form.telefone))  errosNovos.telefone = "Formato: (61) 99999-1111";
    if (Object.keys(errosNovos).length) { setErros(errosNovos); return; }

    setSalvando(true);
    try {
      if (secretarioEditando) {
        let avatar_url: string | undefined = secretarioEditando.avatar_url ?? undefined;

        if (avatarFile) {
          const ext  = avatarFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${secretarioEditando.id}/${Date.now()}.${ext}`;
          const { data: upData, error: upErr } = await supabase.storage
            .from("secretarios")
            .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
          if (upData) {
            const { data: { publicUrl } } = supabase.storage
              .from("secretarios")
              .getPublicUrl(upData.path);
            avatar_url = publicUrl;
          }
        }

        const atualizado = await atualizaResponsavel(supabase, secretarioEditando.id, {
          nome:       form.nome.trim(),
          email:      form.email.trim(),
          whatsapp:   form.telefone.trim(),
          avatar_url,
        });
        setResponsaveis((prev) =>
          prev.map((s) => s.id === atualizado.id ? atualizado : s)
        );
      } else {
        const criado = await criaResponsavel(supabase, {
          nome:     form.nome.trim(),
          email:    form.email.trim(),
          whatsapp: form.telefone.trim(),
          cor_hex:  "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
          ativo:    true,
          avatar_url: null,
        });

        let finalSecretario = criado;

        if (avatarFile) {
          const ext  = avatarFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${criado.id}/${Date.now()}.${ext}`;
          const { data: upData } = await supabase.storage
            .from("secretarios")
            .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
          if (upData) {
            const { data: { publicUrl } } = supabase.storage
              .from("secretarios")
              .getPublicUrl(upData.path);
            const comFoto = await atualizaResponsavel(supabase, criado.id, { avatar_url: publicUrl });
            finalSecretario = comFoto;
          }
        }

        setResponsaveis((prev) => [...prev, finalSecretario]);
      }

      fecharModal();
    } catch (e) {
      console.error("Erro ao salvar:", e);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarDeletar() {
    if (!confirmDelete) return;
    setDeletando(true);
    try {
      await deletaResponsavel(supabase, confirmDelete.id);
      setResponsaveis((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e) {
      console.error("Erro ao deletar:", e);
    } finally {
      setDeletando(false);
    }
  }

  const filtrados = responsaveis.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (s.email ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const ativos   = responsaveis.filter((s) => s.ativo).length;
  const inativos = responsaveis.filter((s) => !s.ativo).length;

  return (
    <>
      <Topbar
        title="Secretários"
        subtitle={`${responsaveis.length} secretário${responsaveis.length !== 1 ? "s" : ""} cadastrado${responsaveis.length !== 1 ? "s" : ""}`}
        actions={
          <Button variant="primary" size="sm" onClick={abrirCriar}>
            + Novo Secretário
          </Button>
        }
      />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl">
          {/* Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="card p-4 flex items-center gap-3">
              <span className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0 bg-[#dbeafe] text-[#1e3a5f]">
                👥
              </span>
              <div>
                <p className="text-xl font-bold text-[var(--ink)]">{responsaveis.length}</p>
                <p className="text-xs text-[var(--ink-muted)]">Total</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <span className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0 bg-[#d4ede5] text-[#2d7a5f]">
                ✓
              </span>
              <div>
                <p className="text-xl font-bold text-[var(--green)]">{ativos}</p>
                <p className="text-xs text-[var(--ink-muted)]">Ativos</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <span className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0 bg-[#fde8e6] text-[#c0392b]">
                ⏸
              </span>
              <div>
                <p className="text-xl font-bold text-[var(--red)]">{inativos}</p>
                <p className="text-xs text-[var(--ink-muted)]">Inativos</p>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">🔍</span>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail…"
                className="w-full h-9 pl-8 pr-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {busca && (
                <button
                  onClick={() => setBusca("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-xs text-[var(--ink-muted)]">
              {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Grid */}
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-4xl">👤</span>
              <p className="text-base font-semibold text-[var(--ink)]">
                {busca ? "Nenhum resultado encontrado" : "Nenhum secretário cadastrado"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtrados.map((s) => (
                <div key={s.id} className="card group flex flex-col gap-4 p-5 hover:border-[var(--primary)] hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    {s.avatar_url ? (
                      <img
                        src={s.avatar_url}
                        alt={s.nome}
                        className="w-14 h-14 rounded-full object-cover shrink-0 shadow-sm ring-2 ring-[var(--border)]"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                        style={{ background: s.cor_hex || "#1e3a5f" }}
                      >
                        {getIniciais(s.nome)}
                      </div>
                    )}
                    <span
                      className={[
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        s.ativo
                          ? "bg-[#d4ede5] text-[#1a5c42]"
                          : "bg-[#fde8e6] text-[#9b1c1c]",
                      ].join(" ")}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <p className="font-semibold text-[var(--ink)] leading-snug">{s.nome}</p>
                    {s.email && (
                      <p className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5">
                        📧 <span className="truncate">{s.email}</span>
                      </p>
                    )}
                    {s.whatsapp && (
                      <p className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5">
                        📱 <span>{s.whatsapp}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                    <button
                      onClick={() => abrirEditar(s)}
                      className="flex-1 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--primary)] transition-all flex items-center justify-center gap-1.5"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(s)}
                      className="h-8 px-3 rounded-[var(--radius)] border border-transparent text-[var(--ink-muted)] hover:text-[#9b1c1c] hover:bg-[#fde8e6] hover:border-[#fca5a5] transition-all flex items-center justify-center"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <Modal
        open={modalAberto}
        onClose={fecharModal}
        title={secretarioEditando ? "Editar Secretário" : "Novo Secretário"}
        size="sm"
      >
        <ModalSecretarioContent
          form={form}
          setForm={setForm}
          erros={erros}
          setErros={setErros}
          editando={!!secretarioEditando}
          salvando={salvando}
          currentAvatarUrl={secretarioEditando?.avatar_url}
          onClose={fecharModal}
          onSalvar={salvar}
        />
      </Modal>

      {/* Confirmar deleção */}
      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(null)} title="Confirmar exclusão" size="sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5 shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">
                  Tem certeza que quer deletar <strong>{confirmDelete.nome}</strong>?
                </p>
                <p className="text-xs text-[var(--ink-muted)] mt-1">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)} disabled={deletando}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" loading={deletando} onClick={confirmarDeletar}>
                Deletar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function ModalSecretarioContent({
  form, setForm, erros, setErros, editando, salvando, currentAvatarUrl, onClose, onSalvar,
}: {
  form: { nome: string; email: string; telefone: string };
  setForm: React.Dispatch<React.SetStateAction<{ nome: string; email: string; telefone: string }>>;
  erros: { nome?: string; email?: string; telefone?: string };
  setErros: React.Dispatch<React.SetStateAction<{ nome?: string; email?: string; telefone?: string }>>;
  editando: boolean;
  salvando: boolean;
  currentAvatarUrl?: string;
  onClose: () => void;
  onSalvar: (file: File | null) => void;
}) {
  const [avatarFile,     setAvatarFile]     = useState<File | null>(null);
  const [avatarPreview,  setAvatarPreview]  = useState<string>("");
  const [erroFormato,    setErroFormato]    = useState<string>("");

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErros((e) => ({ ...e, [k]: undefined }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";

    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const tipoOk = ["jpg", "jpeg", "png"].includes(ext) &&
                   ["image/jpeg", "image/png"].includes(file.type);

    if (!tipoOk) {
      setErroFormato("Apenas JPG e PNG são aceitos");
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }

    setErroFormato("");
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const previewSrc = avatarPreview || currentAvatarUrl || "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover shrink-0 shadow-sm ring-2 ring-[var(--border)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm bg-[#1e3a5f]">
              {form.nome ? getIniciais(form.nome) : "S"}
            </div>
          )}
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center cursor-pointer hover:opacity-90 shadow"
            title="Enviar foto"
          >
            📷
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--ink)]">
            {previewSrc ? "Foto selecionada" : "Foto do secretário"}
          </p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            {previewSrc
              ? "Clique na câmera para trocar"
              : "Clique na câmera ou deixe em branco para usar as iniciais"}
          </p>
          {erroFormato && (
            <p className="mt-1 text-[11px] text-[var(--red)] font-medium flex items-center gap-1">
              ⚠️ {erroFormato}
            </p>
          )}
        </div>
      </div>

      <Input
        label="Nome completo"
        value={form.nome}
        onChange={(e) => set("nome", e.target.value)}
        error={erros.nome}
        placeholder="Ex: João da Silva"
        autoFocus
      />

      <Input
        label="E-mail"
        type="email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={erros.email}
        placeholder="joao@adit.com.br"
      />

      <Input
        label="Telefone (WhatsApp)"
        value={form.telefone}
        onChange={(e) => set("telefone", e.target.value)}
        error={erros.telefone}
        placeholder="(61) 99999-0000"
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={salvando}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" loading={salvando} onClick={() => onSalvar(avatarFile)}>
          {editando ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </div>
  );
}