import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tarefa, NovaTarefa } from "@/types";

export async function getTarefas(supabase: SupabaseClient): Promise<Tarefa[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Tarefa[];
}

export async function criaTarefa(
  supabase: SupabaseClient,
  dados: NovaTarefa
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from("tarefas")
    .insert(dados)
    .select()
    .single();

  if (error) throw error;
  return data as Tarefa;
}

export async function atualizaTarefa(
  supabase: SupabaseClient,
  id: string,
  dados: Partial<NovaTarefa>
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from("tarefas")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Tarefa;
}

export async function deletaTarefa(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("tarefas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}