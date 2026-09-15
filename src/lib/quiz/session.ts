import { supabase } from "@/integrations/supabase/client";

import { quizId } from "./attribution";

/** Identificador do quiz de diagnóstico capilar (fluxo principal). */
const QUIZ_KEY = "diagnostico-capilar";
const WORKSPACE_KEY = "anagrow";
const STORAGE_KEY = "anagrow_quiz_session_id";

let sessionId: string | null = null;
let starting: Promise<string | null> | null = null;

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(id: string) {
  sessionId = id;
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* storage indisponível: seguimos apenas em memória */
  }
}

export function currentQuizSessionId(): string | null {
  return sessionId ?? readStored();
}

/** Cria a sessão do funil quando a pessoa sai da intro para a primeira pergunta. */
export function startQuizSession(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (starting) return starting;
  starting = (async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .insert({
          quiz_id: QUIZ_KEY,
          workspace_id: WORKSPACE_KEY,
          client_id: quizId(),
          status: "in_progress",
          started_at: new Date().toISOString(),
          current_question_position: 0,
        })
        .select("id")
        .single();
      if (error || !data) return null;
      store(data.id);
      return data.id;
    } catch {
      return null;
    }
  })();
  return starting;
}

/** Grava a resposta de uma pergunta e avança a posição da sessão. */
export function recordQuizAnswer(input: {
  questionId: string;
  position: number;
  optionIds?: string[];
  textValue?: string | null;
}): void {
  if (typeof window === "undefined") return;
  void (async () => {
    try {
      const id = currentQuizSessionId() ?? (await startQuizSession());
      if (!id) return;
      await supabase.from("quiz_answers").insert({
        quiz_session_id: id,
        question_id: input.questionId,
        question_position: input.position,
        option_ids: input.optionIds ?? [],
        text_value: input.textValue ?? null,
        created_at: new Date().toISOString(),
      });
      await supabase
        .from("quiz_sessions")
        .update({ current_question_position: input.position })
        .eq("id", id);
    } catch {
      /* instrumentação silenciosa: nunca interrompe o quiz */
    }
  })();
}

/** Marca a sessão como concluída ao chegar no resultado. */
export function completeQuizSession(): void {
  if (typeof window === "undefined") return;
  const id = currentQuizSessionId();
  if (!id) return;
  void (async () => {
    try {
      await supabase
        .from("quiz_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      /* instrumentação silenciosa */
    }
  })();
}
