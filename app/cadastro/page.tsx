"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function formatCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatTel(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome: "", email: "", contato: "", cpf: "",
    cep: "", endereco: "", numero: "", bairro: "", cidade: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErro("");
  }

  async function buscarCEP(cep: string) {
    const nums = cep.replace(/\D/g, "");
    if (nums.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          endereco: data.logradouro ?? f.endereco,
          bairro: data.bairro ?? f.bairro,
          cidade: data.localidade ?? f.cidade,
        }));
      }
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!form.contato.trim()) { setErro("Telefone é obrigatório."); return; }
    setEnviando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("pessoas").insert([{
        nome: form.nome.trim(),
        email: form.email.trim() || null,
        contato: form.contato.trim(),
        cpf: form.cpf.trim() || null,
        endereco: [form.endereco, form.numero, form.bairro, form.cidade].filter(Boolean).join(", ") || null,
        tipo: "visitante",
        primeira_vez: true,
        status: "ativo",
      }]);
      if (error) throw error;
      setEnviado(true);
    } catch (err: any) {
      setErro(err?.message || JSON.stringify(err) || "Erro ao enviar.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Seja bem-vindo(a)!</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 8 }}>Seu cadastro foi realizado com sucesso. É uma alegria ter você conosco!</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Assembleia de Deus do Itapoã — Campo ADIT</p>
        </div>
      </div>
    );
  }

  const inp: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "40px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Cadastro de Visitante</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>Assembleia de Deus do Itapoã · Campo ADIT<br/>Preencha seus dados para fazermos parte da sua jornada.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Nome completo *</label>
            <input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome completo" required style={inp} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="seu@email.com" style={inp} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Telefone / WhatsApp *</label>
              <input value={form.contato} onChange={(e) => set("contato", formatTel(e.target.value))} placeholder="(61) 99999-0000" required style={inp} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>CPF (opcional)</label>
            <input value={form.cpf} onChange={(e) => set("cpf", formatCPF(e.target.value))} placeholder="000.000.000-00" style={inp} />
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Endereço (opcional)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>CEP</label>
              <input value={form.cep} onChange={(e) => { const v = formatCEP(e.target.value); set("cep", v); buscarCEP(v); }} placeholder="00000-000" style={inp} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Rua / Logradouro</label>
                <input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, Avenida..." style={inp} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Número</label>
                <input value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="Nº" style={inp} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Bairro</label>
                <input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Bairro" style={inp} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Cidade</label>
                <input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} placeholder="Cidade" style={inp} />
              </div>
            </div>
          </div>

          {erro && <p style={{ fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>{erro}</p>}

          <button type="submit" disabled={enviando} style={{ padding: "14px 24px", borderRadius: 12, border: "none", background: enviando ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: enviando ? "not-allowed" : "pointer" }}>
            {enviando ? "Enviando..." : "Realizar Cadastro"}
          </button>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>Seus dados são confidenciais e utilizados apenas pela secretaria da ADIT.</p>
        </form>
      </div>
    </div>
  );
}