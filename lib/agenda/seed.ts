import type { SupabaseClient } from '@supabase/supabase-js'
import type { NovoEvento } from '@/types'

// ── 58 eventos reais da Agenda ADIT 2026 ─────────────────────────────────────
const EVENTOS_2026: NovoEvento[] = [
  // ── JANEIRO (4) ─────────────────────────────────────────────────────────────
  { titulo: 'Aniversário Pr. Nivaldo',         data_ini: '2026-01-05', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Nivaldo', obs: 'Pastor titular da 1ª ADIT' },
  { titulo: 'Aniversário 6ª ADIT',             data_ini: '2026-01-10', data_fim: '2026-01-11', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Fagner Silva', obs: 'Festividade de aniversário da congregação' },
  { titulo: 'Santa Ceia',                      data_ini: '2026-01-18', tipo: 'culto',       hora: '18:00', responsavel: 'Pr. Fagner Silva' },
  { titulo: 'Aniversário Pr. Jonas',           data_ini: '2026-01-29', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Jonas' },

  // ── FEVEREIRO (5) ────────────────────────────────────────────────────────────
  { titulo: 'Reunião de Líderes',              data_ini: '2026-02-07', tipo: 'reuniao',     hora: '09:00', responsavel: 'Pr. Fagner Silva', obs: 'Reunião mensal de líderes de célula' },
  { titulo: 'Conjaadit 2026',                  data_ini: '2026-02-12', data_fim: '2026-02-15', tipo: 'convencao', hora: '19:00', responsavel: 'Presbitério ADIT', obs: 'Convenção dos Jovens ADIT — programação especial' },
  { titulo: 'Aniversário Pra. Sandra',         data_ini: '2026-02-14', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Sandra' },
  { titulo: 'Santa Ceia + Batismo',            data_ini: '2026-02-22', tipo: 'batismo',     hora: '18:00', responsavel: 'Pr. Fagner Silva', obs: 'Culto especial de Santa Ceia e Batismo nas águas' },
  { titulo: 'Aniversário Pra. Ester',          data_ini: '2026-02-28', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Ester' },

  // ── MARÇO (4) ───────────────────────────────────────────────────────────────
  { titulo: 'Rede de Mulheres',                data_ini: '2026-03-07', tipo: 'rede',        hora: '14:00', responsavel: 'Pra. Zélia', obs: 'Encontro trimestral da Rede de Mulheres ADIT' },
  { titulo: 'Festividade 6ª ADIT',             data_ini: '2026-03-14', data_fim: '2026-03-15', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Fagner Silva', obs: 'Programação especial de aniversário' },
  { titulo: 'Aniversário Pra. Zélia',          data_ini: '2026-03-20', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Zélia' },
  { titulo: 'Reunião de Pastores',             data_ini: '2026-03-28', tipo: 'reuniao',     hora: '09:00', responsavel: 'Presbitério ADIT', obs: 'Reunião do presbitério regional' },

  // ── ABRIL (5) ───────────────────────────────────────────────────────────────
  { titulo: 'Aniversário Pr. Elton',           data_ini: '2026-04-03', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Elton' },
  { titulo: 'Aniversário 2ª ADIT',             data_ini: '2026-04-11', data_fim: '2026-04-12', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Níver', obs: 'Festividade de aniversário da 2ª Congregação' },
  { titulo: 'Convenção Nacional CGADB',        data_ini: '2026-04-14', data_fim: '2026-04-17', tipo: 'convencao', hora: '08:00', responsavel: 'Presbitério ADIT', obs: 'Assembleia Geral Ordinária da CGADB' },
  { titulo: 'Preparando Príncipes',            data_ini: '2026-04-25', tipo: 'especial',    hora: '08:00', responsavel: 'Pr. Fagner Silva', obs: 'Retiro de formação para jovens' },
  { titulo: 'Aniversário Pra. Rejane',         data_ini: '2026-04-28', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Rejane' },

  // ── MAIO (5) ────────────────────────────────────────────────────────────────
  { titulo: 'Abertura — Mês de Oração',        data_ini: '2026-05-01', tipo: 'especial',    hora: '19:30', responsavel: 'Pr. Fagner Silva', obs: 'Início do mês dedicado à oração' },
  { titulo: 'Santa Ceia',                      data_ini: '2026-05-10', tipo: 'culto',       hora: '18:00', responsavel: 'Pr. Fagner Silva' },
  { titulo: 'Reunião Geral',                   data_ini: '2026-05-23', tipo: 'reuniao',     hora: '09:00', responsavel: 'Presbitério ADIT', obs: 'Reunião geral com todos os líderes e obreiros' },
  { titulo: 'Aniversário Pra. Alexandra',      data_ini: '2026-05-30', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Alexandra' },
  { titulo: 'Encerramento — Mês de Oração',    data_ini: '2026-05-31', tipo: 'especial',    hora: '18:00', responsavel: 'Pr. Fagner Silva', obs: 'Culto de encerramento do Mês de Oração' },

  // ── JUNHO (5) ───────────────────────────────────────────────────────────────
  { titulo: 'Conici 2026',                     data_ini: '2026-06-05', data_fim: '2026-06-07', tipo: 'convencao', hora: '19:00', responsavel: 'Presbitério ADIT', obs: 'Congresso Internacional de Crianças' },
  { titulo: 'Festividade 5ª ADIT',             data_ini: '2026-06-13', data_fim: '2026-06-14', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Rodrigo', obs: 'Festividade de aniversário da 5ª Congregação' },
  { titulo: 'Selados — Congresso de Jovens',   data_ini: '2026-06-19', data_fim: '2026-06-20', tipo: 'especial',   hora: '19:00', responsavel: 'Pr. Fagner Silva', obs: 'Congresso anual de jovens do Campo ADIT' },
  { titulo: 'Aniversário Pr. Alberto',         data_ini: '2026-06-22', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Alberto' },
  { titulo: 'Aniversário 4ª ADIT',             data_ini: '2026-06-27', data_fim: '2026-06-28', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Marcos', obs: 'Festividade de aniversário da 4ª Congregação' },

  // ── JULHO (4) ───────────────────────────────────────────────────────────────
  { titulo: 'Projeto Mão Amiga 2026',          data_ini: '2026-07-04', tipo: 'especial',    hora: '08:00', responsavel: 'Pr. Fagner Silva', obs: 'Ação social comunitária' },
  { titulo: 'Rede de Casais',                  data_ini: '2026-07-11', tipo: 'rede',        hora: '18:00', responsavel: 'Pr. Fagner Silva / Pra. FS', obs: 'Encontro semestral dos casais do campo' },
  { titulo: 'Aniversário Pr. Renato',          data_ini: '2026-07-15', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Renato' },
  { titulo: 'Convaadit 2026 — Início',         data_ini: '2026-07-28', tipo: 'convencao',   hora: '19:00', responsavel: 'Presbitério ADIT', obs: 'Abertura da Convenção do Campo ADIT' },

  // ── AGOSTO (5) ──────────────────────────────────────────────────────────────
  { titulo: 'Convaadit 2026 — Encerramento',   data_ini: '2026-08-01', tipo: 'convencao',   hora: '10:00', responsavel: 'Presbitério ADIT', obs: 'Encerramento da Convenção do Campo ADIT' },
  { titulo: 'Festividade 3ª ADIT',             data_ini: '2026-08-08', data_fim: '2026-08-09', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Cleiton', obs: 'Festividade de aniversário da 3ª Congregação' },
  { titulo: 'Rede de Mulheres',                data_ini: '2026-08-15', tipo: 'rede',        hora: '14:00', responsavel: 'Pra. Zélia', obs: 'Encontro trimestral da Rede de Mulheres ADIT' },
  { titulo: 'Congresso de Senhoras',           data_ini: '2026-08-22', data_fim: '2026-08-23', tipo: 'especial', hora: '19:00', responsavel: 'Pra. Zélia', obs: 'Congresso Anual de Senhoras do Campo ADIT' },
  { titulo: 'Reunião de Líderes',              data_ini: '2026-08-29', tipo: 'reuniao',     hora: '09:00', responsavel: 'Pr. Fagner Silva', obs: 'Reunião mensal de líderes de célula' },

  // ── SETEMBRO (4) ────────────────────────────────────────────────────────────
  { titulo: 'Aniversário Pr. Fabiano',         data_ini: '2026-09-05', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Fabiano' },
  { titulo: 'Festividade 7ª ADIT',             data_ini: '2026-09-12', data_fim: '2026-09-13', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Tiago', obs: 'Festividade de aniversário da 7ª Congregação' },
  { titulo: 'Início — Jejum de Daniel',        data_ini: '2026-09-19', tipo: 'especial',    hora: '06:00', responsavel: 'Pr. Fagner Silva', obs: '21 dias de jejum e oração — Dn 10' },
  { titulo: 'Santa Ceia',                      data_ini: '2026-09-27', tipo: 'culto',       hora: '18:00', responsavel: 'Pr. Fagner Silva' },

  // ── OUTUBRO (5) ─────────────────────────────────────────────────────────────
  { titulo: 'Encerramento — Jejum de Daniel',  data_ini: '2026-10-09', tipo: 'especial',    hora: '19:00', responsavel: 'Pr. Fagner Silva', obs: 'Culto de encerramento do Jejum de Daniel' },
  { titulo: 'Cibeci 2026',                     data_ini: '2026-10-09', data_fim: '2026-10-11', tipo: 'convencao', hora: '19:00', responsavel: 'Presbitério ADIT', obs: 'Congresso Internacional de Bispos e Evangelistas' },
  { titulo: 'Santa Ceia + Batismo',            data_ini: '2026-10-18', tipo: 'batismo',     hora: '18:00', responsavel: 'Pr. Fagner Silva', obs: 'Culto especial de Santa Ceia e Batismo nas águas' },
  { titulo: 'Aniversário — 10 Anos Campo ADIT', data_ini: '2026-10-24', data_fim: '2026-10-25', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Fagner Silva', obs: '10 anos do Campo ADIT — celebração especial' },
  { titulo: 'Ciber Brasília 2026',             data_ini: '2026-10-30', data_fim: '2026-10-31', tipo: 'especial',   hora: '19:00', responsavel: 'Presbitério ADIT', obs: 'Congresso de evangelização digital' },

  // ── NOVEMBRO (5) ────────────────────────────────────────────────────────────
  { titulo: 'Rede de Mulheres',                data_ini: '2026-11-07', tipo: 'rede',        hora: '14:00', responsavel: 'Pra. Zélia', obs: 'Encontro trimestral da Rede de Mulheres ADIT' },
  { titulo: 'Aniversário Pr. Fagner',          data_ini: '2026-11-10', tipo: 'aniversario', hora: '19:30', responsavel: 'Pr. Fagner Silva', obs: 'Aniversário do Pastor Titular' },
  { titulo: 'Aniversário Pra. Fátima',         data_ini: '2026-11-15', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Fátima' },
  { titulo: 'Homens Transformados 2026',       data_ini: '2026-11-21', tipo: 'especial',    hora: '08:00', responsavel: 'Pr. Fagner Silva', obs: 'Congresso Anual de Homens do Campo ADIT' },
  { titulo: 'Festividade 9ª ADIT',             data_ini: '2026-11-28', data_fim: '2026-11-29', tipo: 'festividade', hora: '19:00', responsavel: 'Pr. Dinaldo', obs: 'Festividade de aniversário da 9ª Congregação' },

  // ── DEZEMBRO (5) ────────────────────────────────────────────────────────────
  { titulo: 'Reunião Geral de Encerramento',   data_ini: '2026-12-05', tipo: 'reuniao',     hora: '09:00', responsavel: 'Pr. Fagner Silva', obs: 'Reunião geral de encerramento do ano ministerial' },
  { titulo: 'Rede de Casais — Natal',          data_ini: '2026-12-12', tipo: 'rede',        hora: '18:00', responsavel: 'Pr. Fagner Silva / Pra. FS', obs: 'Encontro de Natal dos casais do campo' },
  { titulo: 'Reunião de Diretoria',            data_ini: '2026-12-17', tipo: 'reuniao',     hora: '09:00', responsavel: 'Presbitério ADIT', obs: 'Prestação de contas e planejamento 2027' },
  { titulo: 'Santa Ceia — Culto de Natal',     data_ini: '2026-12-20', tipo: 'culto',       hora: '18:00', responsavel: 'Pr. Fagner Silva', obs: 'Culto especial de Natal com Santa Ceia' },
  { titulo: 'Aniversário Pra. Luciene',        data_ini: '2026-12-27', tipo: 'aniversario', hora: '19:30', responsavel: 'Pra. Luciene' },
]

export async function seedEventos(supabase: SupabaseClient): Promise<number> {
  const { error } = await supabase
    .from('eventos')
    .insert(EVENTOS_2026)

  if (error) throw error
  return EVENTOS_2026.length
}

export const TOTAL_SEED = EVENTOS_2026.length
