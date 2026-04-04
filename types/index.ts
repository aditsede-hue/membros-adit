import type { SupabaseClient } from '@supabase/supabase-js'

// Re-export para usar em toda a app
export type { SupabaseClient }

// ─── Entidades principais ─────────────────────────────────────────────────────

export interface Pessoa {
  id:               string
  nome:             string
  tipo:             'membro' | 'visitante' | 'em_processo'
  contato?:         string
  email?:           string
  endereco?:        string
  data_nascimento?: string
  data_batismo?:    string
  estado_civil?:    string
  status:           'ativo' | 'inativo'
  foto_url?:        string
  obs_pastoral?:    string
  como_conheceu?:   string
  primeira_vez?:    boolean
  criado_em:        string
  atualizado_em:    string
}

export interface Evento {
  id:          string
  titulo:      string
  data_ini:    string
  data_fim?:   string
  tipo:        string
  hora?:       string
  responsavel?: string
  obs?:        string
  criado_em:   string
}

export interface Tarefa {
  id:           string
  titulo:       string
  descricao?:   string
  responsavel?: string
  prazo?:       string
  status:       'pendente' | 'em_andamento' | 'concluido' | 'atrasado'
  prioridade:   'alta' | 'media' | 'baixa'
  categoria?:   string
  criado_em:    string
  atualizado_em: string
}

export interface Responsavel {
  id:        string
  nome:      string
  email?:    string
  whatsapp?: string
  cor_hex:   string
  sigla?:    string
  ativo:     boolean
}

// ─── Insert / Update partials ─────────────────────────────────────────────────

export type NovaPessoa        = Omit<Pessoa,      'id' | 'criado_em' | 'atualizado_em'>
export type UpdatePessoa      = Partial<NovaPessoa>

export type NovoEvento        = Omit<Evento,      'id' | 'criado_em'>
export type UpdateEvento      = Partial<NovoEvento>

export type NovaTarefa        = Omit<Tarefa,      'id' | 'criado_em' | 'atualizado_em'>
export type UpdateTarefa      = Partial<NovaTarefa>

export type NovoResponsavel   = Omit<Responsavel, 'id'>
export type UpdateResponsavel = Partial<NovoResponsavel>

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface FiltroPessoas {
  tipo?:    Pessoa['tipo']
  status?:  Pessoa['status']
  busca?:   string
}

export interface FiltroEventos {
  tipo?:      string
  data_de?:   string   // data_ini >= data_de
  data_ate?:  string   // data_ini <= data_ate
}

export interface FiltroTarefas {
  status?:      Tarefa['status']
  prioridade?:  Tarefa['prioridade']
  responsavel?: string
  categoria?:   string
}
