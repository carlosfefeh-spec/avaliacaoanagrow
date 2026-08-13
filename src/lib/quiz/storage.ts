import type { Answers } from "./config";

const KEY = "anagrow_quiz_state_v1";

export type SavedState = {
  stepId: string;
  answers: Answers;
  name: string;
  phone: string;
  updatedAt: number;
};

export function loadState(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed?.stepId) return null;
    // expira em 7 dias
    if (Date.now() - parsed.updatedAt > 7 * 864e5) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: Omit<SavedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch {
    /* storage indisponível — a experiência continua funcionando */
  }
}

export function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
