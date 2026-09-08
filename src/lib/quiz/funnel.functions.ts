import { createServerFn } from "@tanstack/react-start";

export type FunnelEventInput = {
  sessionId: string;
  event: string;
  stepId?: string | null;
  stepIndex?: number | null;
  stepKind?: string | null;
  progress?: number | null;
  timeOnStep?: number | null;
  optionId?: string | null;
  optionLabel?: string | null;
  meta?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  utms?: Record<string, unknown>;
};

/** Registro público do funil: qualquer visitante pode gravar eventos da própria sessão. */
export const recordFunnelEvents = createServerFn({ method: "POST" })
  .inputValidator((data: { events: FunnelEventInput[] }) => data)
  .handler(async ({ data }) => {
    const events = (data.events ?? []).slice(0, 50).filter((e) => e.sessionId && e.event);
    if (!events.length) return { ok: true, inserted: 0 };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const rows = events.map((e) => ({
        session_id: String(e.sessionId).slice(0, 120),
        event: String(e.event).slice(0, 80),
        step_id: e.stepId ?? null,
        step_index: e.stepIndex ?? null,
        step_kind: e.stepKind ?? null,
        progress: e.progress ?? null,
        time_on_step: e.timeOnStep ?? null,
        option_id: e.optionId ?? null,
        option_label: e.optionLabel ?? null,
        meta: (e.meta ?? {}) as never,
        variants: (e.variants ?? {}) as never,
        utms: (e.utms ?? {}) as never,
      }));
      const { error } = await supabaseAdmin.from("quiz_funnel_events").insert(rows);
      if (error) throw error;
      return { ok: true, inserted: rows.length };
    } catch (error) {
      console.error("recordFunnelEvents failed", error);
      return { ok: false, inserted: 0 };
    }
  });
