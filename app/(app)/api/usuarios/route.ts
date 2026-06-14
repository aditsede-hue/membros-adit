import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nome, email, senha, role } = await req.json();

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ erro: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    // Cliente admin — usa a service role key, roda só no servidor
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Cria o usuário no Auth sem afetar a sessão atual
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ erro: authError.message }, { status: 400 });
    }

    const novoId = authData.user?.id;
    if (!novoId) {
      return NextResponse.json({ erro: "Erro ao obter ID do usuário." }, { status: 500 });
    }

    // Cria o perfil vinculado
    const { error: perfilError } = await supabaseAdmin.from("perfis").insert({
      id: novoId,
      nome: nome.trim(),
      email: email.trim(),
      role,
      ativo: true,
    });

    if (perfilError) {
      return NextResponse.json({ erro: perfilError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ erro: "Erro interno do servidor." }, { status: 500 });
  }
}