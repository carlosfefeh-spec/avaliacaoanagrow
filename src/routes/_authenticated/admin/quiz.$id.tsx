import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { QuizRunner } from "@/components/quiz-admin/QuizRunner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  addOption,
  addQuestion,
  deleteOption,
  deleteQuestion,
  loadQuiz,
  reorderQuestions,
  setCorrectOption,
  updateOption,
  updateQuestion,
  updateQuiz,
  uploadMedia,
  type FullQuestion,
  type QuestionType,
  type Quiz,
  type TimeLimitMode,
} from "@/lib/quiz-admin/api";

export const Route = createFileRoute("/_authenticated/admin/quiz/$id")({
  head: () => ({
    meta: [
      { title: "Editar quiz — Anagrow" },
      { name: "description", content: "Editor de perguntas, mídias e configurações do quiz." },
      { property: "og:title", content: "Editar quiz — Anagrow" },
      { property: "og:description", content: "Editor de perguntas, mídias e configurações do quiz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuizEditor,
});

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Múltipla escolha",
  true_false: "Verdadeiro / Falso",
  short_answer: "Resposta curta",
};

function QuizEditor() {
  const { id } = useParams({ from: "/_authenticated/admin/quiz/$id" });
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<FullQuestion[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await loadQuiz(id);
    if (!data) return;
    setQuiz(data.quiz);
    setQuestions(data.questions);
  }, [id]);

  useEffect(() => {
    void refresh().catch((e: Error) => setError(e.message));
  }, [refresh]);

  const patchQuiz = async (patch: Partial<Quiz>) => {
    if (!quiz) return;
    setQuiz({ ...quiz, ...patch });
    setSaving("Salvando...");
    try {
      await updateQuiz(quiz.id, patch);
      setSaving("Salvo");
    } catch (e) {
      setError((e as Error).message);
      setSaving(null);
    }
  };

  const patchQuestion = async (questionId: string, patch: Partial<FullQuestion>) => {
    setQuestions((qs) => qs.map((q) => (q.id === questionId ? { ...q, ...patch } : q)));
    setSaving("Salvando...");
    try {
      await updateQuestion(questionId, patch);
      setSaving("Salvo");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!quiz) return <p className="p-8 text-sm">{error ?? "Carregando..."}</p>;

  if (preview) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">Pré-visualização</p>
          <Button size="sm" variant="outline" onClick={() => setPreview(false)}>
            Voltar ao editor
          </Button>
        </div>
        <h1 className="font-display text-2xl">{quiz.title}</h1>
        {quiz.description && <p className="text-muted-foreground mt-2 text-sm">{quiz.description}</p>}
        <div className="mt-8">
          <QuizRunner quiz={quiz} questions={questions} preview />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin" className="text-muted-foreground hover:text-primary text-sm">
          ← Todos os quizzes
        </Link>
        <div className="flex items-center gap-3">
          {saving && <span className="text-muted-foreground text-xs">{saving}</span>}
          <Button size="sm" variant="outline" onClick={() => setPreview(true)}>
            Visualizar quiz
          </Button>
          <Button size="sm" onClick={() => patchQuiz({ published: !quiz.published })}>
            {quiz.published ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

      {/* Configurações */}
      <section className="mt-8 space-y-4 rounded-xl border p-6">
        <h2 className="font-display text-lg">Configurações</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={quiz.title} onChange={(e) => patchQuiz({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Descrição</Label>
          <Textarea id="desc" value={quiz.description ?? ""} onChange={(e) => patchQuiz({ description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">Link público</Label>
            <Input id="slug" value={quiz.slug} onChange={(e) => patchQuiz({ slug: e.target.value })} />
            <p className="text-muted-foreground text-xs">/q/{quiz.slug}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Nota mínima para aprovação (%)</Label>
            <Input
              id="score"
              type="number"
              min={0}
              max={100}
              value={quiz.passing_score}
              onChange={(e) => patchQuiz({ passing_score: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attempts">Tentativas permitidas</Label>
            <Input
              id="attempts"
              type="number"
              min={1}
              value={quiz.max_attempts}
              onChange={(e) => patchQuiz({ max_attempts: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Tempo limite</Label>
            <select
              id="limit"
              className="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm"
              value={quiz.time_limit_mode}
              onChange={(e) => patchQuiz({ time_limit_mode: e.target.value as TimeLimitMode })}
            >
              <option value="none">Sem limite</option>
              <option value="per_question">Por questão</option>
              <option value="per_quiz">Para o quiz inteiro</option>
            </select>
          </div>
          {quiz.time_limit_mode !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="seconds">Segundos</Label>
              <Input
                id="seconds"
                type="number"
                min={5}
                value={quiz.time_limit_seconds ?? 60}
                onChange={(e) => patchQuiz({ time_limit_seconds: Number(e.target.value) })}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="random"
            checked={quiz.randomize_questions}
            onCheckedChange={(v) => patchQuiz({ randomize_questions: v })}
          />
          <Label htmlFor="random">Ordem aleatória das perguntas</Label>
        </div>
      </section>

      {/* Perguntas */}
      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Perguntas ({questions.length})</h2>
          <Button
            size="sm"
            onClick={async () => {
              await addQuestion(quiz.id, questions.length);
              await refresh();
            }}
          >
            Adicionar pergunta
          </Button>
        </div>

        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            quizId={quiz.id}
            index={index}
            total={questions.length}
            question={question}
            onPatch={patchQuestion}
            onRefresh={refresh}
            onMove={async (dir) => {
              const target = index + dir;
              if (target < 0 || target >= questions.length) return;
              const next = [...questions];
              const [moved] = next.splice(index, 1);
              next.splice(target, 0, moved!);
              setQuestions(next);
              await reorderQuestions(next.map((q, i) => ({ id: q.id, position: i })));
              await refresh();
            }}
          />
        ))}
      </section>
    </main>
  );
}

function QuestionCard({
  quizId,
  question,
  index,
  total,
  onPatch,
  onRefresh,
  onMove,
}: {
  quizId: string;
  question: FullQuestion;
  index: number;
  total: number;
  onPatch: (id: string, patch: Partial<FullQuestion>) => Promise<void>;
  onRefresh: () => Promise<void>;
  onMove: (dir: number) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, field: "image_url" | "video_url") => {
    setUploading(true);
    try {
      const path = await uploadMedia(file, quizId);
      await onPatch(question.id, { [field]: path } as Partial<FullQuestion>);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs tracking-widest uppercase">Pergunta {index + 1}</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)}>
            ↑
          </Button>
          <Button size="sm" variant="ghost" disabled={index === total - 1} onClick={() => onMove(1)}>
            ↓
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={async () => {
              if (!confirm("Excluir esta pergunta?")) return;
              await deleteQuestion(question.id);
              await onRefresh();
            }}
          >
            Excluir
          </Button>
        </div>
      </div>

      <Textarea
        placeholder="Enunciado da pergunta"
        value={question.prompt}
        onChange={(e) => onPatch(question.id, { prompt: e.target.value })}
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TYPE_LABEL) as QuestionType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onPatch(question.id, { type })}
            className={`rounded-full border px-3 py-1 text-xs ${
              question.type === type ? "border-primary bg-primary/10" : "text-muted-foreground"
            }`}
          >
            {TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Mídia */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Imagem</Label>
          <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file, "image_url");
          }} />
          {question.image_url && (
            <button
              type="button"
              className="text-destructive text-xs underline"
              onClick={() => onPatch(question.id, { image_url: null })}
            >
              Remover imagem
            </button>
          )}
        </div>
        <div className="space-y-2">
          <Label>Vídeo (link YouTube/Vimeo ou arquivo)</Label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={question.video_url && /^https?:/i.test(question.video_url) ? question.video_url : ""}
            onChange={(e) => onPatch(question.id, { video_url: e.target.value || null })}
          />
          <Input type="file" accept="video/*" disabled={uploading} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file, "video_url");
          }} />
          {question.video_url && !/^https?:/i.test(question.video_url) && (
            <button
              type="button"
              className="text-destructive text-xs underline"
              onClick={() => onPatch(question.id, { video_url: null })}
            >
              Remover vídeo enviado
            </button>
          )}
        </div>
      </div>

      {/* Alternativas */}
      {question.type === "short_answer" ? (
        <div className="space-y-2">
          <Label>Resposta esperada</Label>
          <Input
            value={question.expected_answer ?? ""}
            onChange={(e) => onPatch(question.id, { expected_answer: e.target.value })}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Alternativas (mínimo 2, máximo 5) — marque a correta</Label>
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={option.is_correct}
                onChange={async () => {
                  await setCorrectOption(question.id, option.id);
                  await onRefresh();
                }}
              />
              <Input
                value={option.label}
                placeholder="Texto da alternativa"
                onChange={async (e) => {
                  await updateOption(option.id, { label: e.target.value });
                  await onRefresh();
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                disabled={question.options.length <= 2}
                onClick={async () => {
                  await deleteOption(option.id);
                  await onRefresh();
                }}
              >
                ✕
              </Button>
            </div>
          ))}
          {question.options.length < 5 && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await addOption(question.id, question.options.length);
                await onRefresh();
              }}
            >
              Adicionar alternativa
            </Button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Explicação exibida após a resposta</Label>
        <Textarea
          value={question.explanation ?? ""}
          onChange={(e) => onPatch(question.id, { explanation: e.target.value })}
        />
      </div>
    </div>
  );
}
