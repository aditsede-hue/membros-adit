import type { SupabaseClient } from '@supabase/supabase-js'
import type { Responsavel, NovoResponsavel, UpdateResponsavel } from '@/types'

export async function getResponsaveis(
  supabase: SupabaseClient,
  apenasAtivos = true
): Promise<Responsavel[]> {
  let query = supabase
    .from('responsaveis')
    .select('*')
    .order('nome', { ascending: true })

  if (apenasAtivos) query = query.eq('ativo', true)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Responsavel[]
}

export async function getResponsavelById(
  supabase: SupabaseClient,
  id: string
): Promise<Responsavel | null> {
  const { data, error } = await supabase
    .from('responsaveis')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Responsavel
}

export async function criaResponsavel(
  supabase: SupabaseClient,
  dados: NovoResponsavel
): Promise<Responsavel> {
  const { data, error } = await supabase
    .from('responsaveis')
    .insert([dados])
    .select()

  if (error) throw error
  return data[0] as Responsavel
}

export async function atualizaResponsavel(
  supabase: SupabaseClient,
  id: string,
  dados: UpdateResponsavel
): Promise<Responsavel> {
  const { data, error } = await supabase
    .from('responsaveis')
    .update(dados)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Responsavel
}

export async function deletaResponsavel(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('responsaveis').delete().eq('id', id)
  if (error) throw error
}
