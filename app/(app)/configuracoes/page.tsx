"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePerfil } from "@/lib/usePerfil";
import { useTema, PALETA, type CorTema, type ModoTema, type Tema } from "@/lib/TemaProvider";
import { useIgreja } from "@/lib/IgrejaProvider";
import Topbar from "@/components/layout/Topbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ConfigForm {
  nome: string;
  subtitulo: string;
  pastor: string;
  endereco: string;
  telefone: string;
  email: string;
  notif_whatsapp: boolean;
  notif_email: boolean;
}

export default function ConfiguracoesPage() {
  const supabase = createClient();
  const { perfil } = usePerfil();
  const { tema, setTema, salvarTema } = useTema();
  const { config, recarregar } = useIgreja();
  const fileRef = useRef<HTMLInputElement>(null);

  const isAdmin = perfil?.role === "admin";

  const [form, setForm] = useState<ConfigForm>({
    nome: "", subtitulo: "", pastor: "",
    endereco: "", telefone: "", email: "",
    notif_whatsapp: false, notif_email: false,
  });
  const [logoPreview, setLogoPreview] = useState("/logo-secretaria.jpeg");
  const [uploadando, setUploadando] = useState(false);
  const [salvandoIgreja, setSalvandoIgreja] = useState(false);
  const [okIgreja, setOkIgreja] = useState(false);

  const [temaLocal, setTemaLocal] = useState<Tema>(tema);
  const [salvandoTema, setSalvandoTema] = useState(false);
  const [okTema, setOkTema] = useState(false);

  const [nomeLocal, setNomeLocal] = useState("");
  const [salvandoConta, setSalvandoConta] = useState(false);
  const [okConta, setOkConta] = useState(false);

  useEffect(() => {
    setForm({
      nome:           config.nome,
      subtitulo:      config.subtitulo,
      pastor:         config.pastor,
      endereco:       config.endereco,
      telefone:       config.telefone,
      email:          config.email,
      notif_whatsapp: config.notif_whatsapp,
      notif_email:    config.notif_email,
    });
    setLogoPreview(config.logo_url || "/logo-secretaria.jpeg");
    setTemaLocal(tema);
    if (perfil?.nome) setNomeLocal(perfil.nome);
  }, [config, tema, perfil]);

  // ── Upload de logo ────────────────────────────────────────────────────────

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local imediato
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadando(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logo/logo-igreja.${ext}`;

      const { error: upError } = await supabase.storage
        .from("igreja")
        .upload(path, file, { upsert: true });

      if (upError) {
  console.error("Erro upload:", upError);
  alert("Erro: " + upError.message);
  throw upError;
}

      const { data: urlData } = supabase.storage.from("igreja").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase.from("config_igreja").update({ logo_url: publicUrl }).eq("id", 1);
      await recarregar();
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
    } finally {
      setUploadando(false);
    }
  }

  // ── Salvar dados da igreja ────────────────────────────────────────────────

  async function salvarIgreja() {
    setSalvandoIgreja(true);
    setOkIgreja(false);
    try {
      await supabase.from("config_igreja").update({
        nome:           form.nome,
        subtitulo:      form.subtitulo,
        pastor:         form.pastor,
        endereco:       form.endereco,
        telefone:       form.telefone,
        email:          form.email,
        notif_whatsapp: form.notif_whatsapp,
        notif_email:    form.notif_email,
        atualizado_em:  new Date().toISOString(),
      }).eq("id", 1);
      await recarregar();
      setOkIgreja(true);
      setTimeout(() => setOkIgreja(false), 3000);
    } finally {
      setSalvandoIgreja(false);
    }
  }

  // ── Tema ──────────────────────────────────────────────────────────────────

  function previewTema(novo: Partial<Tema>) {
    const t = { ...temaLocal, ...novo };
    setTemaLocal(t);
    setTema(t);
  }

  async function handleSalvarTema() {
    setSalvandoTema(true);
    setOkTema(false);
    setTema(temaLocal);
    await salvarTema(temaLocal);
    setSalvandoTema(false);
    setOkTema(true);
    setTimeout(() => setOkTema(false), 3000);
  }

  // ── Conta ─────────────────────────────────────────────────────────────────

  async function salvarConta() {
    if (!perfil) return;
    setSalvandoConta(true);
    setOkConta(false);
    try {
      await supabase.from("perfis").update({ nome: nomeLocal.trim() }).eq("id", perfil.id);
      setOkConta(true);
      setTimeout(() => setOkConta(false), 3000);
    } finally {
      setSalvandoConta(false);
    }
  }

  return (
    <>
      <Topbar title="Configurações" subtitle="Personalize o sistema" />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 overflow-auto">
        <div className="p-6 max-w-2xl flex flex-col gap-6">

          {/* ── Identidade da Igreja ── */}
          {isAdmin && (
            <section className="card p-6">
              <h2 className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Identidade da Igreja
              </h2>

              {/* Upload de logo */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border)]"
                  />
                  {uploadando && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--ink)] mb-1">Logo do sistema</p>
                  <p className="text-xs text-[var(--ink-muted)] mb-2">Aparece no topo da sidebar. JPG ou PNG.</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} disabled={uploadando}>
                    {uploadando ? "Enviando…" : "Trocar foto"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nome exibido na sidebar"
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Secretaria Geral"
                  />
                  <Input
                    label="Subtítulo da sidebar"
                    value={form.subtitulo}
                    onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))}
                    placeholder="Ex: Assembleia de Deus"
                  />
                </div>
                <Input
                  label="Pastor titular"
                  value={form.pastor}
                  onChange={e => setForm(f => ({ ...f, pastor: e.target.value }))}
                  placeholder="Ex: Pastor João Silva"
                />
                <Input
                  label="Endereço"
                  value={form.endereco}
                  onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro, cidade"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Telefone"
                    value={form.telefone}
                    onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                    placeholder="(61) 99999-9999"
                  />
                  <Input
                    label="E-mail da secretaria"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="secretaria@igreja.com"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  {okIgreja && <span className="text-sm text-[var(--primary)] font-medium">Salvo com sucesso!</span>}
                  {!okIgreja && <span />}
                  <Button variant="primary" size="sm" loading={salvandoIgreja} onClick={salvarIgreja}>
                    Salvar dados
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── Notificações ── */}
          {isAdmin && (
            <section className="card p-6">
              <h2 className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                Notificações
              </h2>
              <div className="flex flex-col gap-3">
                <Toggle
                  label="Notificações por WhatsApp"
                  descricao="Avisos de tarefas, escalas e visitantes via WhatsApp"
                  ativo={form.notif_whatsapp}
                  onChange={v => setForm(f => ({ ...f, notif_whatsapp: v }))}
                />
                <Toggle
                  label="Notificações por E-mail"
                  descricao="Relatórios semanais e lembretes por e-mail"
                  ativo={form.notif_email}
                  onChange={v => setForm(f => ({ ...f, notif_email: v }))}
                />
                <div className="flex justify-end pt-1">
                  <Button variant="primary" size="sm" loading={salvandoIgreja} onClick={salvarIgreja}>
                    Salvar
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── Aparência ── */}
          <section className="card p-6">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20"/><path d="M2 12h20"/></svg>
              Aparência
            </h2>

            <p className="text-sm font-medium text-[var(--ink)] mb-2">Modo</p>
            <div className="flex gap-2 mb-5">
              {(["claro", "escuro"] as ModoTema[]).map((m) => (
                <button
                  key={m}
                  onClick={() => previewTema({ modo: m })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] border text-sm font-medium transition-all"
                  style={
                    temaLocal.modo === m
                      ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }
                      : { background: "var(--surface-2)", color: "var(--ink-muted)", borderColor: "var(--border)" }
                  }
                >
                  {m === "claro"
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                  }
                  {m === "claro" ? "Claro" : "Escuro"}
                </button>
              ))}
            </div>

            <p className="text-sm font-medium text-[var(--ink)] mb-2">Cor de destaque</p>
            <div className="grid grid-cols-7 gap-2 mb-5">
              {(Object.entries(PALETA) as [CorTema, typeof PALETA[CorTema]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => previewTema({ cor: key })}
                  title={val.label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className="w-9 h-9 rounded-full transition-all"
                    style={{
                      background: val.primary,
                      outline: temaLocal.cor === key ? `3px solid ${val.primary}` : "none",
                      outlineOffset: 2,
                      transform: temaLocal.cor === key ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                  <span className="text-[9px] text-[var(--ink-muted)]">{val.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-1">
              {okTema
                ? <span className="text-sm text-[var(--primary)] font-medium">Tema salvo!</span>
                : <span className="text-xs text-[var(--ink-muted)]">Preview em tempo real</span>
              }
              <Button variant="primary" size="sm" loading={salvandoTema} onClick={handleSalvarTema}>
                Salvar tema
              </Button>
            </div>
          </section>

          {/* ── Minha Conta ── */}
          <section className="card p-6">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Minha Conta
            </h2>
            <div className="flex flex-col gap-3">
              <Input
                label="Seu nome"
                value={nomeLocal}
                onChange={e => setNomeLocal(e.target.value)}
                placeholder="Seu nome completo"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[var(--ink)]">E-mail</label>
                <p className="text-sm text-[var(--ink-muted)] bg-[var(--surface-2)] px-3 py-2 rounded-[var(--radius)] border border-[var(--border)]">
                  {perfil?.email ?? "—"}
                </p>
                <p className="text-xs text-[var(--ink-muted)]">O e-mail não pode ser alterado aqui.</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[var(--ink)]">Perfil de acesso</label>
                <p className="text-sm text-[var(--ink-muted)] bg-[var(--surface-2)] px-3 py-2 rounded-[var(--radius)] border border-[var(--border)]">
                  {perfil?.role === "admin" ? "Administrador" : perfil?.role === "pastor" ? "Pastor" : "Secretário"}
                </p>
              </div>
              <div className="flex justify-between items-center pt-1">
                {okConta
                  ? <span className="text-sm text-[var(--primary)] font-medium">Nome atualizado!</span>
                  : <span />
                }
                <Button variant="primary" size="sm" loading={salvandoConta} onClick={salvarConta}>
                  Salvar nome
                </Button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function Toggle({ label, descricao, ativo, onChange }: {
  label: string;
  descricao: string;
  ativo: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
        <p className="text-xs text-[var(--ink-muted)]">{descricao}</p>
      </div>
      <button
        onClick={() => onChange(!ativo)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
        style={{ background: ativo ? "var(--primary)" : "var(--border)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: ativo ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}
