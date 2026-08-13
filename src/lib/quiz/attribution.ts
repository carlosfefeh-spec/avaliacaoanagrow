import { captureUtms, quizId } from "./analytics";
import { activeVariants } from "./experiments";

export { quizId };

/**
 * Monta a URL da loja com UTMs de rastreio + quiz_id,
 * preservando a origem original da visita quando existir.
 */
export function buildStoreUrl(
  baseUrl: string,
  opts: { protocolId: string; cause?: string; variantSuffix?: string },
): string {
  if (typeof window === "undefined") return baseUrl;
  try {
    const url = new URL(baseUrl, window.location.origin);
    const utms = captureUtms();
    const params = url.searchParams;

    params.set("utm_source", utms["utm_source"] || "quiz");
    params.set("utm_medium", utms["utm_medium"] || "quiz_anagrow");
    params.set("utm_campaign", utms["utm_campaign"] || "quiz_diagnostico");
    params.set("utm_content", opts.protocolId);
    if (opts.cause) params.set("utm_term", slug(opts.cause));
    params.set("quiz_id", quizId());
    const gaClientId = readGaClientId();
    if (gaClientId) params.set("ga_client_id", gaClientId);
    if (opts.variantSuffix) params.set("quiz_variant", opts.variantSuffix);

    return url.toString();
  } catch {
    return baseUrl;
  }
}

/** Lê o client_id do GA4 a partir do cookie _ga (formato GA1.1.<client_id>). */
export function readGaClientId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.([\d]+\.[\d]+)/);
  return match?.[1] ?? null;
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Contexto completo enviado junto de cada evento de venda. */
export function attributionContext() {
  return {
    quiz_id: quizId(),
    ga_client_id: readGaClientId() ?? undefined,
    ...captureUtms(),
    ...activeVariants(),
  };
}
