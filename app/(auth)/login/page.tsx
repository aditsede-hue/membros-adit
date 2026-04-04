"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      className="min-h-full flex items-center justify-center p-4"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--ink)" }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="15" y="4" width="6" height="28" rx="2.5" fill="#c9a84c" />
              <rect x="6" y="13" width="24" height="6" rx="2.5" fill="#c9a84c" />
            </svg>
          </div>
          <h1
            className="text-2xl font-semibold text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Campo ADIT
          </h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Assembleia de Deus do Itapoã
          </p>
        </div>

        {/* Card */}
        <div className="card p-7">
          <h2
            className="text-base font-semibold text-[var(--ink)] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Entrar no sistema
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              icon={
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 3.5A1.5 1.5 0 012.5 2h10A1.5 1.5 0 0114 3.5v8a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 011 11.5v-8zM2 4.5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              icon={
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="2" y="7" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              }
            />

            {error && (
              <p className="text-sm text-[var(--red)] bg-[#fde8e6] px-3 py-2 rounded-[var(--radius)]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
            >
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--ink-muted)] mt-6">
          Igreja CRM • Campo ADIT © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
