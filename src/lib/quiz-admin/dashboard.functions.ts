import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StepStat = {
  stepId: string;
  stepKind: string | null;
  views: number;
  avgTime: number;
  dropOffs: number;
  dropRate: number;
};

export type OptionStat = {
  questionTitle: string;
  optionLabel: string;
  count: number;
  share: number;
};

export type LeadRow = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string | null;
  cause: string | null;
  protocol: string | null;
  recoveryChance: number | null;
  webhookOk: boolean;
  webhookStatus: number | null;
};

export type FunnelDashboard = {
  days: number;
  sessions: number;
  results: number;
  ctaClicks: number;
  leads: number;
  leadsFailed: number;
  completionRate: number;
  ctaRate: number;
  leadRate: number;
  steps: StepStat[];
  options: OptionStat[];
  recentLeads: LeadRow[];
};

export const getFunnelDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number }) => ({ days: Math.min(90, Math.max(1, data?.days ?? 30)) }))
  .handler(async ({ data, context }): Promise<FunnelDashboard> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const since = new Date(Date.now() - data.days * 86400000).toISOString();

    const { data: events, error } = await context.supabase
      .from("quiz_funnel_events")
      .select("session_id, event, step_id, step_index, step_kind, time_on_step, option_label, meta")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(20000);
    if (error) throw error;

    const { data: leads, error: leadError } = await context.supabase
      .from("quiz_leads")
      .select("id, created_at, name, phone, email, cause, protocol_title, recovery_chance, webhook_ok, webhook_status")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);
    if (leadError) throw leadError;

    const rows = events ?? [];
    const sessions = new Set<string>();
    const resultSessions = new Set<string>();
    const ctaSessions = new Set<string>();
    const order: string[] = [];
    const stats = new Map<string, { kind: string | null; views: number; timeSum: number; timeCount: number; drops: number }>();
    const options = new Map<string, { question: string; label: string; count: number }>();

    for (const row of rows) {
      sessions.add(row.session_id);
      if (row.event === "quiz_result_viewed") resultSessions.add(row.session_id);
      if (row.event === "quiz_cta_clicked") ctaSessions.add(row.session_id);

      const stepId = row.step_id;
      if (stepId && (row.event === "quiz_step_view" || row.event === "quiz_step_exit" || row.event === "quiz_drop_off")) {
        if (!stats.has(stepId)) {
          stats.set(stepId, { kind: row.step_kind, views: 0, timeSum: 0, timeCount: 0, drops: 0 });
          order.push(stepId);
        }
        const entry = stats.get(stepId)!;
        if (row.event === "quiz_step_view") entry.views += 1;
        if (row.event === "quiz_step_exit" && typeof row.time_on_step === "number") {
          entry.timeSum += Number(row.time_on_step);
          entry.timeCount += 1;
        }
        if (row.event === "quiz_drop_off") entry.drops += 1;
      }

      if (row.event === "quiz_option_selected") {
        const meta = (row.meta ?? {}) as Record<string, unknown>;
        const question = typeof meta["question_title"] === "string" ? meta["question_title"] : (row.step_id ?? "—");
        const label = typeof meta["option_label"] === "string" ? meta["option_label"] : (row.option_label ?? "—");
        const key = `${question}||${label}`;
        const current = options.get(key) ?? { question, label, count: 0 };
        current.count += 1;
        options.set(key, current);
      }
    }

    const totalSessions = sessions.size;
    const steps: StepStat[] = order.map((stepId) => {
      const entry = stats.get(stepId)!;
      return {
        stepId,
        stepKind: entry.kind,
        views: entry.views,
        avgTime: entry.timeCount ? Math.round((entry.timeSum / entry.timeCount) * 10) / 10 : 0,
        dropOffs: entry.drops,
        dropRate: entry.views ? Math.round((entry.drops / entry.views) * 100) : 0,
      };
    });
    steps.sort((a, b) => b.views - a.views);

    const questionTotals = new Map<string, number>();
    for (const o of options.values()) questionTotals.set(o.question, (questionTotals.get(o.question) ?? 0) + o.count);
    const optionStats: OptionStat[] = [...options.values()]
      .map((o) => ({
        questionTitle: o.question,
        optionLabel: o.label,
        count: o.count,
        share: Math.round((o.count / (questionTotals.get(o.question) || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);

    const leadRows = leads ?? [];
    const pct = (n: number) => (totalSessions ? Math.round((n / totalSessions) * 100) : 0);

    return {
      days: data.days,
      sessions: totalSessions,
      results: resultSessions.size,
      ctaClicks: ctaSessions.size,
      leads: leadRows.length,
      leadsFailed: leadRows.filter((l) => !l.webhook_ok).length,
      completionRate: pct(resultSessions.size),
      ctaRate: pct(ctaSessions.size),
      leadRate: pct(leadRows.length),
      steps,
      options: optionStats,
      recentLeads: leadRows.map((l) => ({
        id: l.id,
        createdAt: l.created_at,
        name: l.name,
        phone: l.phone,
        email: l.email,
        cause: l.cause,
        protocol: l.protocol_title,
        recoveryChance: l.recovery_chance,
        webhookOk: l.webhook_ok,
        webhookStatus: l.webhook_status,
      })),
    };
  });
