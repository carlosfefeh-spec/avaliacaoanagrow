import { activeVariants } from "./experiments";

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
  phase?: string;
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
