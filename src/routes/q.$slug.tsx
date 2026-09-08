import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { QuizRunner } from "@/components/quiz-admin/QuizRunner";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { loadQuizBySlug, type FullQuestion, type Quiz } from "@/lib/quiz-admin/api";

export const Route = createFileRoute("/q/$slug")({
  head: () => ({
    meta: [
      { title: "Quiz Anagrow" },
      { name: "description", content: "Responda ao quiz da Anagrow e receba seu resultado na hora." },
      { property: "og:title", content: "Quiz Anagrow" },
      { property: "og:description", content: "Responda ao quiz da Anagrow e receba seu resultado na hora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicQuizPage,
});

function PublicQuizPage() {
  const { slug } = useParams({ from: "/q/$slug" });
  const [state, setState] = useState<{ quiz: Quiz; questions: FullQuestion[] } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    void loadQuizBySlug(slug)
      .then((data) => {
        if (!data || !data.quiz.published) {
          setStatus("missing");
          return;
        }
        setState(data);
        setStatus("ready");
      })
      .catch(() => setStatus("missing"));
  }, [slug]);

  if (status === "loading") {
    return (
      <main className="min-h-[100svh]">
        <QuizHeader />
        <p className="p-8 text-center text-sm">Carregando quiz...</p>
      </main>
    );
  }

  if (status !== "ready" || !state) {
    return (
      <main className="min-h-[100svh]">
        <QuizHeader />
        <div className="mx-auto max-w-[560px] px-6 py-16 text-center sm:px-10">
          <h1 className="font-display text-2xl">Quiz indisponível</h1>
          <p className="text-muted-foreground mt-2 text-sm">Este quiz não existe ou ainda não foi publicado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh]">
      <QuizHeader />
      <div className="mx-auto max-w-[560px] px-6 py-10 sm:px-10">
        <h1 className="font-display text-[1.75rem] leading-[1.4] font-normal">{state.quiz.title}</h1>
        {state.quiz.description && <p className="text-muted-foreground mt-2 text-sm">{state.quiz.description}</p>}
        <div className="mt-8">
          <QuizRunner quiz={state.quiz} questions={state.questions} />
        </div>
      </div>
    </main>
  );
}
