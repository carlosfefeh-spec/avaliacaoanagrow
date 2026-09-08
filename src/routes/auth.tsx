import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Acesso administrativo — Anagrow";
const DESCRIPTION = "Entre para gerenciar os quizzes e o diagnóstico capilar da Anagrow.";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fn =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email: email.trim(), password })
          : supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { emailRedirectTo: window.location.origin + "/admin" },
            });
      const { error: authError } = await fn;
      if (authError) {
        setError(authError.message);
        return;
      }
      await supabase.rpc("claim_super_admin");
      const target = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/admin";
      await navigate({ to: target, replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[420px] flex-col justify-center px-6">
      <h1 className="font-display text-2xl">Acesso administrativo</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Área restrita para gerenciar os quizzes. {mode === "signup" ? "Crie sua senha de acesso." : ""}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar acesso"}
        </Button>
      </form>

      <button
        type="button"
        className="text-muted-foreground hover:text-primary mt-6 text-sm underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Primeiro acesso? Criar senha" : "Já tenho acesso, entrar"}
      </button>
    </main>
  );
}
