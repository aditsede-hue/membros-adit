import type { SupabaseClient } from '@supabase/supabase-js'
import type { Evento, NovoEvento, UpdateEvento, FiltroEventos } from '@/types'

export async function getEventos(
  supabase: SupabaseClient,
  filtros?: FiltroEventos
): Promise<Evento[]> {
  let query = supabase
    .from('eventos')
    .select('*')
    .order('data_ini', { ascending: true })

  if (filtros?.tipo)     query = query.eq('tipo',       filtros.tipo)
  if (filtros?.data_de)  query = query.gte('data_ini',  filtros.data_de)
  if (filtros?.data_ate) query = query.lte('data_ini',  filtros.data_ate)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Evento[]
}

export async function getEventoById(
  supabase: SupabaseClient,
  id: string
): Promise<Evento | null> {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Evento
}

export async function criaEvento(
  supabase: SupabaseClient,
  dados: NovoEvento
): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .insert([dados])
    .select()

  if (error) throw error
  return data[0] as Evento
}

export async function atualizaEvento(
  supabase: SupabaseClient,
  id: string,
  dados: UpdateEvento
): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .update(dados)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Evento
}

export async function deletaEvento(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('eventos').delete().eq('id', id)
  if (error) throw error
}
