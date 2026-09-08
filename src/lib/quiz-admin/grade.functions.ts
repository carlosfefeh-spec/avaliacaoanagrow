import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string(), z.string().max(500)),
  participantName: z.string().trim().max(120).optional(),
  preview: z.boolean().optional(),
});

export type GradeResult = {
  score: number;
  passed: boolean;
  total: number;
  correctCount: number;
  details: { questionId: string; correct: boolean; explanation: string | null; correctAnswer: string | null }[];
};

export const gradeQuiz = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<GradeResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: quiz } = await supabaseAdmin
      .from("quizzes")
      .select("id, passing_score, published")
      .eq("id", data.quizId)
      .maybeSingle();
    if (!quiz) throw new Error("Quiz não encontrado");

    const { data: questions } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, type, explanation, expected_answer")
      .eq("quiz_id", quiz.id)
      .order("position");
    const list = questions ?? [];
    const { data: options } = await supabaseAdmin
      .from("quiz_options")
      .select("id, question_id, label, is_correct")
      .in("question_id", list.length ? list.map((q) => q.id) : ["00000000-0000-0000-0000-000000000000"]);

    const norm = (v: string) =>
      v
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const details = list.map((q) => {
      const given = data.answers[q.id] ?? "";
      if (q.type === "short_answer") {
        const expected = q.expected_answer ?? "";
        return {
          questionId: q.id,
          correct: expected.length > 0 && norm(expected) === norm(given),
          explanation: q.explanation,
          correctAnswer: expected || null,
        };
      }
      const correctOption = (options ?? []).find((o) => o.question_id === q.id && o.is_correct);
      return {
        questionId: q.id,
        correct: !!correctOption && correctOption.id === given,
        explanation: q.explanation,
        correctAnswer: correctOption?.label ?? null,
      };
    });

    const total = details.length;
    const correctCount = details.filter((d) => d.correct).length;
    const score = total ? Math.round((correctCount / total) * 100) : 0;
    const passed = score >= quiz.passing_score;

    if (!data.preview && quiz.published) {
      await supabaseAdmin.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        participant_name: data.participantName ?? null,
        answers: data.answers,
        score,
        passed,
      });
    }

    return { score, passed, total, correctCount, details };
  });
