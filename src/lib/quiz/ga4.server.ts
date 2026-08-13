/**
 * Envio server-side de eventos para o GA4 via Measurement Protocol.
 * Usa o quiz_id como âncora de atribuição (user_id + parâmetro do evento),
 * garantindo que a venda seja creditada ao quiz mesmo sem JS no checkout.
 */

type Item = {
  item_id: string;
  item_name?: string;
  quantity?: number;
  price?: number;
};

export type PurchasePayload = {
  quiz_id: string;
  order_id: string;
  value?: number;
  currency?: string;
  items?: Item[];
  client_id?: string;
  session_id?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
};

/** GA4 exige um client_id no formato "XXXXXXXXXX.YYYYYYYYYY"; derivamos do quiz_id quando ausente. */
function deriveClientId(quizId: string): string {
  let hash = 0;
  for (let i = 0; i < quizId.length; i += 1) {
    hash = (hash * 31 + quizId.charCodeAt(i)) >>> 0;
  }
  const seconds = Math.floor(Date.now() / 1000);
  return `${hash}.${seconds}`;
}

export async function sendPurchaseToGa4(
  payload: PurchasePayload,
): Promise<{ sent: boolean; reason?: string }> {
  const measurementId = process.env["GA4_MEASUREMENT_ID"];
  const apiSecret = process.env["GA4_API_SECRET"];
  if (!measurementId || !apiSecret) return { sent: false, reason: "missing_ga4_credentials" };

  const clientId =
    payload.client_id && /^\d+\.\d+$/.test(payload.client_id)
      ? payload.client_id
      : deriveClientId(payload.quiz_id);

  const body = {
    client_id: clientId,
    user_id: payload.quiz_id,
    non_personalized_ads: false,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: payload.order_id,
          value: payload.value ?? 0,
          currency: payload.currency ?? "BRL",
          quiz_id: payload.quiz_id,
          engagement_time_msec: 1,
          ...(payload.session_id ? { session_id: payload.session_id } : {}),
          ...(payload.utm_source ? { source: payload.utm_source } : {}),
          ...(payload.utm_campaign ? { campaign: payload.utm_campaign } : {}),
          ...(payload.utm_content ? { content: payload.utm_content } : {}),
          items: (payload.items ?? []).map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name ?? item.item_id,
            quantity: item.quantity ?? 1,
            price: item.price ?? 0,
          })),
        },
      },
    ],
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId,
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.error("ga4 purchase failed", response.status);
      return { sent: false, reason: `ga4_status_${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error("ga4 purchase error", error);
    return { sent: false, reason: "ga4_network_error" };
  }
}
