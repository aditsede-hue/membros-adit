// Sistema de permissões por perfil (role).
// Três perfis: admin (tudo), pastor (pastoral/estratégico), secretario (operacional).

export type Role = "admin" | "pastor" | "secretario";

// Rótulo amigável de cada role (usado na sidebar e na tela de usuários)
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  pastor: "Pastor",
  secretario: "Secretário",
};

// Quais rotas cada role pode acessar.
// A chave é o href do menu; o valor é a lista de roles com permissão.
export const PERMISSOES_ROTA: Record<string, Role[]> = {
  "/dashboard":     ["admin", "pastor", "secretario"],
  "/membros":       ["admin", "pastor", "secretario"],
  "/visitantes":    ["admin", "pastor", "secretario"],
  "/agenda":        ["admin", "pastor", "secretario"],
  "/escalas":       ["admin", "pastor", "secretario"],
  "/tarefas":       ["admin", "pastor", "secretario"],
  "/relatorios":    ["admin", "pastor", "secretario"],
  "/documentos":    ["admin", "secretario"],
  "/comunicados":   ["admin", "pastor", "secretario"],
  "/usuarios":      ["admin"],
  "/configuracoes": ["admin"],
};

// Verifica se um role pode acessar uma rota.
export function podeAcessar(role: Role | null, href: string): boolean {
  if (!role) return false;
  const permitidos = PERMISSOES_ROTA[href];
  if (!permitidos) return true; // rota sem regra explícita: liberada para logados
  return permitidos.includes(role);
}
