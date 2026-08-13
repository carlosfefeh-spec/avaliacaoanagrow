import { STEPS, type Answers, type Scores, type Step } from "./config";
import { KITS, PRODUCTS, type Product, type ScoreKey } from "./products";

export const EMPTY_SCORES: Scores = {
  ferritin12: 0,
  osa: 0,
  tonico: 0,
  vitaD: 0,
  anaPlus: 0,
  glowOil: 0,
};

export function visibleSteps(answers: Answers): Step[] {
  return STEPS.filter((s) => !s.condition || s.condition(answers));
}

export function computeScores(answers: Answers): Scores {
  const scores: Scores = { ...EMPTY_SCORES };
  for (const step of STEPS) {
    if (step.kind !== "question") continue;
    const picked = answers[step.id] ?? [];
    for (const optionId of picked) {
      const option = step.options.find((o) => o.id === optionId);
      if (!option?.scores) continue;
      for (const [key, value] of Object.entries(option.scores)) {
        scores[key as ScoreKey] += value ?? 0;
      }
    }
  }
  return scores;
}

export function collectTags(answers: Answers): string[] {
  const tags: string[] = [];
  for (const step of STEPS) {
    if (step.kind !== "question") continue;
    for (const optionId of answers[step.id] ?? []) {
      const option = step.options.find((o) => o.id === optionId);
      if (option?.tags) tags.push(...option.tags);
    }
  }
  return tags;
}

export type Cause = "nutricional" | "foliculo" | "hormonal";

export const CAUSES: Record<Cause, { label: string; body: string }> = {
  nutricional: {
    label: "Deficiência nutricional",
    body: "Suas respostas apresentam características frequentemente associadas à falta de matéria-prima para o fio — ferro, B12 e aminoácidos como cisteína.",
  },
  foliculo: {
    label: "Folículo pouco estimulado",
    body: "Suas respostas apontam para um folículo que precisa de estímulo local: crescimento lento, falhas e menor densidade na mesma região.",
  },
  hormonal: {
    label: "Alteração hormonal no couro cabeludo (DHT)",
    body: "Suas respostas apresentam características frequentemente associadas ao afinamento progressivo ligado à ação do DHT.",
  },
};

export function primaryCause(scores: Scores): Cause {
  const ranking: [Cause, number][] = [
    ["nutricional", scores.ferritin12],
    ["hormonal", scores.osa],
    ["foliculo", scores.tonico],
  ];
  ranking.sort((a, b) => b[1] - a[1]);
  return ranking[0]![0];
}

export type Protocol = {
  id: string;
  title: string;
  summary: string;
  main: Product;
  complements: Product[];
  kitName?: string;
  kitUrl?: string;
  kitPrice?: string;
  ctaUrl: string;
  cta: string;
};

export function resolveProtocol(scores: Scores, tags: string[]): Protocol {
  const { ferritin12, osa, tonico } = scores;
  const complements: Product[] = [];
  if (scores.vitaD >= 3) complements.push(PRODUCTS['vitaD']!);
  if (scores.anaPlus >= 4) complements.push(PRODUCTS['anaPlus']!);
  if (scores.glowOil >= 3) complements.push(PRODUCTS['glowOil']!);

  const wantsBoth = tags.includes("completo");
  const strong = [ferritin12, osa, tonico].filter((v) => v >= 6).length;

  // Protocolo completo: três frentes ativas e objetivo declarado amplo
  if (strong === 3 && wantsBoth) {
    return {
      id: "completo",
      title: "Protocolo completo Glow Up",
      summary:
        "Seu caso reúne sinais nas três frentes ao mesmo tempo: nutricional, hormonal e de estímulo local. Por isso o protocolo une o cuidado interno com o estímulo tópico.",
      main: PRODUCTS['ferritin12']!,
      complements: [PRODUCTS['osa']!, PRODUCTS['tonico']!, ...complements],
      kitName: KITS.glowUp.name,
      kitUrl: KITS.glowUp.url,
      kitPrice: KITS.glowUp.price,
      ctaUrl: KITS.glowUp.url,
      cta: "Quero começar meu protocolo",
    };
  }

  // Duas frentes internas: Ferrosa
  if (ferritin12 >= 6 && osa >= 6) {
    return {
      id: "ferrosa",
      title: "Protocolo Ferrosa — duas frentes ao mesmo tempo",
      summary:
        "Suas respostas mostram sinais tanto da frente nutricional quanto da frente hormonal. Tratar só uma delas costuma explicar por que o resultado trava no meio do caminho.",
      main: PRODUCTS['ferritin12']!,
      complements: [PRODUCTS['osa']!, ...(tonico >= 6 ? [PRODUCTS['tonico']!] : []), ...complements],
      kitName: KITS.ferrosa.name,
      kitUrl: KITS.ferrosa.url,
      kitPrice: KITS.ferrosa.price,
      ctaUrl: KITS.ferrosa.url,
      cta: "Ver meu protocolo Anagrow",
    };
  }

  const ranking: [ScoreKey, number][] = [
    ["ferritin12", ferritin12],
    ["osa", osa],
    ["tonico", tonico],
  ];
  ranking.sort((a, b) => b[1] - a[1]);
  const leadKey = ranking[0]![0];
  const secondKey = ranking[1]![0];
  const main = PRODUCTS[leadKey]!;
  const second = ranking[1]![1] >= 5 ? PRODUCTS[secondKey]! : null;

  const summaries: Record<ScoreKey | string, string> = {
    ferritin12:
      "O peso maior da sua análise ficou na frente nutricional: repor a matéria-prima do fio é o que tende a mudar primeiro no seu caso.",
    osa: "O peso maior da sua análise ficou na frente hormonal: proteger o folículo da ação do DHT é o passo mais coerente para o padrão que você descreveu.",
    tonico:
      "O peso maior da sua análise ficou no estímulo local: seu couro cabeludo pede ativação direta no folículo para preencher e acelerar o crescimento.",
  };

  return {
    id: leadKey,
    title: `Protocolo ${main.name}`,
    summary: summaries[leadKey]!,
    main,
    complements: [...(second ? [second] : []), ...complements],
    ctaUrl: main.url,
    cta: "Ver meu protocolo Anagrow",
  };
}

/** Chance estimada de melhora, coerente com as respostas (nunca aleatória). */
export function recoveryChance(answers: Answers, scores: Scores): number {
  let base = 72;
  const tempo = answers['tempo']?.[0];
  if (tempo === "lt3") base += 14;
  else if (tempo === "3a6") base += 10;
  else if (tempo === "gt1") base += 5;
  const total = scores.ferritin12 + scores.osa + scores.tonico;
  if (total >= 18) base += 3;
  if (answers['suplemento']?.[0] === "nao") base += 3;
  return Math.min(94, base);
}

export function highlights(answers: Answers, scores: Scores): string[] {
  const out: string[] = [];
  const label = (stepId: string) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (!step || step.kind !== "question") return null;
    const picked = answers[stepId]?.[0];
    return step.options.find((o) => o.id === picked)?.label ?? null;
  };

  const desc = label("descricao");
  if (desc) out.push(`Você descreveu seu cabelo hoje como: "${desc}".`);
  const tempo = label("tempo");
  if (tempo) out.push(`Isso acontece há ${tempo.toLowerCase()}.`);
  if (answers['exames']?.includes("nunca"))
    out.push("Ainda não investigou ferritina, B12 ou vitamina D em exames.");
  else if (answers['exames']?.length)
    out.push("Você já investigou parte dos seus marcadores em exames.");
  const meno = answers['menopausa']?.[0];
  if (meno === "sim" || meno === "peri")
    out.push("Há um contexto hormonal em andamento, que pesa no padrão de afinamento.");
  const couro = label("couro");
  if (couro) out.push(`Couro cabeludo ${couro.toLowerCase()}.`);
  const obj = label("objetivo");
  if (obj) out.push(`Seu objetivo declarado: ${obj.toLowerCase()}.`);
  if (scores.ferritin12 >= 6 && scores.osa >= 6)
    out.push("Suas respostas apontam sinais em duas frentes ao mesmo tempo.");
  return out.slice(0, 6);
}
