import { createServerFn } from "@tanstack/react-start";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number): string {
  return String(value ?? "").slice(0, max);
}

export type StartSessionInput = { id: string; quizId: string; workspaceId: string; clientId: string };

/** Cria a sessão do funil no servidor, validando o formato do identificador. */
export const startSessionFn = createServerFn({ method: "POST" })
  .inputValidator((data: StartSessionInput) => data)
  .handler(async ({ data }) => {
    if (!UUID_RE.test(data?.id ?? "")) return { ok: false };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("quiz_sessions").insert({
        id: data.id,
        quiz_id: clean(data.quizId, 120),
        workspace_id: clean(data.workspaceId, 120),
        client_id: clean(data.clientId, 120),
        status: "in_progress",
        started_at: new Date().toISOString(),
        current_question_position: 0,
      });
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error("startSessionFn failed", error);
      return { ok: false };
    }
  });

export type RecordAnswerInput = {
  sessionId: string;
  questionId: string;
  position: number;
  optionIds?: string[];
  textValue?: string | null;
};

/** Grava a resposta apenas quando a sessão informada existe de verdade. */
export const recordAnswerFn = createServerFn({ method: "POST" })
  .inputValidator((data: RecordAnswerInput) => data)
  .handler(async ({ data }) => {
    if (!UUID_RE.test(data?.sessionId ?? "")) return { ok: false };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: session } = await supabaseAdmin
        .from("quiz_sessions")
        .select("id")
        .eq("id", data.sessionId)
        .maybeSingle();
      if (!session) return { ok: false };

      const position = Number.isFinite(data.position) ? Math.max(0, Math.trunc(data.position)) : 0;
      const optionIds = (data.optionIds ?? []).slice(0, 30).map((value) => clean(value, 120));

      const { error } = await supabaseAdmin.from("quiz_answers").insert({
        quiz_session_id: data.sessionId,
        question_id: clean(data.questionId, 120),
        question_position: position,
        option_ids: optionIds,
        text_value: data.textValue == null ? null : clean(data.textValue, 500),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;

      await supabaseAdmin
        .from("quiz_sessions")
        .update({ current_question_position: position })
        .eq("id", data.sessionId);
      return { ok: true };
    } catch (error) {
      console.error("recordAnswerFn failed", error);
      return { ok: false };
    }
  });

/** Conclui a sessão informada. */
export const completeSessionFn = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    if (!UUID_RE.test(data?.sessionId ?? "")) return { ok: false };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("quiz_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", data.sessionId);
      return { ok: true };
    } catch (error) {
      console.error("completeSessionFn failed", error);
      return { ok: false };
    }
  });
