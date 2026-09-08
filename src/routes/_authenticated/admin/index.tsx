import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createQuiz, deleteQuiz, duplicateQuiz, isSuperAdmin, listQuizzes, type Quiz } from "@/lib/quiz-admin/api";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Gerenciar quizzes — Anagrow" },
      { name: "description", content: "Painel para criar, editar e publicar quizzes da Anagrow." },
      { property: "og:title", content: "Gerenciar quizzes — Anagrow" },
      { property: "og:description", content: "Painel para criar, editar e publicar quizzes da Anagrow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    listQuizzes()
      .then(setQuizzes)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    void isSuperAdmin().then((ok) => {
      setAllowed(ok);
      if (ok) refresh();
    });
  }, []);

  if (allowed === null) return <p className="p-8 text-sm">Carregando...</p>;

  if (!allowed) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <h1 className="font-display text-2xl">Sem permissão</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Esta área é restrita ao administrador da Anagrow. Entre com a conta autorizada.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            await navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
          }}
        >
          Trocar de conta
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Quizzes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Crie, edite, duplique e publique seus quizzes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/diagnostico">Editar diagnóstico</Link>
          </Button>
          <Button
            onClick={async () => {
              const quiz = await createQuiz();
              await navigate({ to: "/admin/quiz/$id", params: { id: quiz.id } });
            }}
          >
            Criar novo quiz
          </Button>
        </div>
      </header>

      {error && <p className="text-destructive mt-6 text-sm">{error}</p>}

      <div className="mt-8 space-y-3">
        {quizzes.length === 0 && <p className="text-muted-foreground text-sm">Nenhum quiz criado ainda.</p>}
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div>
              <p className="font-medium">{quiz.title}</p>
              <p className="text-muted-foreground text-xs">
                {quiz.published ? "Publicado" : "Rascunho"} · /q/{quiz.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/quiz/$id" params={{ id: quiz.id }}>
                  Editar
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await duplicateQuiz(quiz.id);
                  refresh();
                }}
              >
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={async () => {
                  if (!confirm(`Excluir "${quiz.title}"? Essa ação não pode ser desfeita.`)) return;
                  await deleteQuiz(quiz.id);
                  refresh();
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
