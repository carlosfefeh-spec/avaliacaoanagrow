import { activeVariants } from "./experiments";
import { recordFunnelEvents, type FunnelEventInput } from "./funnel.functions";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const UTM_STORAGE = "anagrow_quiz_utm";
const QUIZ_ID_KEY = "anagrow_quiz_id";

/** ID persistente da usuária — usado para casar quiz -> pedido na loja. */
export function quizId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(QUIZ_ID_KEY);
  if (!id) {
    const rand =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    id = `qz_${rand}`;
    localStorage.setItem(QUIZ_ID_KEY, id);
  }
  return id;
}

export function captureUtms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const stored = safeParse(localStorage.getItem(UTM_STORAGE));
  const params = new URLSearchParams(window.location.search);
  const fresh: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) fresh[key] = value;
  }
  const merged = { ...stored, ...fresh };
  if (Object.keys(merged).length) {
    localStorage.setItem(UTM_STORAGE, JSON.stringify(merged));
  }
  return merged;
}

function safeParse(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Payload[];
  }
}

const sent = new Set<string>();

export function track(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const data = {
    event,
    quiz_id: quizId(),
    ...captureUtms(),
    ...activeVariants(),
    ...payload,
    ts: Date.now(),
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  persist(event, data);
  if (import.meta.env.DEV) console.debug("[analytics]", data);
}

/** Dispara uma única vez por sessão (marcos de progresso). */
export function trackOnce(event: string, payload: Payload = {}) {
  if (sent.has(event)) return;
  sent.add(event);
  track(event, payload);
}

export function trackProgress(progress: number) {
  if (progress >= 25) trackOnce("quiz_25_percent", { progress });
  if (progress >= 50) trackOnce("quiz_50_percent", { progress });
  if (progress >= 75) trackOnce("quiz_75_percent", { progress });
}

/* ------------------------------------------------------------------ */
/*  Funil: tempo por etapa, etapa de abandono e conversão por opção     */
/* ------------------------------------------------------------------ */

type StepMeta = {
  stepId: string;
  stepIndex: number;
  stepKind: string;
  totalSteps: number;
  progress: number;
  phase?: string | undefined;
};

let currentStep: (StepMeta & { startedAt: number }) | null = null;
let deepestIndex = -1;
let stepsSeen = 0;
let answeredCount = 0;
let funnelClosed = false;

const startedAt = Date.now();

export function secondsOnStep(): number {
  if (!currentStep) return 0;
  return Math.round((Date.now() - currentStep.startedAt) / 100) / 10;
}

/** Chamar sempre que uma etapa entra em tela. Emite o tempo gasto na anterior. */
export function trackStepView(meta: StepMeta) {
  if (currentStep && currentStep.stepId === meta.stepId) return;
  if (currentStep) {
    track("quiz_step_exit", {
      ...currentStep,
      time_on_step: secondsOnStep(),
      exited_to: meta.stepId,
      direction: meta.stepIndex >= currentStep.stepIndex ? "forward" : "back",
    });
  }
  currentStep = { ...meta, startedAt: Date.now() };
  stepsSeen += 1;
  if (meta.stepIndex > deepestIndex) deepestIndex = meta.stepIndex;
  track("quiz_step_view", { ...meta, step_number: stepsSeen });
  track("quiz_funnel_step", {
    funnel_step: meta.stepIndex + 1,
    funnel_step_id: meta.stepId,
    funnel_step_kind: meta.stepKind,
    progress: meta.progress,
  });
}

/** Conversão por opção: registra cada opção escolhida individualmente. */
export function trackOptionSelected(input: {
  questionId: string;
  questionTitle: string;
  optionId: string;
  optionLabel: string;
  type: "single" | "multi";
  selectionIndex: number;
  totalSelected: number;
  progress: number;
}) {
  answeredCount += 1;
  track("quiz_option_selected", {
    question_id: input.questionId,
    question_title: input.questionTitle,
    option_id: input.optionId,
    option_label: input.optionLabel,
    question_type: input.type,
    selection_index: input.selectionIndex,
    total_selected: input.totalSelected,
    time_to_answer: secondsOnStep(),
    progress: input.progress,
  });
}

/** Abandono: etapa exata onde parou + profundidade alcançada. */
export function trackDropOff(reason: "pagehide" | "hidden" | "manual") {
  if (funnelClosed || !currentStep || currentStep.stepKind === "result") return;
  funnelClosed = true;
  track("quiz_drop_off", {
    reason,
    drop_step_id: currentStep.stepId,
    drop_step_index: currentStep.stepIndex,
    drop_step_kind: currentStep.stepKind,
    drop_step_phase: currentStep.phase ?? null,
    progress: currentStep.progress,
    time_on_step: secondsOnStep(),
    deepest_step_index: deepestIndex,
    steps_seen: stepsSeen,
    questions_answered: answeredCount,
    total_time: Math.round((Date.now() - startedAt) / 1000),
  });
}

/** Reabre o funil (ex.: usuária voltou para a aba e continuou). */
export function reopenFunnel() {
  funnelClosed = false;
}

export function trackFunnelComplete(extra: Payload = {}) {
  funnelClosed = true;
  track("quiz_funnel_complete", {
    steps_seen: stepsSeen,
    questions_answered: answeredCount,
    total_time: Math.round((Date.now() - startedAt) / 1000),
    ...extra,
  });
}


type Item = { item_id: string; item_name: string; item_category?: string; quantity?: number };

/** Eventos de e-commerce GA4 (via dataLayer/GTM). */
export function trackEcommerce(event: string, items: Item[], extra: Payload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  track(event, {
    ecommerce: {
      currency: "BRL",
      items: items.map((item) => ({ quantity: 1, ...item })),
      ...extra,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Persistência dos eventos do funil no banco (dashboard interno)      */
/* ------------------------------------------------------------------ */

const PERSISTED = new Set([
  "quiz_started",
  "quiz_step_view",
  "quiz_step_exit",
  "quiz_option_selected",
  "quiz_drop_off",
  "quiz_funnel_complete",
  "quiz_result_viewed",
  "quiz_cta_clicked",
  "quiz_lead_sent",
  "quiz_phone_submitted",
]);

const queue: FunnelEventInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value ? value.slice(0, 200) : null;
}

function persist(event: string, data: Payload) {
  if (!PERSISTED.has(event)) return;
  queue.push({
    sessionId: quizId(),
    event,
    stepId: str(data["stepId"] ?? data["drop_step_id"] ?? data["question_id"] ?? data["funnel_step_id"]),
    stepIndex: num(data["stepIndex"] ?? data["drop_step_index"]),
    stepKind: str(data["stepKind"] ?? data["drop_step_kind"] ?? data["question_type"]),
    progress: num(data["progress"]),
    timeOnStep: num(data["time_on_step"] ?? data["time_to_answer"]),
    optionId: str(data["option_id"]),
    optionLabel: str(data["option_label"] ?? data["question_title"]),
    meta: data as Record<string, unknown>,
    variants: activeVariants(),
    utms: captureUtms(),
  });
  if (queue.length >= 12 || event === "quiz_drop_off" || event === "quiz_funnel_complete") {
    flushFunnel();
    return;
  }
  if (flushTimer) return;
  flushTimer = setTimeout(flushFunnel, 2500);
}

export function flushFunnel() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;
  const batch = queue.splice(0, queue.length);
  void recordFunnelEvents({ data: { events: batch } }).catch(() => undefined);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flushFunnel());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushFunnel();
  });
}
