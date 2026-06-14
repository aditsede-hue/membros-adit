"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/permissoes";

export interface Perfil {
  id: string;
  nome: string;
  email: string | null;
  role: Role;
  ativo: boolean;
}

// Hook que carrega o perfil do usuário autenticado a partir da tabela "perfis".
export function usePerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (ativo) { setPerfil(null); setCarregando(false); }
        return;
      }
      const { data, error } = await supabase
        .from("perfis")
        .select("id, nome, email, role, ativo")
        .eq("id", auth.user.id)
        .single();

      if (ativo) {
        if (error) {
          console.error("Erro ao carregar perfil:", error);
          setPerfil(null);
        } else {
          setPerfil(data as Perfil);
        }
        setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, []);

  return { perfil, carregando };
}
