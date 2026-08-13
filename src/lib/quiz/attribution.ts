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
    if (opts.variantSuffix) params.set("quiz_variant", opts.variantSuffix);

    return url.toString();
  } catch {
    return baseUrl;
  }
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
    ...captureUtms(),
    ...activeVariants(),
  };
}
