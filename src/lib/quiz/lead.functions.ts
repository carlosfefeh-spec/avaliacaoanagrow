import { createServerFn } from "@tanstack/react-start";

const WEBHOOK_URL = "https://n8n.srv1083227.hstgr.cloud/webhook/respostaquizz";

export type LeadPayload = {
  quizId: string;
  storeUrl: string;
  name: string;
  phone: string;
  phoneDigits: string;
  email: string | null;
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

function firstName(name: string): string {
  return (name || "").trim().split(/\s+/)[0] ?? "";
}

function buildWhatsappMessage(d: LeadPayload): string {
  const hi = firstName(d.name) ? `Oi, ${firstName(d.name)}! ` : "Oi! ";
  const complements = d.protocol.complements.length ? `\nComplementos: ${d.protocol.complements.join(", ")}` : "";
  const ferritin = d.ferritin ? `\nLeitura de ferritina: ${d.ferritin} (referência capilar: 150 ng/mL).` : "";
  return (
    `${hi}Aqui está o resultado da sua avaliação capilar Anagrow.\n\n` +
    `Causa principal identificada: ${d.cause}.\n` +
    `Chance estimada de recuperação: ${d.recoveryChance}%.${ferritin}\n\n` +
    `Protocolo recomendado: ${d.protocol.title}\nPrincipal: ${d.protocol.main}${complements}\n\n` +
    `Ver o protocolo completo: ${d.storeUrl}`
  );
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildEmailHtml(d: LeadPayload): string {
  const complements = d.protocol.complements.length
    ? `<p style="margin:0 0 8px"><strong>Complementos:</strong> ${esc(d.protocol.complements.join(", "))}</p>`
    : "";
  const ferritin = d.ferritin
    ? `<p style="margin:0 0 8px"><strong>Ferritina:</strong> ${esc(d.ferritin)}. Referência capilar de 150 ng/mL.</p>`
    : "";
  const answers = d.answersLabeled
    .map((a) => `<li style="margin-bottom:6px"><strong>${esc(a.question)}</strong><br/>${esc(a.answers.join(", "))}</li>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
<div style="max-width:560px;margin:0 auto;padding:28px 24px">
<p style="letter-spacing:.28em;text-transform:uppercase;font-size:11px;color:#7a1f2b;margin:0 0 16px">Anagrow</p>
<h1 style="font-size:22px;line-height:1.25;margin:0 0 12px">${esc(firstName(d.name) || "Seu")} resultado da avaliação capilar</h1>
<p style="margin:0 0 16px;line-height:1.6">Causa principal identificada: <strong>${esc(d.cause)}</strong>. Chance estimada de recuperação: <strong>${d.recoveryChance}%</strong>.</p>
${ferritin}
<div style="border:1px solid #e7e2dd;border-radius:12px;padding:16px;margin:16px 0">
<p style="margin:0 0 8px"><strong>Protocolo recomendado:</strong> ${esc(d.protocol.title)}</p>
<p style="margin:0 0 8px"><strong>Principal:</strong> ${esc(d.protocol.main)}</p>
${complements}
</div>
<p style="margin:0 0 24px"><a href="${esc(d.storeUrl)}" style="display:inline-block;background:#7a1f2b;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px">Ver meu protocolo</a></p>
<h2 style="font-size:15px;margin:0 0 8px">Suas respostas</h2>
<ul style="padding-left:18px;margin:0;line-height:1.5;font-size:13px;color:#57534e">${answers}</ul>
</div></body></html>`;
}

export const sendLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadPayload) => data)
  .handler(async ({ data }) => {
    const whatsappMessage = buildWhatsappMessage(data);
    const emailHtml = buildEmailHtml(data);
    const emailSubject = `${firstName(data.name) ? `${firstName(data.name)}, s` : "S"}eu diagnóstico capilar Anagrow`;

    let ok = false;
    let status = 0;
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "quiz_completed",
          ...data,
          notify: {
            whatsapp: { to: data.phoneDigits, message: whatsappMessage },
            email: data.email ? { to: data.email, subject: emailSubject, html: emailHtml } : null,
          },
        }),
      });
      ok = res.ok;
      status = res.status;
    } catch (error) {
      console.error("sendLead failed", error);
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("quiz_leads").insert({
        session_id: data.quizId,
        name: data.name,
        phone: data.phone,
        phone_digits: data.phoneDigits,
        email: data.email,
        marketing_opt_in: data.marketingOptIn,
        cause: data.cause,
        protocol_id: data.protocol.id,
        protocol_title: data.protocol.title,
        recovery_chance: Math.round(data.recoveryChance),
        ferritin: data.ferritin,
        answers: data.answersLabeled as never,
        utms: data.utms as never,
        variants: data.variants as never,
        webhook_ok: ok,
        webhook_status: status,
      });
    } catch (error) {
      console.error("lead persist failed", error);
    }

    return { ok, status };
  });
