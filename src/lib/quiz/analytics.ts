import { activeVariants } from "./experiments";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const UTM_STORAGE = "anagrow_quiz_utm";

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
