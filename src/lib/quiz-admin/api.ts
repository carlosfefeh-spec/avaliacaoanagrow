import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type Question = Database["public"]["Tables"]["quiz_questions"]["Row"];
export type QuestionOption = Database["public"]["Tables"]["quiz_options"]["Row"];

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type TimeLimitMode = "none" | "per_question" | "per_quiz";

export type FullQuestion = Question & { options: QuestionOption[] };

export const BUCKET = "quiz-media";

export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "quiz";
}

export async function isSuperAdmin(): Promise<boolean> {
  const { data } = await supabase.rpc("claim_super_admin");
  return data === true;
}

export async function listQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createQuiz(title = "Novo quiz"): Promise<Quiz> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      title,
      slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`,
      created_by: userData.user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuiz(id: string, patch: Partial<Quiz>): Promise<void> {
  const { error } = await supabase.from("quizzes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw error;
}

export async function loadQuiz(id: string): Promise<{ quiz: Quiz; questions: FullQuestion[] } | null> {
  const { data: quiz, error } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!quiz) return null;
  return { quiz, questions: await loadQuestions(id) };
}

export async function loadQuizBySlug(slug: string): Promise<{ quiz: Quiz; questions: FullQuestion[] } | null> {
  const { data: quiz, error } = await supabase.from("quizzes").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!quiz) return null;
  return { quiz, questions: await loadQuestions(quiz.id) };
}

async function loadQuestions(quizId: string): Promise<FullQuestion[]> {
  const { data: questions, error: qErr } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");
  if (qErr) throw qErr;
  const ids = (questions ?? []).map((q) => q.id);
  if (!ids.length) return [];
  const { data: options, error: oErr } = await supabase
    .from("quiz_options")
    .select("*")
    .in("question_id", ids)
    .order("position");
  if (oErr) throw oErr;
  return (questions ?? []).map((q) => ({
    ...q,
    options: (options ?? []).filter((o) => o.question_id === q.id),
  }));
}

export async function addQuestion(quizId: string, position: number, type: QuestionType = "multiple_choice") {
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({ quiz_id: quizId, position, prompt: "", type })
    .select("*")
    .single();
  if (error) throw error;
  const labels = type === "true_false" ? ["Verdadeiro", "Falso"] : ["", ""];
  if (type !== "short_answer") {
    const { error: oErr } = await supabase
      .from("quiz_options")
      .insert(labels.map((label, i) => ({ question_id: data.id, position: i, label, is_correct: i === 0 })));
    if (oErr) throw oErr;
  }
  return data.id;
}

export async function updateQuestion(id: string, patch: Partial<Question>) {
  const { error } = await supabase.from("quiz_questions").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderQuestions(ordered: { id: string; position: number }[]) {
  for (const item of ordered) {
    const { error } = await supabase.from("quiz_questions").update({ position: item.position }).eq("id", item.id);
    if (error) throw error;
  }
}

export async function addOption(questionId: string, position: number) {
  const { error } = await supabase.from("quiz_options").insert({ question_id: questionId, position, label: "" });
  if (error) throw error;
}

export async function updateOption(id: string, patch: Partial<QuestionOption>) {
  const { error } = await supabase.from("quiz_options").update(patch).eq("id", id);
  if (error) throw error;
}

export async function setCorrectOption(questionId: string, optionId: string) {
  const { error: clear } = await supabase.from("quiz_options").update({ is_correct: false }).eq("question_id", questionId);
  if (clear) throw clear;
  const { error } = await supabase.from("quiz_options").update({ is_correct: true }).eq("id", optionId);
  if (error) throw error;
}

export async function deleteOption(id: string) {
  const { error } = await supabase.from("quiz_options").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateQuiz(id: string): Promise<string> {
  const loaded = await loadQuiz(id);
  if (!loaded) throw new Error("Quiz não encontrado");
  const { quiz, questions } = loaded;
  const { data: userData } = await supabase.auth.getUser();
  const { data: copy, error } = await supabase
    .from("quizzes")
    .insert({
      title: `${quiz.title} (cópia)`,
      description: quiz.description,
      slug: `${slugify(quiz.title)}-${Math.random().toString(36).slice(2, 7)}`,
      passing_score: quiz.passing_score,
      time_limit_mode: quiz.time_limit_mode,
      time_limit_seconds: quiz.time_limit_seconds,
      max_attempts: quiz.max_attempts,
      randomize_questions: quiz.randomize_questions,
      published: false,
      created_by: userData.user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  for (const q of questions) {
    const { data: nq, error: qErr } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: copy.id,
        position: q.position,
        prompt: q.prompt,
        type: q.type,
        image_url: q.image_url,
        video_url: q.video_url,
        explanation: q.explanation,
        expected_answer: q.expected_answer,
      })
      .select("id")
      .single();
    if (qErr) throw qErr;
    if (q.options.length) {
      const { error: oErr } = await supabase.from("quiz_options").insert(
        q.options.map((o) => ({ question_id: nq.id, position: o.position, label: o.label, is_correct: o.is_correct })),
      );
      if (oErr) throw oErr;
    }
  }
  return copy.id;
}

/* ---------- Mídia ---------- */

export async function uploadMedia(file: File, quizId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${quizId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

/** Resolve um valor salvo (URL externa ou caminho no armazenamento) para uma URL exibível. */
export async function resolveMedia(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60 * 24 * 7);
  if (error) return null;
  return data.signedUrl;
}

export function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}
