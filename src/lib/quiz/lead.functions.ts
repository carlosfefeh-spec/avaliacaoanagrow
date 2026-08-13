import { createServerFn } from "@tanstack/react-start";

const WEBHOOK_URL = "https://n8n.srv1083227.hstgr.cloud/webhook-test/respostaquizz";

export type LeadPayload = {
  quizId: string;
  storeUrl: string;
  name: string;
  phone: string;
  phoneDigits: string;
  marketingOptIn: boolean;
  answers: Record<string, string[]>;
  answersLabeled: { question: string; answers: string[] }[];
  scores: Record<string, number>;
  tags: string[];
  cause: string;
  protocol: { id: string; title: string; main: string; complements: string[] };
  recoveryChance: number;
  ferritin: string | null;
  utms: Record<string, string>;
  variants: Record<string, string>;
  pageUrl: string;
  completedAt: string;
};

export const sendLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadPayload) => data)
  .handler(async ({ data }) => {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "quiz_completed", ...data }),
      });
      return { ok: res.ok, status: res.status };
    } catch (error) {
      console.error("sendLead failed", error);
      return { ok: false, status: 0 };
    }
  });
