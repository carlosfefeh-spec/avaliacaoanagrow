import type { ScoreKey } from "./products";

export type Scores = Record<ScoreKey, number>;

export type Option = {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
  scores?: Partial<Scores>;
  tags?: string[];
  exclusive?: boolean;
};

export type Answers = Record<string, string[]>;

type Base = { id: string; weight: number; condition?: (a: Answers) => boolean };

export type Step =
  | (Base & { kind: "landing" })
  | (Base & {
      kind: "question";
      phase: string;
      title: string;
      subtitle?: string;
      type: "single" | "multi";
      options: Option[];
      microFeedback?: string | ((a: Answers) => string);
    })
  | (Base & {
      kind: "info";
      eyebrow?: string;
      title: string;
      body?: string;
      bullets?: string[];
      cta: string;
    })
  | (Base & { kind: "milestone"; title: string; body: string; highlight?: string })
  | (Base & { kind: "insights"; title: string; subtitle: string; insights: string[] })
  | (Base & { kind: "findings" })
  | (Base & { kind: "chance" })
  | (Base & { kind: "name" })
  | (Base & { kind: "phone" })
  | (Base & { kind: "processing" })
  | (Base & { kind: "result" });

/** Marcos psicológicos da barra de progresso. */
export const MILESTONES: { at: number; label: string }[] = [
  { at: 0, label: "Vamos começar" },
  { at: 10, label: "Você começou" },
  { at: 35, label: "Excelente" },
  { at: 60, label: "Já identificamos alguns padrões" },
  { at: 82, label: "Falta muito pouco" },
  { at: 100, label: "Resultado pronto" },
];

/** Microfeedbacks (variações para não repetir frase). */
export const MICRO_FEEDBACKS = [
  "Entendi. Isso muda bastante a análise.",
  "Esse detalhe é importante.",
  "Seu perfil já está ficando mais claro.",
  "Boa. Agora falta entender um detalhe.",
  "Suas respostas já apontam uma direção.",
  "Anotado. Isso pesa na avaliação.",
  "Interessante — isso aparece bastante nos casos que analisamos.",
  "Certo. Estamos cruzando queda, densidade e crescimento.",
  "Isso ajuda a diferenciar dois perfis possíveis.",
  "Ótimo. Sua análise ficou mais precisa.",
  "Esse ponto costuma passar despercebido.",
  "Registrado. Já dá pra ver um padrão se formando.",
  "Faz sentido com o que você respondeu antes.",
  "Perfeito, isso reduz as possibilidades.",
  "Mais um sinal relevante para o seu caso.",
];

export const STEPS: Step[] = [
  { kind: "landing", id: "landing", weight: 0 },

  {
    kind: "question",
    id: "descricao",
    phase: "Identificação",
    weight: 10,
    title: "Qual frase mais descreve seu cabelo hoje?",
    subtitle: "Escolha a que mais se parece com o que você percebe no espelho.",
    type: "single",
    options: [
      {
        id: "afinando",
        label: "Está afinando",
        hint: "Fios mais finos, risco mais largo",
        icon: "strand",
        scores: { osa: 3, tonico: 1 },
      },
      {
        id: "banho",
        label: "Cai muito no banho",
        hint: "Fios no ralo e na escova",
        icon: "drop",
        scores: { ferritin12: 3, osa: 1 },
      },
      {
        id: "falhas",
        label: "Tem falhas",
        hint: "Áreas menos preenchidas",
        icon: "spark",
        scores: { tonico: 3, osa: 1 },
      },
      {
        id: "volume",
        label: "Perdeu volume",
        hint: "Rabo de cavalo mais fino",
        icon: "wave",
        scores: { ferritin12: 2, osa: 2, tonico: 1 },
      },
      { id: "outro", label: "Outro", icon: "dots", scores: { ferritin12: 1 } },
    ],
    microFeedback: "Esse é o ponto de partida da sua análise.",
  },

  {
    kind: "question",
    id: "tempo",
    phase: "Identificação",
    weight: 8,
    title: "Há quanto tempo isso acontece?",
    subtitle: "O tempo muda completamente a leitura do caso.",
    type: "single",
    options: [
      { id: "lt3", label: "Menos de 3 meses", scores: { ferritin12: 2 } },
      { id: "3a6", label: "De 3 a 6 meses", scores: { ferritin12: 2, osa: 1 } },
      { id: "gt1", label: "Mais de 1 ano", scores: { osa: 2, tonico: 1 } },
      { id: "anos", label: "Há vários anos", scores: { osa: 3, tonico: 2 } },
    ],
    microFeedback:
      "Quedas recentes e quedas de longa data costumam ter causas diferentes.",
  },

  {
    kind: "info",
    id: "curiosidade",
    weight: 4,
    eyebrow: "Antes de continuar",
    title:
      "Mais de 80% das mulheres tratam apenas o sintoma da queda, sem descobrir a causa.",
    body: "É por isso que tanta coisa parece funcionar por um mês e depois para. As próximas perguntas existem justamente para olhar a causa.",
    cta: "Continuar",
  },

  {
    kind: "question",
    id: "exames",
    phase: "Contexto",
    weight: 8,
    title: "Você já realizou algum desses exames?",
    subtitle: "Pode marcar mais de um.",
    type: "multi",
    options: [
      { id: "ferritina", label: "Ferritina", scores: { ferritin12: 2 } },
      { id: "vitd", label: "Vitamina D", scores: { vitaD: 2 } },
      { id: "b12", label: "B12", scores: { ferritin12: 2 } },
      {
        id: "nunca",
        label: "Nunca fiz",
        exclusive: true,
        scores: { ferritin12: 2, vitaD: 1 },
        tags: ["sem-exames"],
      },
    ],
    microFeedback: (a) =>
      a['exames']?.includes("nunca")
        ? "Sem exames, a leitura passa a depender ainda mais dos sinais que você percebe — e você já me deu vários."
        : "Ótimo. Quem já investigou costuma chegar mais rápido a um protocolo coerente.",
  },

  {
    kind: "milestone",
    id: "milestone40",
    weight: 3,
    title: "Ferritina: o sinal que muitos exames deixam passar",
    body: "Tricologistas consideram ferritina abaixo de 150 ng/mL o principal indicador nutricional quando o cabelo perde espessura. Antes da queda aumentar, o fio já fica mais fino.",
    highlight: "Ferritina < 150 ng/mL",
  },

  {
    kind: "question",
    id: "couro",
    phase: "Padrão",
    weight: 8,
    title: "Como está seu couro cabeludo?",
    type: "single",
    options: [
      { id: "oleoso", label: "Oleoso", scores: { osa: 2, tonico: 1 } },
      { id: "seco", label: "Seco", scores: { tonico: 1, vitaD: 1, glowOil: 1 } },
      { id: "sensivel", label: "Sensível", scores: { tonico: 1 } },
      { id: "normal", label: "Normal", scores: { tonico: 1 } },
    ],
    microFeedback: "O couro cabeludo é o solo do fio — ele entra na conta.",
  },

  {
    kind: "question",
    id: "menopausa",
    phase: "Contexto",
    weight: 8,
    title: "Você está na menopausa?",
    subtitle: "Mudanças hormonais alteram bastante o padrão da queda.",
    type: "single",
    options: [
      { id: "sim", label: "Sim", scores: { osa: 3 }, tags: ["hormonal"] },
      { id: "peri", label: "Perimenopausa", scores: { osa: 2 }, tags: ["hormonal"] },
      { id: "nao", label: "Não", scores: { ferritin12: 1 } },
      { id: "nsei", label: "Não sei", scores: { osa: 1, ferritin12: 1 } },
    ],
    microFeedback: "Anotado. Isso pesa bastante na leitura hormonal do seu caso.",
  },

  {
    kind: "question",
    id: "suplemento",
    phase: "Contexto",
    weight: 8,
    title: "Você utiliza algum suplemento hoje?",
    type: "single",
    options: [
      { id: "sim", label: "Sim, uso atualmente", scores: { osa: 1 } },
      {
        id: "ja",
        label: "Já utilizei, mas parei",
        hint: "Ainda buscando algo que combine comigo",
        scores: { ferritin12: 1, osa: 1, tonico: 1 },
      },
      { id: "nao", label: "Ainda não comecei", scores: { ferritin12: 2 } },
    ],
  },

  {
    kind: "milestone",
    id: "reward",
    weight: 3,
    title: "Parabéns.",
    body: "Suas respostas já estão permitindo uma análise muito mais precisa do que a média dos casos.",
  },

  {
    kind: "question",
    id: "objetivo",
    phase: "Objetivo",
    weight: 8,
    title: "E qual é o seu objetivo?",
    type: "single",
    options: [
      { id: "parar", label: "Parar a queda", scores: { ferritin12: 3, osa: 2 } },
      { id: "encorpar", label: "Encorpar o cabelo", scores: { osa: 2, tonico: 3 } },
      {
        id: "ambos",
        label: "Quero os dois",
        scores: { ferritin12: 2, osa: 2, tonico: 2 },
        tags: ["completo"],
      },
    ],
    microFeedback: "Perfeito. Agora sei o que priorizar na sua recomendação.",
  },

  {
    kind: "insights",
    id: "insights",
    weight: 6,
    title: "Estamos cruzando suas respostas…",
    subtitle: "Analisando mais de 30 fatores",
    insights: [
      "Afinamento costuma acontecer antes da queda intensa.",
      "O DHT também pode afetar mulheres.",
      "A deficiência de ferro está entre as causas mais comuns de queda feminina.",
      "Muitas mulheres têm deficiência de B12 sem saber.",
      "A falta de cisteína reduz a espessura do cabelo.",
    ],
  },

  { kind: "findings", id: "findings", weight: 5 },

  { kind: "name", id: "name", weight: 5 },

  { kind: "chance", id: "chance", weight: 5 },

  { kind: "phone", id: "phone", weight: 5 },

  { kind: "processing", id: "processing", weight: 6 },

  { kind: "result", id: "result", weight: 0 },
];
