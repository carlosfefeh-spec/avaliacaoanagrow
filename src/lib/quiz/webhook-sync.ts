/** Telemetria extra: espelha os eventos do funil em um webhook externo (fire-and-forget). */
const WEBHOOK_URL = "https://n8n.srv1083227.hstgr.cloud/webhook/quiz-funil-sync";
const STORAGE_KEY = "anagrow_quiz_webhook_session_id";

let webhookSessionId: string | null = null;
let starting: Promise<string | null> | null = null;

function read(): string | null {
  if (webhookSessionId) return webhookSessionId;
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(id: string) {
  webhookSessionId = id;
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* storage indisponível: seguimos em memória */
  }
}

function post(body: Record<string, unknown>): Promise<Response | null> {
  if (typeof fetch === "undefined") return Promise.resolve(null);
  return fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null);
}

/** Abre a sessão no webhook e guarda o session_id devolvido. */
export function startWebhookSession(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const existing = read();
  if (existing) return Promise.resolve(existing);
  if (starting) return starting;
  starting = (async () => {
    try {
      const res = await post({ event: "start" });
      if (!res || !res.ok) return null;
      const json = (await res.json()) as { session_id?: string };
      const id = json?.session_id ?? null;
      if (id) store(id);
      return id;
    } catch {
      return null;
    } finally {
      starting = null;
    }
  })();
  return starting;
}

/** Envia uma resposta ao webhook externo. Nunca lança. */
export function sendWebhookAnswer(input: {
  position: number;
  questionTitle: string;
  questionType: string;
  answerLabels?: string[];
  answerText?: string | null;
}): void {
  if (typeof window === "undefined") return;
  void (async () => {
    try {
      const sessionId = read() ?? (await startWebhookSession());
      if (!sessionId) return;
      await post({
        event: "answer",
        session_id: sessionId,
        position: input.position,
        question_title: input.questionTitle,
        question_type: input.questionType,
        answer_labels: input.answerLabels ?? [],
        answer_text: input.answerText ?? null,
      });
    } catch {
      /* telemetria silenciosa */
    }
  })();
}

/** Marca a conclusão no webhook externo. */
export function completeWebhookSession(): void {
  if (typeof window === "undefined") return;
  void (async () => {
    try {
      const sessionId = read();
      if (!sessionId) return;
      await post({ event: "complete", session_id: sessionId });
    } catch {
      /* telemetria silenciosa */
    }
  })();
}
