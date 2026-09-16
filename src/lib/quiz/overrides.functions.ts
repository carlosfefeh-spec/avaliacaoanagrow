import { createServerFn } from "@tanstack/react-start";

import type { Json } from "@/integrations/supabase/types";

export type PublicOverrideRow = { step_id: string; hidden: boolean; patch: Json };

/** Entrega apenas os ajustes de conteúdo necessários para exibir o diagnóstico público. */
export const fetchPublicOverridesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("diagnostic_step_overrides")
      .select("step_id, hidden, patch");
    if (error) throw error;
    return ((data ?? []) as PublicOverrideRow[]).map((row) => ({
      step_id: row.step_id,
      hidden: row.hidden,
      patch: (row.patch ?? {}) as Json,
    }));
  } catch (error) {
    console.error("fetchPublicOverridesFn failed", error);
    return [] as PublicOverrideRow[];
  }
});
