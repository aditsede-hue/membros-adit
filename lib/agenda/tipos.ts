export type TipoEvento =
  | 'culto'
  | 'batismo'
  | 'reuniao'
  | 'convencao'
  | 'festividade'
  | 'rede'
  | 'aniversario'
  | 'especial'
  | 'outro'

export interface TipoConfig {
  label: string
  cor:   string
  bg:    string   // versão clara para pills/badges
  icon:  string
}

export const TIPOS: Record<TipoEvento, TipoConfig> = {
  culto:       { label: 'Culto',        cor: '#a87e2e', bg: '#fdf3d7', icon: '⛪' },
  batismo:     { label: 'Batismo',      cor: '#1e5fa8', bg: '#dbeafe', icon: '💧' },
  reuniao:     { label: 'Reunião',      cor: '#2d7a5f', bg: '#d4ede5', icon: '🤝' },
  convencao:   { label: 'Convenção',    cor: '#5b21b6', bg: '#ede9fe', icon: '🏛️' },
  festividade: { label: 'Festividade',  cor: '#c2410c', bg: '#ffedd5', icon: '🎉' },
  rede:        { label: 'Rede',         cor: '#7c3d8a', bg: '#fae8ff', icon: '🌐' },
  aniversario: { label: 'Aniversário',  cor: '#713f12', bg: '#fef9c3', icon: '🎂' },
  especial:    { label: 'Especial',     cor: '#166534', bg: '#dcfce7', icon: '✨' },
  outro:       { label: 'Outro',        cor: '#4b5563', bg: '#f3f4f6', icon: '📅' },
}

export function getTipo(tipo: string): TipoConfig {
  return TIPOS[tipo as TipoEvento] ?? TIPOS.outro
}

export const TIPO_OPTIONS = Object.entries(TIPOS).map(([value, cfg]) => ({
  value,
  label: `${cfg.icon} ${cfg.label}`,
}))
