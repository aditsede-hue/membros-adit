"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type CorTema =
  | "azul"
  | "verde"
  | "roxo"
  | "vermelho"
  | "laranja"
  | "rosa"
  | "ciano";

export type ModoTema = "claro" | "escuro";

export interface Tema {
  cor: CorTema;
  modo: ModoTema;
}

const TEMA_PADRAO: Tema = { cor: "azul", modo: "claro" };

// ── Paleta de cores ───────────────────────────────────────────────────────────

export const PALETA: Record<CorTema, { label: string; primary: string; dark: string; light: string }> = {
  azul:     { label: "Azul",     primary: "#007aff", dark: "#0051d5", light: "#f0f7ff" },
  verde:    { label: "Verde",    primary: "#16a34a", dark: "#14532d", light: "#f0fdf4" },
  roxo:     { label: "Roxo",     primary: "#7c3aed", dark: "#4c1d95", light: "#f5f3ff" },
  vermelho: { label: "Vermelho", primary: "#dc2626", dark: "#991b1b", light: "#fff5f5" },
  laranja:  { label: "Laranja",  primary: "#ea580c", dark: "#9a3412", light: "#fff7ed" },
  rosa:     { label: "Rosa",     primary: "#db2777", dark: "#9d174d", light: "#fdf2f8" },
  ciano:    { label: "Ciano",    primary: "#0891b2", dark: "#164e63", light: "#ecfeff" },
};

// ── Aplicar tema no documento ─────────────────────────────────────────────────

function aplicarTema(tema: Tema) {
  const root = document.documentElement;
  const cor = PALETA[tema.cor];

  root.style.setProperty("--primary",      cor.primary);
  root.style.setProperty("--primary-dark", cor.dark);
  root.style.setProperty("--primary-light", cor.light);

  if (tema.modo === "escuro") {
    root.style.setProperty("--bg",         "#111113");
    root.style.setProperty("--surface",    "#1c1c1e");
    root.style.setProperty("--surface-2",  "#2c2c2e");
    root.style.setProperty("--border",     "#3a3a3c");
    root.style.setProperty("--ink",        "#f5f5f7");
    root.style.setProperty("--ink-muted",  "#98989d");
    root.setAttribute("data-mode", "escuro");
  } else {
    root.style.setProperty("--bg",         "#ffffff");
    root.style.setProperty("--surface",    "#ffffff");
    root.style.setProperty("--surface-2",  "#f5f5f7");
    root.style.setProperty("--border",     "#d2d2d7");
    root.style.setProperty("--ink",        "#1d1d1f");
    root.style.setProperty("--ink-muted",  "#6e6e73");
    root.setAttribute("data-mode", "claro");
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface TemaCtx {
  tema: Tema;
  setTema: (t: Tema) => void;
  salvarTema: (t: Tema) => Promise<void>;
}

const TemaContext = createContext<TemaCtx>({
  tema: TEMA_PADRAO,
  setTema: () => {},
  salvarTema: async () => {},
});

export function useTema() {
  return useContext(TemaContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [tema, setTemaState] = useState<Tema>(TEMA_PADRAO);

  // Carrega o tema salvo do banco ao montar
  useEffect(() => {
    async function carregar() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data } = await supabase
        .from("perfis")
        .select("configuracoes")
        .eq("id", auth.user.id)
        .single();

      if (data?.configuracoes?.tema) {
        const t = data.configuracoes.tema as Tema;
        setTemaState(t);
        aplicarTema(t);
      }
    }
    carregar();
  }, [supabase]);

  // Aplica no DOM sempre que o tema muda
  function setTema(t: Tema) {
    setTemaState(t);
    aplicarTema(t);
  }

  // Salva no banco
  const salvarTema = useCallback(async (t: Tema) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data: atual } = await supabase
      .from("perfis")
      .select("configuracoes")
      .eq("id", auth.user.id)
      .single();

    const novaConfig = { ...(atual?.configuracoes ?? {}), tema: t };

    await supabase
      .from("perfis")
      .update({ configuracoes: novaConfig })
      .eq("id", auth.user.id);
  }, [supabase]);

  return (
    <TemaContext.Provider value={{ tema, setTema, salvarTema }}>
      {children}
    </TemaContext.Provider>
  );
}
