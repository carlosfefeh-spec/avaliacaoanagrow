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
  cta_v1: ["control", "insight", "direct"] as const,
  loader_v1: ["control", "personal"] as const,
  why_v1: ["single", "double"] as const,
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

/* ------------------------------------------------- CTA final "Ver protocolo" */

export type CtaCopy = {
  /** Texto do botão. Recebe o texto padrão do protocolo e a causa detectada. */
  label: (defaultLabel: string, causeLabel: string) => string;
  /** Linha de contexto/insight logo acima do botão (null = sem contexto). */
  context: ((causeLabel: string, chance: number) => string) | null;
  /** Destaque visual extra (glow + leve pulso) na barra fixa. */
  highlight: boolean;
};

export const CTA_COPY: Record<Variant<"cta_v1">, CtaCopy> = {
  control: {
    label: (defaultLabel) => defaultLabel,
    context: null,
    highlight: false,
  },
  insight: {
    label: () => "Ver meu protocolo completo",
    context: (causeLabel, chance) =>
      `Baseado em ${causeLabel.toLowerCase()} · ${chance}% de chance de melhora se começar agora`,
    highlight: true,
  },
  // Copy curta e direta, mantendo a hierarquia (contexto de uma linha só).
  direct: {
    label: () => "Ver meu protocolo",
    context: (_causeLabel, chance) => `${chance}% de chance de melhora`,
    highlight: true,
  },
};

/* ------------------------------------------------- Loader de insights (83%) */

export type LoaderCopy = {
  /** Mensagens exibidas durante a análise (null = usa as do config). */
  insights: string[] | null;
  /** Intervalo (ms) até revelar cada próxima mensagem. */
  pace: (index: number) => number;
  /** Espera final antes de avançar para os achados. */
  hold: number;
  /** Microfeedback de status abaixo da barra (null = só a %). */
  status: ((shown: number, total: number) => string) | null;
};

export const LOADER_COPY: Record<Variant<"loader_v1">, LoaderCopy> = {
  control: {
    insights: null,
    pace: () => 1700,
    hold: 1400,
    status: null,
  },
  // Ritmo acelerando + mensagens em 1ª pessoa + status para segurar a atenção.
  personal: {
    insights: [
      "Comparando seu padrão de queda com o de 20.000 mulheres…",
      "Afinamento quase sempre aparece antes da queda intensa.",
      "O DHT também age no couro cabeludo feminino.",
      "Ferro baixo é uma das causas mais comuns de queda em mulheres.",
      "B12 e cisteína definem a espessura de cada fio.",
      "Cruzando tudo isso com as suas respostas…",
    ],
    pace: (i) => Math.max(850, 1500 - i * 130),
    hold: 900,
    status: (shown, total) => {
      if (shown >= total) return "Quase lá — montando o seu resultado.";
      if (shown >= total - 2) return "Falta muito pouco. Não feche esta tela.";
      if (shown >= 2) return "Seu perfil já está tomando forma.";
      return "Analisando as suas respostas…";
    },
  },
};

/* --------------------------------- "Por quê" do produto recomendado (result) */

export type WhyContext = {
  causeLabel: string;
  causeBody: string;
  productName: string;
  productRole: string;
  chance: number;
};

export type WhyBlock = { title: string; body: string };

export const WHY_BLOCKS: Record<Variant<"why_v1">, (ctx: WhyContext) => WhyBlock[]> = {
  // 1 bloco: explicação única e direta.
  single: (c) => [
    {
      title: `Por que ${c.productName} para o seu caso`,
      body: `Suas respostas apontam para ${c.causeLabel.toLowerCase()}. ${c.productRole} É por isso que ele vem em primeiro lugar no seu protocolo.`,
    },
  ],
  // 2 blocos: causa → mecanismo, separando o diagnóstico da solução.
  double: (c) => [
    {
      title: "O que está por trás da sua queda",
      body: `${c.causeBody} Enquanto essa causa não é tratada, o fio continua nascendo mais fino e caindo antes da hora.`,
    },
    {
      title: `Como ${c.productName} age nisso`,
      body: `${c.productRole} Mantendo o uso contínuo, sua chance estimada de melhora é de ${c.chance}%.`,
    },
  ],
};
