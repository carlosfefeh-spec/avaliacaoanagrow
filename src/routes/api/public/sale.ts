import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const WEBHOOK_URL = "https://n8n.srv1083227.hstgr.cloud/webhook-test/respostaquizz";

const saleSchema = z.object({
  quiz_id: z.string().min(3).max(80),
  order_id: z.string().min(1).max(80),
  value: z.number().nonnegative().optional(),
  currency: z.string().length(3).default("BRL"),
  items: z
    .array(
      z.object({
        item_id: z.string().max(120),
        item_name: z.string().max(200).optional(),
        quantity: z.number().int().positive().optional(),
        price: z.number().nonnegative().optional(),
      }),
    )
    .max(30)
    .optional(),
  utm_source: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  utm_content: z.string().max(120).optional(),
  status: z.string().max(40).optional(),
});

/**
 * Postback de venda: a loja (ou o n8n) chama este endpoint com o quiz_id
 * que viajou na URL do CTA, fechando o ciclo quiz -> pedido.
 * Protegido por token compartilhado no header x-sale-token.
 */
export const Route = createFileRoute("/api/public/sale")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["QUIZ_SALE_TOKEN"];
        const provided = request.headers.get("x-sale-token");
        if (!expected || provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const parsed = saleSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ ok: false, error: "invalid_payload" }), {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }

        const sale = { event: "quiz_purchase", ...parsed.data, receivedAt: new Date().toISOString() };

        try {
          await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sale),
          });
        } catch (error) {
          console.error("sale forward failed", error);
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
