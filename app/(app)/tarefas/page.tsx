"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTarefas, criaTarefa, atualizaTarefa, deletaTarefa } from "@/lib/db/tarefas";
import Topbar from "@/components/layout/Topbar";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Tarefa, NovaTarefa, UpdateTarefa } from "@/types";

// ── Constantes ────────────────────────────────────────────────────────────────

const USUARIO_LOGADO = "Fagner Silva";

const RESPONSAVEIS = [
  "Fagner Silva",
  "Lisandra Souza",
  "Adriana Lima",
  "Marco Aurélio",
];

const CATEGORIAS = [
  "Administrativo",
  "Eventos",
  "Pastoral",
  "Ministério",
  "Relatório",
  "Digital",
];

const STATUS_CFG: Record<
  Tarefa["status"],
  { label: string; cor: string; bg: string; colBg: string; borderCor: string }
> = {
  pendente:     { label: "Pendente",     cor: "#1e5fa8", bg: "#dbeafe", colBg: "#f0f7ff", borderCor: "#bfdbfe" },
  em_andamento: { label: "Em Andamento", cor: "#b45309", bg: "#fef3c7", colBg: "#fffdf0", borderCor: "#fde68a" },
  concluido:    { label: "Concluído",    cor: "#2d7a5f", bg: "#d4ede5", colBg: "#f0fbf6", borderCor: "#a8d5c2" },
  atrasado:     { label: "Atrasado",     cor: "#c0392b", bg: "#fde8e6", colBg: "#fff5f5", borderCor: "#fca5a5" },
};

const BADGE_VARIANT: Record<Tarefa["status"], "blue" | "gold" | "green" | "red"> = {
  pendente:     "blue",
  em_andamento: "gold",
  concluido:    "green",
  atrasado:     "red",
};

const PRIORIDADE_CFG: Record<
  Tarefa["prioridade"],
  { label: string; stripe: string; badgeVariant: "red" | "gold" | "green" }
> = {
  alta:  { label: "Alta",  stripe: "#ef4444", badgeVariant: "red"   },
  media: { label: "Média", stripe: "#f59e0b", badgeVariant: "gold"  },
  baixa: { label: "Baixa", stripe: "#22c55e", badgeVariant: "green" },
};

const COLUNAS: Tarefa["status"][] = ["pendente", "em_andamento", "concluido", "atrasado"];

// ── Seed de dados iniciais ────────────────────────────────────────────────────

const HOJE = new Date().toISOString().split("T")[0];
function diasOffset(d: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split("T")[0];
}

const SEED_TAREFAS: NovaTarefa[] = [
  // Pendentes
  {
    titulo: "Preparar relatório mensal",
    descricao: "Relatório de membros e frequência do mês atual para a diretoria",
    responsavel: "Fagner Silva",
    prazo: diasOffset(6),
    status: "pendente",
    prioridade: "alta",
    categoria: "Relatório",
  },
  {
    titulo: "Organizar culto de jovens",
    descricao: "Definir músicas, pregador e dinâmica do culto especial de jovens",
    responsavel: "Lisandra Souza",
    prazo: diasOffset(11),
    status: "pendente",
    prioridade: "media",
    categoria: "Eventos",
  },
  {
    titulo: "Reunião com líderes de células",
    descricao: "Pautas: avaliação trimestral e metas de crescimento dos grupos",
    responsavel: "Marco Aurélio",
    prazo: diasOffset(3),
    status: "pendente",
    prioridade: "baixa",
    categoria: "Pastoral",
  },
  // Em andamento
  {
    titulo: "Atualização do site da igreja",
    descricao: "Adicionar fotos dos eventos recentes e atualizar agenda online",
    responsavel: "Adriana Lima",
    prazo: diasOffset(4),
    status: "em_andamento",
    prioridade: "media",
    categoria: "Digital",
  },
  {
    titulo: "Visita pastoral à família Santos",
    descricao: "Família em luto, aguardando visita do pastor e da equipe pastoral",
    responsavel: "Fagner Silva",
    prazo: diasOffset(1),
    status: "em_andamento",
    prioridade: "alta",
    categoria: "Pastoral",
  },
  {
    titulo: "Compra de equipamentos de som",
    descricao: "Orçar e adquirir novos microfones para o ministério de louvor",
    responsavel: "Marco Aurélio",
    prazo: diasOffset(8),
    status: "em_andamento",
    prioridade: "media",
    categoria: "Ministério",
  },
  // Concluídos
  {
    titulo: "Cadastro de novos membros",
    descricao: "8 novos membros registrados no sistema com dados completos",
    responsavel: "Fagner Silva",
    prazo: diasOffset(-4),
    status: "concluido",
    prioridade: "alta",
    categoria: "Administrativo",
  },
  {
    titulo: "Confraternização do grupo de jovens",
    descricao: "Evento realizado com sucesso — 45 participantes presentes",
    responsavel: "Lisandra Souza",
    prazo: diasOffset(-6),
    status: "concluido",
    prioridade: "media",
    categoria: "Eventos",
  },
  {
    titulo: "Envio de dízimos para contabilidade",
    descricao: "Relatório financeiro do mês enviado ao tesoureiro",
    responsavel: "Adriana Lima",
    prazo: diasOffset(-3),
    status: "concluido",
    prioridade: "alta",
    categoria: "Administrativo",
  },
  // Atrasados
  {
    titulo: "Follow-up com visitantes do mês",
    descricao: "Ligar e enviar mensagem para os 34 visitantes registrados no mês",
    responsavel: "Marco Aurélio",
    prazo: diasOffset(-7),
    status: "atrasado",
    prioridade: "alta",
    categoria: "Pastoral",
  },
  {
    titulo: "Postagem nas redes sociais — semana santa",
    descricao: "Publicar cronograma e devocionais da semana santa nas redes",
    responsavel: "Adriana Lima",
    prazo: diasOffset(-10),
    status: "atrasado",
    prioridade: "media",
    categoria: "Digital",
  },
  {
    titulo: "Atualização cadastral dos membros inativos",
    descricao: "Verificar e atualizar dados dos 13 membros inativos no sistema",
    responsavel: "Fagner Silva",
    prazo: diasOffset(-15),
    status: "atrasado",
    prioridade: "baixa",
    categoria: "Administrativo",
  },
];

// ── Mock de notificações ──────────────────────────────────────────────────────

type Notificacao = {
  id: number;
  tipo: "WhatsApp" | "Email" | "Sistema";
  icone: string;
  contato: string;
  mensagem: string;
  hora: string;
  data: string;
};

const NOTIFICACOES: Notificacao[] = [
  { id: 1, tipo: "WhatsApp", icone: "💬", contato: "Fagner Silva",   mensagem: "Nova tarefa atribuída: 'Visita pastoral à família Santos'",              hora: "09:15", data: "Hoje" },
  { id: 2, tipo: "WhatsApp", icone: "💬", contato: "Marco Aurélio",  mensagem: "Lembrete: tarefa 'Follow-up com visitantes' está atrasada há 7 dias",     hora: "08:30", data: "Hoje" },
  { id: 3, tipo: "Email",    icone: "📧", contato: "Adriana Lima",   mensagem: "Tarefa 'Postagem nas redes sociais' está atrasada — ação necessária",      hora: "08:00", data: "Hoje" },
  { id: 4, tipo: "Sistema",  icone: "🔔", contato: "Sistema",        mensagem: "3 tarefas vencem nos próximos 2 dias",                                     hora: "00:00", data: "Hoje" },
  { id: 5, tipo: "WhatsApp", icone: "💬", contato: "Lisandra Souza", mensagem: "Tarefa 'Organizar culto de jovens' atribuída com prazo em 11 dias",        hora: "18:45", data: "Ontem" },
  { id: 6, tipo: "Email",    icone: "📧", contato: "Fagner Silva",   mensagem: "Resumo semanal: 2 tarefas concluídas, 3 atrasadas, 1 vence hoje",          hora: "09:00", data: "Ontem" },
  { id: 7, tipo: "Sistema",  icone: "🔔", contato: "Sistema",        mensagem: "Tarefa 'Envio de dízimos para contabilidade' marcada como concluída ✓",    hora: "14:30", data: "Anteontem" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDataPT(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function prazoLabel(prazo?: string | null, status?: Tarefa["status"]): { text: string; variant: "red" | "gold" | "green" | "muted" } {
  if (!prazo) return { text: "Sem prazo", variant: "muted" };
  if (status === "concluido") return { text: formatDataPT(prazo), variant: "green" };
  const diff = Math.ceil((new Date(prazo).getTime() - new Date(HOJE).getTime()) / 86400000);
  if (diff < 0)  return { text: `Atrasado ${Math.abs(diff)}d`, variant: "red"   };
  if (diff === 0) return { text: "Vence hoje",                  variant: "red"   };
  if (diff <= 3)  return { text: `${diff}d restantes`,          variant: "gold"  };
  return              { text: formatDataPT(prazo),               variant: "green" };
}

// ── Tipos de formulário ───────────────────────────────────────────────────────

type FormData = {
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  prioridade: Tarefa["prioridade"];
  status: Tarefa["status"];
  categoria: string;
};

const FORM_VAZIO: FormData = {
  titulo: "",
  descricao: "",
  responsavel: USUARIO_LOGADO,
  prazo: "",
  prioridade: "media",
  status: "pendente",
  categoria: "Administrativo",
};

type View = "kanban" | "minhas" | "notificacoes";

type Filtros = {
  responsavel: string;
  status: string;
  prazo: string;
  prioridade: string;
};

const FILTROS_VAZIOS: Filtros = { responsavel: "", status: "", prazo: "", prioridade: "" };

// ── Página principal ──────────────────────────────────────────────────────────

export default function TarefasPage() {
  const supabase = createClient();

  const [tarefas,     setTarefas]     = useState<Tarefa[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [seeding,     setSeeding]     = useState(false);
  const [view,        setView]        = useState<View>("kanban");
  const [filtros,     setFiltros]     = useState<Filtros>(FILTROS_VAZIOS);

  // Modal
  const [modalAberto,       setModalAberto]       = useState(false);
  const [tarefaEditando,    setTarefaEditando]     = useState<Tarefa | null>(null);
  const [form,              setForm]               = useState<FormData>(FORM_VAZIO);
  const [salvando,          setSalvando]           = useState(false);
  const [deletando,         setDeletando]          = useState(false);
  const [erroTitulo,        setErroTitulo]         = useState("");

  // ── Carregamento ──────────────────────────────────────────────────────────

  const carregarTarefas = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await getTarefas(supabase);

      // Auto-promove para atrasado no cliente (sem alterar DB para minimizar escritas)
      const atualizadas = dados.map((t) => {
        if (
          t.prazo &&
          t.status !== "concluido" &&
          t.status !== "atrasado" &&
          t.prazo < HOJE
        ) {
          return { ...t, status: "atrasado" as const };
        }
        return t;
      });

      // Atualiza no DB tarefas que mudaram de status
      const promovidas = atualizadas.filter((t, i) => t.status !== dados[i].status);
      await Promise.all(
        promovidas.map((t) => atualizaTarefa(supabase, t.id, { status: "atrasado" }))
      );

      setTarefas(atualizadas);

      // Seed se vazio
      if (atualizadas.length === 0) {
        await seedTarefas();
      }
    } catch (e) {
      console.error("Erro ao carregar tarefas:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function seedTarefas() {
    setSeeding(true);
    try {
      const inseridas = await Promise.all(
        SEED_TAREFAS.map((t) => criaTarefa(supabase, t))
      );
      setTarefas(inseridas);
    } catch (e) {
      console.error("Erro ao seed tarefas:", e);
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => { carregarTarefas(); }, [carregarTarefas]);

  // ── Filtros ───────────────────────────────────────────────────────────────

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      if (filtros.responsavel && t.responsavel !== filtros.responsavel) return false;
      if (filtros.status      && t.status      !== filtros.status)      return false;
      if (filtros.prioridade  && t.prioridade  !== filtros.prioridade)  return false;
      if (filtros.prazo) {
        if (!t.prazo) return filtros.prazo === "sem_prazo";
        const diff = Math.ceil((new Date(t.prazo).getTime() - new Date(HOJE).getTime()) / 86400000);
        if (filtros.prazo === "hoje"    && diff !== 0)       return false;
        if (filtros.prazo === "semana"  && (diff < 0 || diff > 7)) return false;
        if (filtros.prazo === "atrasado" && diff >= 0)       return false;
      }
      return true;
    });
  }, [tarefas, filtros]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total      = tarefas.length;
    const atrasadas  = tarefas.filter((t) => t.status === "atrasado").length;
    const vencem     = tarefas.filter((t) => t.prazo === HOJE && t.status !== "concluido").length;
    const andamento  = tarefas.filter((t) => t.status === "em_andamento").length;
    return { total, atrasadas, vencem, andamento };
  }, [tarefas]);

  // ── Handlers de modal ─────────────────────────────────────────────────────

  function abrirCriar() {
    setTarefaEditando(null);
    setForm(FORM_VAZIO);
    setErroTitulo("");
    setModalAberto(true);
  }

  function abrirEditar(t: Tarefa) {
    setTarefaEditando(t);
    setForm({
      titulo:      t.titulo,
      descricao:   t.descricao  ?? "",
      responsavel: t.responsavel ?? USUARIO_LOGADO,
      prazo:       t.prazo       ?? "",
      prioridade:  t.prioridade,
      status:      t.status,
      categoria:   t.categoria   ?? "Administrativo",
    });
    setErroTitulo("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTarefaEditando(null);
  }

  async function salvarTarefa() {
    if (!form.titulo.trim()) {
      setErroTitulo("Título é obrigatório");
      return;
    }
    setSalvando(true);
    try {
      const dados: NovaTarefa = {
        titulo:      form.titulo.trim(),
        descricao:   form.descricao.trim() || undefined,
        responsavel: form.responsavel || undefined,
        prazo:       form.prazo || undefined,
        prioridade:  form.prioridade,
        status:      form.status,
        categoria:   form.categoria || undefined,
      };

      if (tarefaEditando) {
        const atualizada = await atualizaTarefa(supabase, tarefaEditando.id, dados);
        setTarefas((prev) => prev.map((t) => (t.id === atualizada.id ? atualizada : t)));
        // Notificação mock
        if (dados.responsavel && dados.responsavel !== tarefaEditando.responsavel) {
          console.log(`[Notificação] Responsável alterado: ${dados.responsavel} atribuído à tarefa "${dados.titulo}"`);
        }
      } else {
        const criada = await criaTarefa(supabase, dados);
        setTarefas((prev) => [...prev, criada]);
        console.log(`[Notificação] Nova tarefa criada para ${dados.responsavel}: "${dados.titulo}"`);
      }
      fecharModal();
    } catch (e) {
      console.error("Erro ao salvar tarefa:", e);
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar() {
    if (!tarefaEditando) return;
    setDeletando(true);
    try {
      await deletaTarefa(supabase, tarefaEditando.id);
      setTarefas((prev) => prev.filter((t) => t.id !== tarefaEditando.id));
      fecharModal();
    } catch (e) {
      console.error("Erro ao deletar tarefa:", e);
    } finally {
      setDeletando(false);
    }
  }

  async function toggleConcluido(t: Tarefa) {
    const novoStatus: Tarefa["status"] = t.status === "concluido" ? "pendente" : "concluido";
    try {
      const atualizada = await atualizaTarefa(supabase, t.id, { status: novoStatus });
      setTarefas((prev) => prev.map((x) => (x.id === atualizada.id ? atualizada : x)));
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const totalFiltrado = tarefasFiltradas.length;
  const subtitulo = loading
    ? "Carregando tarefas…"
    : `${stats.total} tarefa${stats.total !== 1 ? "s" : ""} · ${stats.atrasadas} atrasada${stats.atrasadas !== 1 ? "s" : ""}`;

  return (
    <>
      <Topbar
        title="Equipe & Tarefas"
        subtitle={subtitulo}
        actions={
          <Button variant="primary" size="sm" onClick={abrirCriar}>
            + Nova Tarefa
          </Button>
        }
      />

      <main
        style={{ paddingTop: "var(--topbar-h)" }}
        className="flex-1 flex flex-col min-h-0"
      >
        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total}     icon="📋" color="var(--ink)"  />
          <StatCard label="Atrasadas" value={stats.atrasadas} icon="⚠️" color="var(--red)"  />
          <StatCard label="Vencem hoje" value={stats.vencem}  icon="⏰" color="#d97706"     />
          <StatCard label="Em andamento" value={stats.andamento} icon="⚡" color="var(--blue)" />
        </div>

        {/* ── Abas ───────────────────────────────────────────────────────── */}
        <div className="px-6 flex items-center gap-1 border-b border-[var(--border)]">
          {(["kanban", "minhas", "notificacoes"] as View[]).map((v) => {
            const labels: Record<View, string> = {
              kanban:       "Kanban",
              minhas:       "Minhas Tarefas",
              notificacoes: "Notificações",
            };
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                  view === v
                    ? "border-[var(--gold)] text-[var(--gold-dark)]"
                    : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {labels[v]}
                {v === "notificacoes" && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--red)] text-white text-[9px] font-bold">
                    {NOTIFICACOES.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        {view !== "notificacoes" && (
          <div className="px-6 py-3 flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-2)]">
            <select
              value={filtros.responsavel}
              onChange={(e) => setFiltros((f) => ({ ...f, responsavel: e.target.value }))}
              className="h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-xs px-2 pr-6 appearance-none text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            >
              <option value="">Todos responsáveis</option>
              {RESPONSAVEIS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={filtros.status}
              onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}
              className="h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-xs px-2 pr-6 appearance-none text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            >
              <option value="">Todos os status</option>
              {COLUNAS.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
            </select>

            <select
              value={filtros.prazo}
              onChange={(e) => setFiltros((f) => ({ ...f, prazo: e.target.value }))}
              className="h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-xs px-2 pr-6 appearance-none text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            >
              <option value="">Qualquer prazo</option>
              <option value="hoje">Vence hoje</option>
              <option value="semana">Esta semana</option>
              <option value="atrasado">Atrasado</option>
            </select>

            <select
              value={filtros.prioridade}
              onChange={(e) => setFiltros((f) => ({ ...f, prioridade: e.target.value }))}
              className="h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-xs px-2 pr-6 appearance-none text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            >
              <option value="">Qualquer prioridade</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            {Object.values(filtros).some(Boolean) && (
              <button
                onClick={() => setFiltros(FILTROS_VAZIOS)}
                className="h-8 px-3 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] border border-[var(--border)] rounded-[6px] bg-[var(--surface)] transition-colors"
              >
                Limpar filtros ×
              </button>
            )}

            {Object.values(filtros).some(Boolean) && (
              <span className="text-xs text-[var(--ink-muted)] ml-auto">
                {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* ── Conteúdo ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto">
          {loading || seeding ? (
            <LoadingState seeding={seeding} />
          ) : view === "kanban" ? (
            <KanbanView tarefas={tarefasFiltradas} onEditar={abrirEditar} />
          ) : view === "minhas" ? (
            <MinhasTarefasView
              tarefas={tarefasFiltradas.filter(
                (t) => t.responsavel === USUARIO_LOGADO && t.status !== "concluido"
              )}
              onToggle={toggleConcluido}
              onEditar={abrirEditar}
            />
          ) : (
            <NotificacoesView />
          )}
        </div>
      </main>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      <ModalTarefa
        open={modalAberto}
        onClose={fecharModal}
        form={form}
        setForm={setForm}
        erroTitulo={erroTitulo}
        setErroTitulo={setErroTitulo}
        editando={!!tarefaEditando}
        salvando={salvando}
        deletando={deletando}
        onSalvar={salvarTarefa}
        onDeletar={handleDeletar}
      />
    </>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: {
  label: string; value: number; icon: string; color: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-3 animate-fade-in">
      <span
        className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center text-base shrink-0"
        style={{ background: color + "18", color }}
      >
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-xs text-[var(--ink-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── KanbanView ────────────────────────────────────────────────────────────────

function KanbanView({ tarefas, onEditar }: {
  tarefas: Tarefa[];
  onEditar: (t: Tarefa) => void;
}) {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUNAS.map((col) => {
        const items = tarefas.filter((t) => t.status === col);
        const cfg   = STATUS_CFG[col];
        return (
          <div key={col} className="flex flex-col gap-3">
            {/* Header da coluna */}
            <div
              className="flex items-center justify-between px-3 py-2 rounded-[var(--radius)] border"
              style={{ background: cfg.colBg, borderColor: cfg.borderCor }}
            >
              <span className="text-xs font-semibold" style={{ color: cfg.cor }}>
                {cfg.label}
              </span>
              <span
                className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: cfg.cor }}
              >
                {items.length}
              </span>
            </div>

            {/* Cards */}
            {items.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-8 rounded-[var(--radius-lg)] border-2 border-dashed text-center gap-1"
                style={{ borderColor: cfg.borderCor, background: cfg.colBg + "88" }}
              >
                <span className="text-xl opacity-40">📭</span>
                <p className="text-xs text-[var(--ink-muted)]">Nenhuma tarefa</p>
              </div>
            ) : (
              items.map((t) => (
                <TarefaCard key={t.id} tarefa={t} onEditar={onEditar} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── TarefaCard ────────────────────────────────────────────────────────────────

function TarefaCard({ tarefa: t, onEditar }: {
  tarefa: Tarefa;
  onEditar: (t: Tarefa) => void;
}) {
  const prCfg  = PRIORIDADE_CFG[t.prioridade];
  const prazo  = prazoLabel(t.prazo, t.status);
  const concluido = t.status === "concluido";

  return (
    <div
      className={[
        "card group flex flex-col overflow-hidden transition-all duration-200",
        "hover:border-[var(--gold)] hover:shadow-md cursor-pointer",
        concluido ? "opacity-60" : "",
      ].join(" ")}
      onClick={() => onEditar(t)}
    >
      {/* Faixa de prioridade */}
      <div className="h-1 w-full shrink-0" style={{ background: prCfg.stripe }} />

      <div className="p-3 flex flex-col gap-2">
        {/* Título */}
        <p
          className={[
            "text-sm font-semibold text-[var(--ink)] leading-snug",
            concluido ? "line-through text-[var(--ink-muted)]" : "",
          ].join(" ")}
        >
          {t.titulo}
        </p>

        {/* Descrição */}
        {t.descricao && (
          <p className="text-xs text-[var(--ink-muted)] line-clamp-2 leading-relaxed">
            {t.descricao}
          </p>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {t.responsavel ? (
              <>
                <Avatar name={t.responsavel} size="xs" />
                <span className="text-[11px] text-[var(--ink-muted)] truncate">{t.responsavel.split(" ")[0]}</span>
              </>
            ) : (
              <span className="text-[11px] text-[var(--ink-muted)]">—</span>
            )}
          </div>
          <span
            className={[
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
              prazo.variant === "red"   ? "bg-[#fde8e6] text-[#9b1c1c]" :
              prazo.variant === "gold"  ? "bg-[#fef3c7] text-[#92400e]" :
              prazo.variant === "green" ? "bg-[#d4ede5] text-[#1a5c42]" :
                                          "bg-[var(--surface-2)] text-[var(--ink-muted)]",
            ].join(" ")}
          >
            📅 {prazo.text}
          </span>
        </div>

        {/* Categoria + editar */}
        {t.categoria && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--ink-muted)] bg-[var(--surface-2)] border border-[var(--border)] px-1.5 py-0.5 rounded-full">
              {t.categoria}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onEditar(t); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ink-muted)] hover:text-[var(--ink)] text-xs px-1"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MinhasTarefasView ─────────────────────────────────────────────────────────

function MinhasTarefasView({ tarefas, onToggle, onEditar }: {
  tarefas: Tarefa[];
  onToggle: (t: Tarefa) => void;
  onEditar: (t: Tarefa) => void;
}) {
  if (tarefas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <span className="text-4xl">🎉</span>
        <p className="text-base font-semibold text-[var(--ink)]">Tudo em dia!</p>
        <p className="text-sm text-[var(--ink-muted)]">Nenhuma tarefa pendente para você.</p>
      </div>
    );
  }

  const porStatus = COLUNAS.filter((s) => s !== "concluido").map((s) => ({
    status: s,
    items: tarefas.filter((t) => t.status === s),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="p-6 max-w-2xl">
      {porStatus.map(({ status, items }) => {
        const cfg = STATUS_CFG[status];
        return (
          <div key={status} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.cor }}>
                {cfg.label}
              </span>
              <span className="text-xs text-[var(--ink-muted)]">{items.length} tarefa{items.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2">
              {items.map((t) => {
                const prCfg = PRIORIDADE_CFG[t.prioridade];
                const prazo = prazoLabel(t.prazo, t.status);
                return (
                  <div
                    key={t.id}
                    className="card p-3 flex items-start gap-3 hover:border-[var(--gold)] transition-all"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggle(t)}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-[var(--border)] shrink-0 flex items-center justify-center hover:border-[var(--green)] transition-colors"
                    />

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[var(--ink)]">{t.titulo}</p>
                        <button
                          onClick={() => onEditar(t)}
                          className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-xs shrink-0"
                        >
                          ✏️
                        </button>
                      </div>
                      {t.descricao && (
                        <p className="text-xs text-[var(--ink-muted)] mt-0.5 line-clamp-1">{t.descricao}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium" style={{ color: prCfg.stripe }}>
                          ● {prCfg.label}
                        </span>
                        <span
                          className={[
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            prazo.variant === "red"   ? "bg-[#fde8e6] text-[#9b1c1c]" :
                            prazo.variant === "gold"  ? "bg-[#fef3c7] text-[#92400e]" :
                            prazo.variant === "green" ? "bg-[#d4ede5] text-[#1a5c42]" :
                                                        "bg-[var(--surface-2)] text-[var(--ink-muted)]",
                          ].join(" ")}
                        >
                          {prazo.text}
                        </span>
                        {t.categoria && (
                          <span className="text-[10px] text-[var(--ink-muted)]">{t.categoria}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── NotificacoesView ──────────────────────────────────────────────────────────

function NotificacoesView() {
  const grupos = [
    { data: "Hoje",       items: NOTIFICACOES.filter((n) => n.data === "Hoje") },
    { data: "Ontem",      items: NOTIFICACOES.filter((n) => n.data === "Ontem") },
    { data: "Anteontem",  items: NOTIFICACOES.filter((n) => n.data === "Anteontem") },
  ].filter((g) => g.items.length > 0);

  const tipoCor: Record<string, string> = {
    WhatsApp: "bg-[#d4ede5] text-[#1a5c42]",
    Email:    "bg-[#dbeafe] text-[#1e40af]",
    Sistema:  "bg-[#fef3c7] text-[#92400e]",
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="card overflow-hidden">
        {grupos.map(({ data, items }, gi) => (
          <div key={data}>
            <div className="px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide">{data}</p>
            </div>
            {items.map((n, i) => (
              <div
                key={n.id}
                className={[
                  "flex items-start gap-3 px-4 py-3",
                  i < items.length - 1 || gi < grupos.length - 1 ? "border-b border-[var(--border)]" : "",
                ].join(" ")}
              >
                <span className="text-xl mt-0.5 shrink-0">{n.icone}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tipoCor[n.tipo]}`}>
                      {n.tipo}
                    </span>
                    <span className="text-xs font-medium text-[var(--ink)]">{n.contato}</span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{n.mensagem}</p>
                </div>
                <span className="text-[11px] text-[var(--ink-muted)] shrink-0 mt-0.5">{n.hora}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--ink-muted)] text-center mt-4">
        Notificações automáticas de WhatsApp e Email em desenvolvimento
      </p>
    </div>
  );
}

// ── ModalTarefa ───────────────────────────────────────────────────────────────

function ModalTarefa({
  open, onClose, form, setForm, erroTitulo, setErroTitulo,
  editando, salvando, deletando, onSalvar, onDeletar,
}: {
  open: boolean;
  onClose: () => void;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  erroTitulo: string;
  setErroTitulo: (v: string) => void;
  editando: boolean;
  salvando: boolean;
  deletando: boolean;
  onSalvar: () => void;
  onDeletar: () => void;
}) {
  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "titulo") setErroTitulo("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editando ? "Editar Tarefa" : "Nova Tarefa"}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Título */}
        <Input
          label="Título"
          value={form.titulo}
          onChange={(e) => set("titulo", e.target.value)}
          error={erroTitulo}
          placeholder="Ex: Visitar família Oliveira"
          autoFocus
        />

        {/* Descrição */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--ink)]">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            rows={3}
            placeholder="Detalhes sobre a tarefa…"
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-colors"
          />
        </div>

        {/* Linha 2: Responsável + Prazo */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Responsável"
            value={form.responsavel}
            onChange={(e) => set("responsavel", e.target.value)}
            options={RESPONSAVEIS.map((r) => ({ value: r, label: r }))}
          />
          <Input
            label="Prazo"
            type="date"
            value={form.prazo}
            onChange={(e) => set("prazo", e.target.value)}
          />
        </div>

        {/* Linha 3: Prioridade + Status */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Prioridade"
            value={form.prioridade}
            onChange={(e) => set("prioridade", e.target.value as Tarefa["prioridade"])}
            options={[
              { value: "alta",  label: "🔴 Alta"  },
              { value: "media", label: "🟡 Média" },
              { value: "baixa", label: "🟢 Baixa" },
            ]}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value as Tarefa["status"])}
            options={COLUNAS.map((s) => ({ value: s, label: STATUS_CFG[s].label }))}
          />
        </div>

        {/* Categoria */}
        <Select
          label="Categoria"
          value={form.categoria}
          onChange={(e) => set("categoria", e.target.value)}
          options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
        />

        {/* Botões */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div>
            {editando && (
              <Button
                variant="danger"
                size="sm"
                loading={deletando}
                onClick={onDeletar}
              >
                Deletar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={salvando || deletando}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" loading={salvando} onClick={onSalvar}>
              {editando ? "Salvar" : "Criar Tarefa"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── LoadingState ──────────────────────────────────────────────────────────────

function LoadingState({ seeding }: { seeding: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[var(--ink-muted)]">
        {seeding ? "Criando tarefas de exemplo…" : "Carregando tarefas…"}
      </p>
    </div>
  );
}
