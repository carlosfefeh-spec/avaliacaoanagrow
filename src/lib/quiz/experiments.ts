/**
 * Testes A/B do quiz.
 * - `landing_v1`: copy da Tela 1 (headline, prova social, CTA).
 * - `micro_v1`: tom dos microfeedbacks entre perguntas.
 *
 * A variante é sorteada uma única vez por usuária e fica presa no
 * localStorage, para que a experiência não mude no meio do funil.
 */

export const EXPERIMENTS = {
  landing_v1: ["control", "cause"] as const,
  micro_v1: ["neutral", "empathic"] as const,
};

export type ExperimentId = keyof typeof EXPERIMENTS;
export type Variant<K extends ExperimentId> = (typeof EXPERIMENTS)[K][number];

const KEY = "anagrow_quiz_ab_v1";

type Assignment = Partial<Record<ExperimentId, string>>;

function readAll(): Assignment {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Assignment;
  } catch {
    return {};
  }
}

function writeAll(value: Assignment) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage indisponível — a variante vira apenas de sessão */
  }
}

/** Retorna (e persiste) a variante da usuária. No servidor devolve o controle. */
export function getVariant<K extends ExperimentId>(id: K): Variant<K> {
  const options = EXPERIMENTS[id] as readonly Variant<K>[];
  if (typeof window === "undefined") return options[0]!;

  const forced = new URLSearchParams(window.location.search).get(`ab_${id}`);
  if (forced && (options as readonly string[]).includes(forced)) {
    const all = { ...readAll(), [id]: forced };
    writeAll(all);
    return forced as Variant<K>;
  }

  const all = readAll();
  const saved = all[id];
  if (saved && (options as readonly string[]).includes(saved)) return saved as Variant<K>;

  const picked = options[Math.floor(Math.random() * options.length)]!;
  writeAll({ ...all, [id]: picked });
  return picked;
}

/** Todas as variantes ativas, para anexar em cada evento de analytics. */
export function activeVariants(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of Object.keys(EXPERIMENTS) as ExperimentId[]) {
    out[`ab_${id}`] = getVariant(id);
  }
  return out;
}

/* ------------------------------------------------------------ Tela 1 copy */

export type LandingCopy = {
  badge: string;
  headline: string;
  subhead: string;
  bullets: string[];
  cta: string;
};

export const LANDING_COPY: Record<Variant<"landing_v1">, LandingCopy> = {
  control: {
    badge: "Avaliação capilar guiada",
    headline: "Descubra a verdadeira causa da sua queda de cabelo.",
    subhead:
      "Em cerca de 2 minutos analisamos seu caso e indicamos o protocolo Anagrow mais adequado ao que você está vivendo hoje.",
    bullets: [
      "Mais de 20.000 mulheres avaliadas",
      "Perguntas rápidas, uma por vez",
      "Recomendação explicada resposta por resposta",
    ],
    cta: "Quero descobrir",
  },
  cause: {
    badge: "2 minutos · 100% gratuito",
    headline: "Seu cabelo está caindo — e você merece saber por quê.",
    subhead:
      "A maioria dos tratamentos falha porque ataca o sintoma. Responda algumas perguntas e veja qual causa explica o seu caso.",
    bullets: [
      "20.000 mulheres já entenderam a causa da própria queda",
      "Nada de formulário longo: uma pergunta por vez",
      "No final, o protocolo certo para o seu perfil",
    ],
    cta: "Descobrir minha causa",
  },
};

/* --------------------------------------------------- Microfeedback (tom) */

/** Reforço extra usado na variante empática, por posição no funil. */
export const EMPATHIC_PREFIXES = [
  "Você não está imaginando coisas —",
  "Isso é mais comum do que parece —",
  "Obrigado por compartilhar —",
  "Faz total sentido —",
  "Muita gente descreve exatamente isso —",
];

const NEUTRAL_FALLBACK = "Resposta registrada.";

export function decorateMicroFeedback(
  variant: Variant<"micro_v1">,
  message: string | null,
  index: number,
): string {
  const base = message ?? NEUTRAL_FALLBACK;
  if (variant !== "empathic") return base;
  const prefix = EMPATHIC_PREFIXES[index % EMPATHIC_PREFIXES.length]!;
  const first = base.charAt(0).toLowerCase() + base.slice(1);
  return `${prefix} ${first}`;
}
