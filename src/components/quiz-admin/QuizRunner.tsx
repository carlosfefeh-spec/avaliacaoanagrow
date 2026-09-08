import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { embedUrl, resolveMedia, type FullQuestion, type Quiz } from "@/lib/quiz-admin/api";
import { gradeQuiz, type GradeResult } from "@/lib/quiz-admin/grade.functions";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function MediaBlock({ image, video }: { image: string | null; video: string | null }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void resolveMedia(image).then((v) => alive && setImageSrc(v));
    void resolveMedia(video).then((v) => alive && setVideoSrc(v));
    return () => {
      alive = false;
    };
  }, [image, video]);

  const embed = video ? embedUrl(video) : null;

  return (
    <div className="space-y-3">
      {imageSrc && <img src={imageSrc} alt="" className="w-full rounded-lg border object-cover" loading="lazy" />}
      {embed ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
          <iframe src={embed} title="Vídeo da pergunta" allowFullScreen className="h-full w-full" />
        </div>
      ) : (
        videoSrc && <video src={videoSrc} controls playsInline className="w-full rounded-lg border" />
      )}
    </div>
  );
}

export function QuizRunner({
  quiz,
  questions,
  preview = false,
}: {
  quiz: Quiz;
  questions: FullQuestion[];
  preview?: boolean;
}) {
  const ordered = useMemo(
    () => (quiz.randomize_questions ? shuffle(questions) : questions),
    [questions, quiz.randomize_questions],
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const submitGrade = useServerFn(gradeQuiz);

  const question = ordered[index];
  const perQuestion = quiz.time_limit_mode === "per_question" ? (quiz.time_limit_seconds ?? 0) : 0;
  const perQuiz = quiz.time_limit_mode === "per_quiz" ? (quiz.time_limit_seconds ?? 0) : 0;

  const submit = useCallback(
    async (finalAnswers: Record<string, string>) => {
      setSending(true);
      try {
        const res = await submitGrade({
          data: { quizId: quiz.id, answers: finalAnswers, participantName: name || undefined, preview },
        });
        setResult(res);
      } finally {
        setSending(false);
      }
    },
    [name, preview, quiz.id, submitGrade],
  );

  const advance = useCallback(
    (value?: string) => {
      const next = value !== undefined && question ? { ...answers, [question.id]: value } : answers;
      if (value !== undefined) setAnswers(next);
      if (index + 1 >= ordered.length) void submit(next);
      else setIndex(index + 1);
    },
    [answers, index, ordered.length, question, submit],
  );

  /* Cronômetros */
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (result) return;
    if (perQuiz) {
      setLeft((prev) => (prev === null ? perQuiz : prev));
    } else if (perQuestion) {
      setLeft(perQuestion);
    } else {
      setLeft(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, perQuestion, perQuiz, result]);

  useEffect(() => {
    if (left === null || result) return;
    if (left <= 0) {
      if (perQuiz) void submit(answers);
      else advance(answers[question?.id ?? ""] ?? "");
      return;
    }
    const t = setTimeout(() => setLeft((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [left, result, perQuiz, submit, answers, advance, question]);

  if (!ordered.length) {
    return <p className="text-muted-foreground text-sm">Este quiz ainda não tem perguntas.</p>;
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border p-6 text-center">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">Resultado</p>
          <p className="mt-2 text-4xl font-semibold">{result.score}%</p>
          <p className="mt-1 text-sm">
            {result.correctCount} de {result.total} corretas —{" "}
            <span className={result.passed ? "text-primary font-medium" : "text-destructive font-medium"}>
              {result.passed ? "Aprovado" : "Não aprovado"}
            </span>
          </p>
        </div>
        <div className="space-y-3">
          {ordered.map((q, i) => {
            const detail = result.details.find((d) => d.questionId === q.id);
            return (
              <div key={q.id} className="rounded-lg border p-4">
                <p className="text-sm font-medium">
                  {i + 1}. {q.prompt}
                </p>
                <p className={`mt-1 text-sm ${detail?.correct ? "text-primary" : "text-destructive"}`}>
                  {detail?.correct ? "Você acertou" : `Resposta correta: ${detail?.correctAnswer ?? "—"}`}
                </p>
                {detail?.explanation && <p className="text-muted-foreground mt-2 text-sm">{detail.explanation}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!question) return null;

  const selected = answers[question.id] ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs tracking-widest uppercase">
        <span className="text-muted-foreground">
          Pergunta {index + 1} de {ordered.length}
        </span>
        {left !== null && <span className="text-primary font-medium">{left}s</span>}
      </div>

      {index === 0 && !preview && (
        <Input placeholder="Seu nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
      )}

      <h2 className="text-xl leading-snug font-medium">{question.prompt || "Pergunta sem enunciado"}</h2>

      <MediaBlock image={question.image_url} video={question.video_url} />

      {question.type === "short_answer" ? (
        <Input
          placeholder="Sua resposta"
          value={selected}
          maxLength={500}
          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
        />
      ) : (
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setAnswers({ ...answers, [question.id]: option.id })}
              className={`w-full rounded-lg border p-4 text-left text-sm transition-colors ${
                selected === option.id ? "border-primary bg-primary/5" : "hover:border-primary/40"
              }`}
            >
              {option.label || "—"}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {index > 0 && (
          <Button variant="outline" onClick={() => setIndex(index - 1)}>
            Voltar
          </Button>
        )}
        <Button className="flex-1" disabled={!selected || sending} onClick={() => advance(selected)}>
          {index + 1 >= ordered.length ? (sending ? "Enviando..." : "Finalizar") : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
