import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tarefa, NovaTarefa, UpdateTarefa, FiltroTarefas } from '@/types'

export async function getTarefas(
  supabase: SupabaseClient,
  filtros?: FiltroTarefas
): Promise<Tarefa[]> {
  let query = supabase
    .from('tarefas')
    .select('*')
    .order('prazo',      { ascending: true, nullsFirst: false })
    .order('prioridade', { ascending: true })

  if (filtros?.status)      query = query.eq('status',      filtros.status)
  if (filtros?.prioridade)  query = query.eq('prioridade',  filtros.prioridade)
  if (filtros?.responsavel) query = query.eq('responsavel', filtros.responsavel)
  if (filtros?.categoria)   query = query.eq('categoria',   filtros.categoria)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Tarefa[]
}

export async function getTarefaById(
  supabase: SupabaseClient,
  id: string
): Promise<Tarefa | null> {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Tarefa
}

export async function criaTarefa(
  supabase: SupabaseClient,
  dados: NovaTarefa
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from('tarefas')
    .insert([dados])
    .select()

  if (error) throw error
  return data[0] as Tarefa
}

export async function atualizaTarefa(
  supabase: SupabaseClient,
  id: string,
  dados: UpdateTarefa
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from('tarefas')
    .update({ ...dados, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Tarefa
}

export async function deletaTarefa(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('tarefas').delete().eq('id', id)
  if (error) throw error
}
