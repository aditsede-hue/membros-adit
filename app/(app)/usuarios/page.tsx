"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePerfil } from "@/lib/usePerfil";
import { ROLE_LABEL, type Role } from "@/lib/permissoes";
import Topbar from "@/components/layout/Topbar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface PerfilRow {
  id: string;
  nome: string;
  email: string | null;
  role: Role;
  ativo: boolean;
  criado_em: string;
}

const ROLE_COR: Record<Role, { bg: string; cor: string }> = {
  admin:      { bg: "#ede9fe", cor: "#6d28d9" },
  pastor:     { bg: "#dbeafe", cor: "#1e40af" },
  secretario: { bg: "#d4ede5", cor: "#1a5c42" },
};

export default function UsuariosPage() {
  const supabase = createClient();
  const router = useRouter();
  const { perfil, carregando: carregandoPerfil } = usePerfil();

  const [usuarios, setUsuarios] = useState<PerfilRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de criação
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", role: "secretario" as Role,
  });

  // Proteção de rota: só admin acessa
  useEffect(() => {
    if (!carregandoPerfil && perfil && perfil.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [perfil, carregandoPerfil, router]);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("perfis")
        .select("id, nome, email, role, ativo, criado_em")
        .order("criado_em", { ascending: true });
      if (error) throw error;
      setUsuarios((data ?? []) as PerfilRow[]);
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirCriar() {
    setForm({ nome: "", email: "", senha: "", role: "secretario" });
    setErro("");
    setModalAberto(true);
  }

  async function criarUsuario() {
    setErro("");
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!form.email.trim()) { setErro("E-mail é obrigatório."); return; }
    if (form.senha.length < 6) { setErro("Senha deve ter ao menos 6 caracteres."); return; }

    setSalvando(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          role: form.role,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErro(json.erro ?? "Erro ao criar usuário.");
        return;
      }

      setModalAberto(false);
      await carregar();
    } catch (e) {
      setErro("Erro de conexão. Tente novamente.");
      console.error("Erro ao criar usuário:", e);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(u: PerfilRow) {
    if (u.id === perfil?.id) return;
    const novo = !u.ativo;
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: novo } : x)));
    try {
      const { error } = await supabase.from("perfis").update({ ativo: novo }).eq("id", u.id);
      if (error) throw error;
    } catch (e) {
      console.error("Erro ao alterar status:", e);
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: u.ativo } : x)));
    }
  }

  async function mudarRole(u: PerfilRow, novoRole: Role) {
    if (u.id === perfil?.id) return;
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: novoRole } : x)));
    try {
      const { error } = await supabase.from("perfis").update({ role: novoRole }).eq("id", u.id);
      if (error) throw error;
    } catch (e) {
      console.error("Erro ao mudar perfil:", e);
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: u.role } : x)));
    }
  }

  if (carregandoPerfil || (perfil && perfil.role !== "admin")) {
    return (
      <>
        <Topbar title="Usuários" subtitle="Verificando permissões…" />
        <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Usuários"
        subtitle={loading ? "Carregando…" : `${usuarios.length} usuário${usuarios.length !== 1 ? "s" : ""}`}
        actions={
          <Button variant="primary" size="sm" onClick={abrirCriar}>
            + Novo Usuário
          </Button>
        }
      />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 overflow-auto">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                    <th className="text-left font-semibold px-4 py-3 text-[var(--ink)]">Nome</th>
                    <th className="text-left font-semibold px-4 py-3 text-[var(--ink)]">E-mail</th>
                    <th className="text-left font-semibold px-4 py-3 text-[var(--ink)]">Perfil</th>
                    <th className="text-left font-semibold px-4 py-3 text-[var(--ink)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const ehEu = u.id === perfil?.id;
                    return (
                      <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-[var(--ink)]">
                          {u.nome}
                          {ehEu && (
                            <span className="ml-2 text-[10px] text-[var(--ink-muted)]">(você)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--ink-muted)]">{u.email ?? "—"}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={ehEu}
                            onChange={(e) => mudarRole(u, e.target.value as Role)}
                            className="text-xs font-semibold px-2 py-1 rounded-full border-0 appearance-none cursor-pointer disabled:cursor-not-allowed"
                            style={{
                              background: ROLE_COR[u.role].bg,
                              color: ROLE_COR[u.role].cor,
                            }}
                          >
                            <option value="admin">{ROLE_LABEL.admin}</option>
                            <option value="pastor">{ROLE_LABEL.pastor}</option>
                            <option value="secretario">{ROLE_LABEL.secretario}</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => alternarAtivo(u)}
                            disabled={ehEu}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full disabled:cursor-not-allowed transition-colors"
                            style={
                              u.ativo
                                ? { background: "#d4ede5", color: "#1a5c42" }
                                : { background: "#fde8e6", color: "#9b1c1c" }
                            }
                          >
                            {u.ativo ? "Ativo" : "Inativo"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Novo Usuário"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome completo"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Ex: João da Silva"
            autoFocus
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="usuario@email.com"
          />
          <Input
            label="Senha provisória"
            type="text"
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
          />
          <Select
            label="Perfil de acesso"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            options={[
              { value: "admin",      label: ROLE_LABEL.admin },
              { value: "pastor",     label: ROLE_LABEL.pastor },
              { value: "secretario", label: ROLE_LABEL.secretario },
            ]}
          />

          {erro && (
            <p className="text-sm text-[var(--red)] bg-[#fde8e6] px-3 py-2 rounded-[var(--radius)]">
              {erro}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button variant="primary" size="sm" loading={salvando} onClick={criarUsuario}>
              Criar Usuário
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
