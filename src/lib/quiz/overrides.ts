import { supabase } from "@/integrations/supabase/client";

import { STEPS, type Step } from "./config";

export type StepPatch = {
  title?: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  options?: Record<string, { label?: string; hint?: string }>;
};

export type OverrideRow = { step_id: string; hidden: boolean; patch: StepPatch };

export async function fetchOverrides(): Promise<OverrideRow[]> {
  const { data, error } = await supabase.from("diagnostic_step_overrides").select("step_id, hidden, patch");
  if (error) return [];
  return (data ?? []).map((row) => ({
    step_id: row.step_id,
    hidden: row.hidden,
    patch: (row.patch ?? {}) as StepPatch,
  }));
}

/** Aplica os ajustes do painel sobre a configuração original, sem alterar a experiência quando não há ajustes. */
export function applyOverrides(steps: Step[], overrides: OverrideRow[]): Step[] {
  if (!overrides.length) return steps;
  const map = new Map(overrides.map((o) => [o.step_id, o]));
  const result: Step[] = [];

  for (const step of steps) {
    const override = map.get(step.id);
    if (!override) {
      result.push(step);
      continue;
    }
    if (override.hidden && step.kind !== "landing" && step.kind !== "result") continue;

    const patch = override.patch ?? {};
    const next = { ...step } as Step & Record<string, unknown>;
    if (patch.title) next["title"] = patch.title;
    if (patch.subtitle) next["subtitle"] = patch.subtitle;
    if (patch.body) next["body"] = patch.body;
    if (patch.cta) next["cta"] = patch.cta;
    if (patch.options && "options" in step && Array.isArray(step.options)) {
      next["options"] = step.options.map((option) => {
        const op = patch.options?.[option.id];
        return op ? { ...option, ...(op.label ? { label: op.label } : {}), ...(op.hint ? { hint: op.hint } : {}) } : option;
      });
    }
    result.push(next as Step);
  }
  return result;
}

export async function loadDiagnosticSteps(): Promise<Step[]> {
  try {
    return applyOverrides(STEPS, await fetchOverrides());
  } catch {
    return STEPS;
  }
}
