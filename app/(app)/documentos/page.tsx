"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPessoas } from "@/lib/db/pessoas";
import { generateDocHTML } from "@/lib/documentos/templates";
import type { DocTipo, DocEmitido, DocConfig, CampoConfig } from "@/lib/documentos/types";
import Topbar from "@/components/layout/Topbar";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Pessoa } from "@/types";

// ── Constantes ────────────────────────────────────────────────────────────────

const HOJE = new Date().toISOString().split("T")[0];

const SECRETARIOS_LISTA = [
  "Fagner Silva Ribeiro",
  "Lisandra Souza",
  "Adriana Lima",
  "Marco Aurélio",
];

const DOCS_CONFIG: DocConfig[] = [
  {
    id: "batismo",
    titulo: "Certificado de Batismo",
    subtitulo: "Ordenação pelo batismo nas águas",
    icon: "💧",
    cor: "#1e5fa8",
    bg: "#dbeafe",
    campos: [
      { key: "nome",         label: "Nome do(a) membro(a)",  tipo: "member_search", required: true, placeholder: "Buscar membro ou digitar nome…" },
      { key: "data_batismo", label: "Data do Batismo",        tipo: "date",          required: true },
      { key: "secretario",   label: "Secretário(a)",          tipo: "fixed",         fixedValue: "Fagner Silva Ribeiro" },
    ],
  },
  {
    id: "consagracao",
    titulo: "Certificado de Consagração",
    subtitulo: "Consagração ao ministério",
    icon: "✝️",
    cor: "#7c3d8a",
    bg: "#fae8ff",
    campos: [
      { key: "nome",             label: "Nome do(a) membro(a)",    tipo: "member_search",  required: true, placeholder: "Buscar membro ou digitar nome…" },
      { key: "data_consagracao", label: "Data da Consagração",      tipo: "date",           required: true },
      { key: "cargo",            label: "Cargo",                    tipo: "select",         required: true, options: ["Diácono","Diáconisa","Presbítero","Evangelista","Missionário","Pastor"] },
      { key: "secretario",       label: "Secretário(a)",            tipo: "select_or_text", required: true, options: SECRETARIOS_LISTA },
    ],
  },
  {
    id: "apresentacao",
    titulo: "Certificado de Apresentação",
    subtitulo: "Apresentação de crianças ao Senhor",
    icon: "👶",
    cor: "#d97706",
    bg: "#fef3c7",
    campos: [
      { key: "nome_crianca",      label: "Nome da Criança",          tipo: "text",           required: true,  placeholder: "Nome completo da criança" },
      { key: "data_nascimento",   label: "Data de Nascimento",        tipo: "date",           required: true },
      { key: "data_apresentacao", label: "Data da Apresentação",      tipo: "date",           required: true },
      { key: "nome_pai",          label: "Nome do Pai / Responsável", tipo: "text",           required: false, placeholder: "Ex: João da Silva" },
      { key: "nome_mae",          label: "Nome da Mãe / Responsável", tipo: "text",           required: false, placeholder: "Ex: Maria da Silva" },
      { key: "secretario",        label: "Secretário(a)",             tipo: "select_or_text", required: true,  options: SECRETARIOS_LISTA },
    ],
  },
  {
    id: "curso_obreiros",
    titulo: "Certificado de Curso de Obreiros",
    subtitulo: "Conclusão de formação ministerial",
    icon: "📖",
    cor: "#2d7a5f",
    bg: "#d4ede5",
    campos: [
      { key: "nome",          label: "Nome do(a) Aluno(a)",  tipo: "member_search", required: true, placeholder: "Buscar membro ou digitar nome…" },
      { key: "data_conclusao",label: "Data de Conclusão",    tipo: "date",          required: true },
      { key: "curso",         label: "Nome do Curso",        tipo: "text",          required: true, placeholder: "Curso de Formação de Obreiros — CFO" },
      { key: "coordenador",   label: "Coordenador(a)",       tipo: "text",          required: true, placeholder: "Nome do(a) coordenador(a)" },
    ],
  },
  {
    id: "mudanca",
    titulo: "Carta de Mudança",
    subtitulo: "Transferência de membresia",
    icon: "📦",
    cor: "#c9a84c",
    bg: "#fdf3d7",
    campos: [
      { key: "nome",       label: "Nome do(a) membro(a)", tipo: "member_search",  required: true, placeholder: "Buscar membro ou digitar nome…" },
      { key: "data",       label: "Data",                 tipo: "date",           required: true },
      { key: "secretario", label: "Secretário(a)",        tipo: "select_or_text", required: true, options: SECRETARIOS_LISTA },
    ],
  },
  {
    id: "recomendacao",
    titulo: "Carta de Recomendação",
    subtitulo: "Recomendação de membro",
    icon: "🤝",
    cor: "#c0392b",
    bg: "#fde8e6",
    campos: [
      { key: "nome",       label: "Nome do(a) membro(a)", tipo: "member_search",  required: true, placeholder: "Buscar membro ou digitar nome…" },
      { key: "data",       label: "Data",                 tipo: "date",           required: true },
      { key: "secretario", label: "Secretário(a)",        tipo: "select_or_text", required: true, options: SECRETARIOS_LISTA },
    ],
  },
  {
    id: "oficio",
    titulo: "Ofício",
    subtitulo: "Documento oficial da Igreja",
    icon: "📄",
    cor: "#374151",
    bg: "#f3f4f6",
    campos: [
      { key: "assunto",     label: "Assunto",         tipo: "text",           required: true,  placeholder: "Assunto do ofício" },
      { key: "destinatario",label: "Destinatário",    tipo: "text",           required: false, placeholder: "Ex: Diretor da Escola X" },
      { key: "conteudo",    label: "Conteúdo",        tipo: "textarea",       required: true,  rows: 8, placeholder: "Texto do ofício…" },
      { key: "data",        label: "Data",            tipo: "date",           required: true },
      { key: "remetente",   label: "Remetente",       tipo: "text",           required: true,  placeholder: "Nome do remetente" },
      { key: "secretario",  label: "Secretário(a)",   tipo: "select_or_text", required: true,  options: SECRETARIOS_LISTA },
    ],
  },
  {
    id: "declaracao",
    titulo: "Declaração",
    subtitulo: "Declaração oficial da Igreja",
    icon: "📋",
    cor: "#0f1117",
    bg: "#f8f7f4",
    campos: [
      { key: "assunto",    label: "Assunto",        tipo: "text",           required: true,  placeholder: "Ex: Declaração de Membresia" },
      { key: "conteudo",   label: "Conteúdo",       tipo: "textarea",       required: true,  rows: 8, placeholder: "Texto da declaração…" },
      { key: "data",       label: "Data",           tipo: "date",           required: true },
      { key: "remetente",  label: "Remetente",      tipo: "text",           required: true,  placeholder: "Nome do declarante" },
      { key: "secretario", label: "Secretário(a)",  tipo: "select_or_text", required: true,  options: SECRETARIOS_LISTA },
    ],
  },
];

// Chave de nome principal de cada tipo (para salvar no histórico)
const NOME_KEY: Record<DocTipo, string> = {
  batismo:        "nome",
  consagracao:    "nome",
  apresentacao:   "nome_crianca",
  curso_obreiros: "nome",
  mudanca:        "nome",
  recomendacao:   "nome",
  oficio:         "assunto",
  declaracao:     "assunto",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDataBR(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function tipoLabel(tipo: DocTipo): string {
  return DOCS_CONFIG.find((c) => c.id === tipo)?.titulo ?? tipo;
}

// ── Componente principal ──────────────────────────────────────────────────────

type View = "gerar" | "historico";

export default function DocumentosPage() {
  const supabase = createClient();

  const [view, setView]           = useState<View>("gerar");
  const [pessoas, setPessoas]     = useState<Pessoa[]>([]);
  const [docAtivo, setDocAtivo]   = useState<DocConfig | null>(null);
  const [historico, setHistorico] = useState<DocEmitido[]>([]);
  const [loadingH, setLoadingH]   = useState(false);

  // Filtros de histórico
  const [buscaH,  setBuscaH]  = useState("");
  const [tipoH,   setTipoH]   = useState<DocTipo | "">("");

  useEffect(() => {
    getPessoas(supabase)
      .then(setPessoas)
      .catch((e) => console.error(e));
    carregarHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarHistorico() {
    setLoadingH(true);
    try {
      const { data, error } = await supabase
        .from("documentos_emitidos")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) {
        // Tabela pode não existir ainda — ignora graciosamente
        if (error.code !== "42P01") throw error;
      }
      setHistorico((data as DocEmitido[]) ?? []);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    } finally {
      setLoadingH(false);
    }
  }

  async function salvarNoHistorico(doc: Omit<DocEmitido, "id" | "criado_em">) {
    try {
      const { data, error } = await supabase
        .from("documentos_emitidos")
        .insert([{ ...doc, dados: doc.dados }])
        .select();
      if (error) {
        if (error.code === "42P01") {
          // Tabela não existe: só registra localmente
          const local: DocEmitido = {
            ...doc,
            id: crypto.randomUUID(),
            criado_em: new Date().toISOString(),
          };
          setHistorico((prev) => [local, ...prev]);
          return;
        }
        throw error;
      }
      setHistorico((prev) => [...(data as DocEmitido[]), ...prev]);
    } catch (e) {
      console.error("Erro ao salvar documento:", e);
    }
  }

  async function deletarDoHistorico(id: string) {
    try {
      await supabase.from("documentos_emitidos").delete().eq("id", id);
    } catch (e) {
      console.error(e);
    }
    setHistorico((prev) => prev.filter((d) => d.id !== id));
  }

  // Filtro de histórico
  const historicoFiltrado = useMemo(() => {
    return historico.filter((d) => {
      if (tipoH && d.tipo !== tipoH) return false;
      if (buscaH.trim() && !d.nome_assunto.toLowerCase().includes(buscaH.toLowerCase())) return false;
      return true;
    });
  }, [historico, tipoH, buscaH]);

  const badgeCount = historico.length > 0 ? historico.length : undefined;

  return (
    <>
      <Topbar
        title="Documentos"
        subtitle="Gestão de Certificados e Cartas"
        actions={<span />}
      />

      <main style={{ paddingTop: "var(--topbar-h)" }} className="flex-1 flex flex-col min-h-0">

        {/* ── Abas ─────────────────────────────────────────────────── */}
        <div className="px-6 flex items-center gap-1 border-b border-[var(--border)]">
          {(["gerar", "historico"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); setDocAtivo(null); }}
              className={[
                "px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                view === v
                  ? "border-[var(--gold)] text-[var(--gold-dark)]"
                  : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {v === "gerar" ? "Gerar Novo" : "Histórico"}
              {v === "historico" && badgeCount && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--gold)] text-white text-[10px] font-bold">
                  {badgeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Conteúdo ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto p-6">
          {view === "gerar" && (
            <GerarView
              docAtivo={docAtivo}
              setDocAtivo={setDocAtivo}
              pessoas={pessoas}
              onSalvar={salvarNoHistorico}
            />
          )}
          {view === "historico" && (
            <HistoricoView
              historico={historicoFiltrado}
              loading={loadingH}
              busca={buscaH}
              setBusca={setBuscaH}
              tipo={tipoH}
              setTipo={setTipoH}
              onDeletar={deletarDoHistorico}
            />
          )}
        </div>
      </main>
    </>
  );
}

// ── View: Gerar ───────────────────────────────────────────────────────────────

function GerarView({
  docAtivo,
  setDocAtivo,
  pessoas,
  onSalvar,
}: {
  docAtivo: DocConfig | null;
  setDocAtivo: (d: DocConfig | null) => void;
  pessoas: Pessoa[];
  onSalvar: (d: Omit<DocEmitido, "id" | "criado_em">) => Promise<void>;
}) {
  return (
    <div>
      {/* Grid de tipos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {DOCS_CONFIG.map((cfg, i) => (
          <button
            key={cfg.id}
            onClick={() => setDocAtivo(cfg)}
            className={[
              "card p-4 text-left group hover:border-[var(--gold)] hover:shadow-md transition-all animate-fade-in",
              docAtivo?.id === cfg.id ? "border-[var(--gold)] shadow-md" : "",
            ].join(" ")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span
              className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
              style={{ background: cfg.bg, color: cfg.cor }}
            >
              {cfg.icon}
            </span>
            <p className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--gold-dark)] leading-snug transition-colors"
              style={{ fontFamily: "var(--font-display)" }}>
              {cfg.titulo}
            </p>
            <p className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">{cfg.subtitulo}</p>
          </button>
        ))}
      </div>

      {/* Modal/Drawer inline ao selecionar */}
      {docAtivo && (
        <DocFormPanel
          cfg={docAtivo}
          pessoas={pessoas}
          onFechar={() => setDocAtivo(null)}
          onSalvar={onSalvar}
        />
      )}
    </div>
  );
}

// ── Painel de Formulário + Preview ────────────────────────────────────────────

function DocFormPanel({
  cfg,
  pessoas,
  onFechar,
  onSalvar,
}: {
  cfg: DocConfig;
  pessoas: Pessoa[];
  onFechar: () => void;
  onSalvar: (d: Omit<DocEmitido, "id" | "criado_em">) => Promise<void>;
}) {
  const [dados, setDados]           = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = { data: HOJE };
    cfg.campos.forEach((c) => {
      if (c.tipo === "fixed" && c.fixedValue) initial[c.key] = c.fixedValue;
      if ((c.tipo === "select" || c.tipo === "select_or_text") && c.options?.length) initial[c.key] = c.options[0];
    });
    return initial;
  });
  const [preview,   setPreview]     = useState(false);
  const [salvando,  setSalvando]    = useState(false);
  const [erros,     setErros]       = useState<Record<string, string>>({});
  const [memberQ,   setMemberQ]     = useState<Record<string, string>>({});
  const [memberOpen,setMemberOpen]  = useState<Record<string, boolean>>({});
  const previewRef = useRef<HTMLIFrameElement>(null);

  function set(k: string, v: string) {
    setDados((p) => ({ ...p, [k]: v }));
    setErros((p) => { const n = { ...p }; delete n[k]; return n; });
  }

  function validar(): boolean {
    const e: Record<string, string> = {};
    cfg.campos.forEach((c) => {
      if (c.required && !dados[c.key]?.trim()) {
        e[c.key] = "Campo obrigatório";
      }
    });
    setErros(e);
    return Object.keys(e).length === 0;
  }

  // HTML do preview (atualiza em tempo real)
  const previewHTML = useMemo(
    () => generateDocHTML(cfg.id, dados),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cfg.id, JSON.stringify(dados)]
  );

  function handleGerarPDF() {
    if (!validar()) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(previewHTML);
    win.document.close();
    win.focus();
  }

  async function handleSalvarEGerar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      const nomeAssunto = dados[NOME_KEY[cfg.id]] ?? "—";
      await onSalvar({
        tipo: cfg.id,
        nome_assunto: nomeAssunto,
        data_emissao: dados.data ?? HOJE,
        secretario:   dados.secretario ?? "—",
        dados,
      });
      handleGerarPDF();
      onFechar();
    } finally {
      setSalvando(false);
    }
  }

  // Busca de membros
  const sugestoes = useMemo(
    () => (q: string) =>
      q.length < 2
        ? []
        : pessoas.filter((p) =>
            p.nome.toLowerCase().includes(q.toLowerCase())
          ).slice(0, 6),
    [pessoas]
  );

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Cabeçalho do painel */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]"
        style={{ background: cfg.bg }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)", color: cfg.cor }}>
              {cfg.titulo}
            </h2>
            <p className="text-xs text-[var(--ink-muted)]">{cfg.subtitulo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((v) => !v)}
            className="h-8 px-3 text-xs border border-[var(--border)] rounded-[6px] bg-white hover:border-[var(--gold)] transition-colors"
          >
            {preview ? "Ocultar Preview" : "👁 Preview"}
          </button>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={`grid ${preview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* Formulário */}
        <div className="p-5 space-y-4">
          {cfg.campos.map((campo) => (
            <CampoForm
              key={campo.key}
              campo={campo}
              valor={dados[campo.key] ?? ""}
              erro={erros[campo.key]}
              onChange={(v) => set(campo.key, v)}
              memberQuery={memberQ[campo.key] ?? ""}
              onMemberQueryChange={(q) => {
                setMemberQ((p) => ({ ...p, [campo.key]: q }));
                setMemberOpen((p) => ({ ...p, [campo.key]: true }));
              }}
              memberOpen={memberOpen[campo.key] ?? false}
              onMemberClose={() => setMemberOpen((p) => ({ ...p, [campo.key]: false }))}
              sugestoes={campo.tipo === "member_search" ? sugestoes(memberQ[campo.key] ?? "") : []}
              onMemberSelect={(nome) => {
                set(campo.key, nome);
                setMemberQ((p) => ({ ...p, [campo.key]: nome }));
                setMemberOpen((p) => ({ ...p, [campo.key]: false }));
              }}
            />
          ))}

          {/* Botões */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" onClick={onFechar}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPreview((v) => !v)}
            >
              {preview ? "Ocultar Preview" : "👁 Preview"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={salvando}
              onClick={handleSalvarEGerar}
            >
              📄 Gerar PDF
            </Button>
          </div>
        </div>

        {/* Preview iframe */}
        {preview && (
          <div className="border-l border-[var(--border)] bg-[var(--surface-2)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide">
                Pré-visualização
              </p>
              <button
                onClick={handleGerarPDF}
                className="text-xs text-[var(--gold-dark)] hover:underline"
              >
                Abrir em nova aba →
              </button>
            </div>
            <div
              className="flex-1 rounded-[var(--radius)] overflow-hidden border-2 border-[var(--gold-light)] shadow-md bg-white"
              style={{ minHeight: 520 }}
            >
              <iframe
                ref={previewRef}
                srcDoc={previewHTML}
                className="w-full"
                style={{ height: 520, border: "none" }}
                title="Pré-visualização do documento"
                sandbox="allow-same-origin"
              />
            </div>
            <p className="text-[10px] text-[var(--ink-muted)] text-center">
              O PDF será gerado com qualidade de impressão
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Campo individual ──────────────────────────────────────────────────────────

function CampoForm({
  campo,
  valor,
  erro,
  onChange,
  memberQuery,
  onMemberQueryChange,
  memberOpen,
  onMemberClose,
  sugestoes,
  onMemberSelect,
}: {
  campo: CampoConfig;
  valor: string;
  erro?: string;
  onChange: (v: string) => void;
  memberQuery: string;
  onMemberQueryChange: (q: string) => void;
  memberOpen: boolean;
  onMemberClose: () => void;
  sugestoes: Pessoa[];
  onMemberSelect: (nome: string) => void;
}) {
  if (campo.tipo === "member_search") {
    return (
      <div className="relative flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--ink)]">
          {campo.label}{campo.required && <span className="text-[var(--red)] ml-1">*</span>}
        </label>
        <input
          value={memberQuery || valor}
          onChange={(e) => {
            const q = e.target.value;
            onMemberQueryChange(q);
            if (!q) onChange("");
          }}
          onFocus={() => onMemberQueryChange(valor)}
          onBlur={() => {
            const q = (memberQuery || valor).trim();
            if (q) onChange(q);
            setTimeout(onMemberClose, 150);
          }}
          placeholder={campo.placeholder ?? "Buscar membro ou digitar nome…"}
          autoComplete="off"
          className={[
            "w-full h-10 rounded-[var(--radius)] border bg-[var(--surface)] text-sm px-3",
            "focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]",
            erro ? "border-[var(--red)]" : "border-[var(--border)]",
          ].join(" ")}
        />
        {memberOpen && sugestoes.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-md overflow-hidden">
            {sugestoes.map((p) => (
              <button
                key={p.id}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--surface-2)] text-left transition-colors"
                onMouseDown={() => onMemberSelect(p.nome)}
              >
                <Avatar name={p.nome} size="xs" />
                <span className="flex-1 truncate">{p.nome}</span>
                <span className="text-[10px] text-[var(--ink-muted)]">
                  {p.tipo === "membro" ? "Membro" : "Visitante"}
                </span>
              </button>
            ))}
          </div>
        )}
        {memberOpen && sugestoes.length === 0 && (memberQuery?.length ?? 0) >= 2 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-md overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--surface-2)] text-left transition-colors"
              onMouseDown={() => onMemberSelect(memberQuery)}
            >
              <span className="w-6 h-6 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs shrink-0">+</span>
              <span className="flex-1 truncate">
                Usar: <strong>{memberQuery}</strong>
              </span>
              <span className="text-[10px] text-[var(--ink-muted)]">Nome livre</span>
            </button>
          </div>
        )}
        {erro && <p className="text-xs text-[var(--red)]">{erro}</p>}
        {/* Fecha ao clicar fora */}
        {memberOpen && (
          <div className="fixed inset-0 z-20" onClick={onMemberClose} />
        )}
      </div>
    );
  }

  // Campo fixo (somente leitura) — ex: Fagner como Secretário Executivo
  if (campo.tipo === "fixed") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--ink)]">{campo.label}</label>
        <div className="flex items-center gap-2 h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3">
          <span className="flex-1 text-sm text-[var(--ink)] font-medium">{campo.fixedValue}</span>
          <span className="text-[10px] text-[var(--ink-muted)] bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 uppercase tracking-wide">
            Secretário Executivo · Fixo
          </span>
        </div>
      </div>
    );
  }

  // Campo select com opção de digitar texto livre
  if (campo.tipo === "select_or_text") {
    const isCustom = !(campo.options ?? []).includes(valor) && valor !== "" && valor !== (campo.options ?? [])[0];
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--ink)]">
          {campo.label}{campo.required && <span className="text-[var(--red)] ml-1">*</span>}
        </label>
        {!isCustom ? (
          <div className="flex gap-2">
            <select
              value={valor}
              onChange={(e) => onChange(e.target.value)}
              className={[
                "flex-1 h-10 rounded-[var(--radius)] border bg-[var(--surface)] text-sm px-3 appearance-none",
                "focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-colors",
                erro ? "border-[var(--red)]" : "border-[var(--border)]",
              ].join(" ")}
            >
              {(campo.options ?? []).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange("")}
              title="Digitar nome diferente"
              className="h-10 px-3 text-xs border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)] transition-colors whitespace-nowrap"
            >
              + Outro
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={valor}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nome do(a) secretário(a)…"
              autoFocus
              className={[
                "flex-1 h-10 rounded-[var(--radius)] border bg-[var(--surface)] text-sm px-3",
                "focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-colors",
                erro ? "border-[var(--red)]" : "border-[var(--border)]",
              ].join(" ")}
            />
            <button
              type="button"
              onClick={() => onChange((campo.options ?? [])[0] ?? "")}
              title="Voltar para lista"
              className="h-10 px-3 text-xs border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)] transition-colors whitespace-nowrap"
            >
              ← Lista
            </button>
          </div>
        )}
        {erro && <p className="text-xs text-[var(--red)]">{erro}</p>}
      </div>
    );
  }

  if (campo.tipo === "select") {
    return (
      <Select
        label={`${campo.label}${campo.required ? " *" : ""}`}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        error={erro}
        options={(campo.options ?? []).map((o) => ({ value: o, label: o }))}
      />
    );
  }

  if (campo.tipo === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--ink)]">
          {campo.label}{campo.required && <span className="text-[var(--red)] ml-1">*</span>}
        </label>
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          rows={campo.rows ?? 6}
          placeholder={campo.placeholder}
          className={[
            "w-full rounded-[var(--radius)] border bg-[var(--surface)] text-sm text-[var(--ink)]",
            "placeholder:text-[var(--ink-muted)] px-3 py-2 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-colors",
            erro ? "border-[var(--red)]" : "border-[var(--border)]",
          ].join(" ")}
        />
        {erro && <p className="text-xs text-[var(--red)]">{erro}</p>}
      </div>
    );
  }

  // text ou date
  return (
    <Input
      label={`${campo.label}${campo.required ? " *" : ""}`}
      type={campo.tipo === "date" ? "date" : "text"}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={campo.placeholder}
      error={erro}
    />
  );
}

// ── View: Histórico ───────────────────────────────────────────────────────────

function HistoricoView({
  historico,
  loading,
  busca,
  setBusca,
  tipo,
  setTipo,
  onDeletar,
}: {
  historico: DocEmitido[];
  loading: boolean;
  busca: string;
  setBusca: (v: string) => void;
  tipo: DocTipo | "";
  setTipo: (v: DocTipo | "") => void;
  onDeletar: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleRegerarPDF(d: DocEmitido) {
    const html = generateDocHTML(d.tipo, d.dados ?? {});
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou assunto…"
          className="h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 w-64 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as DocTipo | "")}
          className="h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]"
        >
          <option value="">Todos os tipos</option>
          {DOCS_CONFIG.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
        {(busca || tipo) && (
          <button
            onClick={() => { setBusca(""); setTipo(""); }}
            className="h-9 px-3 text-xs text-[var(--ink-muted)] border border-[var(--border)] rounded-[var(--radius)] hover:text-[var(--ink)] bg-[var(--surface)]"
          >
            Limpar ×
          </button>
        )}
        <span className="ml-auto text-xs text-[var(--ink-muted)]">
          {historico.length} documento{historico.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      {loading ? (
        <HistoricoSkeleton />
      ) : historico.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="text-4xl">📂</span>
          <p className="text-base font-semibold text-[var(--ink)]">Nenhum documento emitido</p>
          <p className="text-sm text-[var(--ink-muted)]">
            {busca || tipo ? "Tente outros filtros" : "Gere seu primeiro documento na aba 'Gerar Novo'"}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Nome / Assunto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Data Emissão</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Secretário(a)</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--ink-muted)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((d) => {
                const cfg = DOCS_CONFIG.find((c) => c.id === d.tipo);
                return (
                  <tr
                    key={d.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-sm shrink-0"
                          style={{ background: cfg?.bg, color: cfg?.cor }}
                        >
                          {cfg?.icon}
                        </span>
                        <span className="text-xs font-medium text-[var(--ink)] leading-snug max-w-[130px]">
                          {tipoLabel(d.tipo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--ink)]">{d.nome_assunto}</td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{fmtDataBR(d.data_emissao)}</td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{d.secretario}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleRegerarPDF(d)}
                          title="Baixar / Imprimir PDF"
                          className="h-7 px-2 text-xs rounded-[6px] bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)] transition-colors"
                        >
                          📄
                        </button>

                        {confirmId === d.id ? (
                          <>
                            <button
                              onClick={() => { onDeletar(d.id); setConfirmId(null); }}
                              className="h-7 px-2 text-[10px] rounded-[6px] bg-[var(--red)] text-white hover:opacity-90 transition-opacity"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="h-7 px-2 text-[10px] rounded-[6px] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors"
                            >
                              Não
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmId(d.id)}
                            title="Deletar"
                            className="h-7 px-2 text-xs rounded-[6px] bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--red)] hover:text-[var(--red)] transition-colors"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HistoricoSkeleton() {
  return (
    <div className="card overflow-hidden">
      {[1,2,3,4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
          <div className="w-7 h-7 rounded-[6px] bg-[var(--border)] animate-pulse shrink-0" />
          <div className="w-24 h-3 bg-[var(--border)] rounded animate-pulse" />
          <div className="flex-1 h-3 bg-[var(--border)] rounded animate-pulse" />
          <div className="w-20 h-3 bg-[var(--border)] rounded animate-pulse" />
          <div className="w-28 h-3 bg-[var(--border)] rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

