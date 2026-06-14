"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ConfigIgreja {
  nome: string;
  subtitulo: string;
  logo_url: string;
  pastor: string;
  endereco: string;
  telefone: string;
  email: string;
  notif_whatsapp: boolean;
  notif_email: boolean;
}

const CONFIG_PADRAO: ConfigIgreja = {
  nome: "Secretaria Geral",
  subtitulo: "Assembleia de Deus",
  logo_url: "/logo-secretaria.jpeg",
  pastor: "",
  endereco: "",
  telefone: "",
  email: "",
  notif_whatsapp: false,
  notif_email: false,
};

interface IgrejaCtx {
  config: ConfigIgreja;
  recarregar: () => Promise<void>;
}

const IgrejaContext = createContext<IgrejaCtx>({
  config: CONFIG_PADRAO,
  recarregar: async () => {},
});

export function useIgreja() {
  return useContext(IgrejaContext);
}

export function IgrejaProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [config, setConfig] = useState<ConfigIgreja>(CONFIG_PADRAO);

  const recarregar = useCallback(async () => {
    const { data } = await supabase
      .from("config_igreja")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setConfig({
        nome:            data.nome            ?? CONFIG_PADRAO.nome,
        subtitulo:       data.subtitulo       ?? CONFIG_PADRAO.subtitulo,
        logo_url:        data.logo_url        || CONFIG_PADRAO.logo_url,
        pastor:          data.pastor          ?? "",
        endereco:        data.endereco        ?? "",
        telefone:        data.telefone        ?? "",
        email:           data.email           ?? "",
        notif_whatsapp:  data.notif_whatsapp  ?? false,
        notif_email:     data.notif_email     ?? false,
      });
    }
  }, [supabase]);

  useEffect(() => { recarregar(); }, [recarregar]);

  return (
    <IgrejaContext.Provider value={{ config, recarregar }}>
      {children}
    </IgrejaContext.Provider>
  );
}
