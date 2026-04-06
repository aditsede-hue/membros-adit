export type DocTipo =
  | "batismo"
  | "consagracao"
  | "apresentacao"
  | "curso_obreiros"
  | "mudanca"
  | "recomendacao"
  | "oficio"
  | "declaracao";

export type DocEmitido = {
  id: string;
  tipo: DocTipo;
  nome_assunto: string;  // nome do membro ou assunto do ofício/declaração
  data_emissao: string;  // YYYY-MM-DD
  secretario: string;
  dados: Record<string, string>;
  criado_em: string;     // ISO timestamp
};

export type CampoTipo = "text" | "date" | "select" | "select_or_text" | "textarea" | "member_search" | "fixed";

export type CampoConfig = {
  key: string;
  label: string;
  tipo: CampoTipo;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
  fixedValue?: string;   // for tipo "fixed"
};

export type DocConfig = {
  id: DocTipo;
  titulo: string;
  subtitulo: string;
  icon: string;
  cor: string;
  bg: string;
  campos: CampoConfig[];
};
