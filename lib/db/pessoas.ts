import type { SupabaseClient } from '@supabase/supabase-js'
import type { Pessoa, NovaPessoa, UpdatePessoa, FiltroPessoas } from '@/types'

export async function getPessoas(
  supabase: SupabaseClient,
  filtros?: FiltroPessoas
): Promise<Pessoa[]> {
  let query = supabase
    .from('pessoas')
    .select('*')
    .order('nome', { ascending: true })

  if (filtros?.tipo)   query = query.eq('tipo',   filtros.tipo)
  if (filtros?.status) query = query.eq('status', filtros.status)
  if (filtros?.busca)  query = query.ilike('nome', `%${filtros.busca}%`)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Pessoa[]
}

export async function getPessoaById(
  supabase: SupabaseClient,
  id: string
): Promise<Pessoa | null> {
  const { data, error } = await supabase
    .from('pessoas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Pessoa
}

export async function criaPessoa(
  supabase: SupabaseClient,
  dados: NovaPessoa
): Promise<Pessoa> {
  const { data, error } = await supabase
    .from('pessoas')
    .insert([dados])
    .select()

  if (error) throw error
  return data[0] as Pessoa
}

export async function atualizaPessoa(
  supabase: SupabaseClient,
  id: string,
  dados: UpdatePessoa
): Promise<Pessoa> {
  const { data, error } = await supabase
    .from('pessoas')
    .update({ ...dados, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Pessoa
}

export async function deletaPessoa(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('pessoas').delete().eq('id', id)
  if (error) throw error
}
