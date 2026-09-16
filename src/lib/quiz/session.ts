import { quizId } from "./attribution";
import { completeSessionFn, recordAnswerFn, startSessionFn } from "./tracking.functions";

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
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : null;
      if (!id) return null;
      const result = await startSessionFn({
        data: { id, quizId: QUIZ_KEY, workspaceId: WORKSPACE_KEY, clientId: quizId() },
      });
      if (!result?.ok) return null;
      store(id);
      return id;
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
      await recordAnswerFn({
        data: {
          sessionId: id,
          questionId: input.questionId,
          position: input.position,
          optionIds: input.optionIds ?? [],
          textValue: input.textValue ?? null,
        },
      });
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
      await supabase.rpc("quiz_session_complete", { p_id: id });
    } catch {
      /* instrumentação silenciosa */
    }
  })();
}
