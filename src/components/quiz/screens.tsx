import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Answers, Scores, Step } from "@/lib/quiz/config";
import {
  CAUSES,
  ferritinReading,
  highlights,
  primaryCause,
  recoveryChance,
  resolveProtocol,
  type Cause,
} from "@/lib/quiz/engine";
import { isValidBrPhone, maskPhone } from "@/lib/quiz/phone";
import { useTap } from "@/lib/quiz/tap";
import { track, trackEcommerce } from "@/lib/quiz/analytics";
import { buildStoreUrl } from "@/lib/quiz/attribution";
import { CTA_COPY, LANDING_COPY, LOADER_COPY, WHY_BLOCKS, getVariant, type Variant } from "@/lib/quiz/experiments";
import { useCustomization, useFinalFields } from "@/lib/quiz/customization";

export const btnPrimary =
  "inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-[0.95rem] font-medium tracking-[0.02em] text-primary-foreground transition-transform duration-200 hover:brightness-110 active:scale-[0.985] disabled:opacity-30 disabled:active:scale-100";

export const btnGhost =
  "inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3.5 text-sm font-medium text-primary transition-colors hover:bg-secondary";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-3 text-[0.64rem] font-medium tracking-[0.24em] uppercase">{children}</p>
  );
}


/* ---------------------------------------------------------------- Landing */

export function Landing({ onStart, onResume }: { onStart: () => void; onResume?: (() => void) | undefined }) {
  const [variant, setVariant] = useState<Variant<"landing_v1">>("control");
  const custom = useCustomization();

  useEffect(() => {
    const assigned = getVariant("landing_v1");
    setVariant(assigned);
    track("experiment_viewed", { experiment_id: "landing_v1", variant: assigned });
  }, []);

  const base = LANDING_COPY[variant];
  const l = custom.landing;
  const copy = {
    badge: l.badge || base.badge,
    headline: l.title || base.headline,
    subhead: l.subtitle || base.subhead,
    cta: l.cta || base.cta,
    bullets: base.bullets,
  };
  const startTap = useTap(onStart);

  return (
    <div className="animate-enter flex min-h-[100svh] flex-col justify-between px-5 pt-10 pb-8">
      <div>
        {custom.theme.logoUrl ? (
          <img src={custom.theme.logoUrl} alt="Anagrow" className="h-8 w-auto" />
        ) : (
          <>
            <p className="font-display text-primary text-[1.05rem] tracking-[0.32em] uppercase">Anagrow</p>
            <div className="bg-primary/15 mt-1 h-px w-14" />
          </>
        )}
      </div>

      <div className="py-8">
        <span className="border-primary/20 bg-secondary text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold">
          <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          {copy.badge}
        </span>
        <h1 className="font-display mt-6 text-[2.5rem] leading-[1.04] font-normal text-balance">{copy.headline}</h1>
        <p className="text-muted-foreground mt-4 text-[1rem] leading-relaxed">{copy.subhead}</p>
        {l.mediaUrl && l.mediaKind === "video" && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-3xl">
            <iframe
              src={l.mediaUrl}
              title="Vídeo de apresentação"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}
        {l.mediaUrl && l.mediaKind !== "video" && (
          <img src={l.mediaUrl} alt="" className="mt-6 w-full rounded-3xl object-cover" />
        )}
        {l.body && <p className="text-muted-foreground mt-4 text-[0.95rem] leading-relaxed">{l.body}</p>}
        <ul className="mt-6 space-y-2.5">
          {copy.bullets.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[0.92rem]">
              <Check />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <button
          className={btnPrimary}
          style={l.ctaColor ? { backgroundColor: l.ctaColor } : undefined}
          {...startTap}
        >
          {copy.cta}
        </button>
        {onResume && (
          <button className={btnGhost} onClick={onResume}>
            Continuar de onde parei
          </button>
        )}
        <p className="text-muted-foreground text-center text-[0.72rem] leading-relaxed">
          Conteúdo educativo e de orientação de produtos. Não substitui avaliação profissional.
        </p>
      </div>
    </div>
  );
}


function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="text-primary mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden="true"
    >
      <path d="m5 12.5 4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------ Info screen */

export function InfoScreen({ step, onNext }: { step: Extract<Step, { kind: "info" }>; onNext: () => void }) {
  const nextTap = useTap(onNext);
  return (
    <div className="animate-enter">
      {step.eyebrow && <Eyebrow>{step.eyebrow}</Eyebrow>}
      <h2 className="font-display text-[1.8rem] leading-[1.15] font-normal text-balance">{step.title}</h2>
      {step.body && <p className="text-muted-foreground mt-4 leading-relaxed">{step.body}</p>}
      <button className={`${btnPrimary} mt-8`} {...nextTap}>
        {step.cta}
      </button>
    </div>
  );
}

export function MilestoneScreen({ step, onNext }: { step: Extract<Step, { kind: "milestone" }>; onNext: () => void }) {
  const nextTap = useTap(onNext);
  return (
    <div className="animate-enter">
      <div className="surface rounded-3xl p-6">
        <Eyebrow>Um detalhe importante</Eyebrow>
        {step.highlight && (
          <span className="bg-primary/10 text-primary mb-3 inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide uppercase">
            {step.highlight}
          </span>
        )}
        <h2 className="font-display text-[1.6rem] leading-[1.18] font-normal text-balance">{step.title}</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">{step.body}</p>
      </div>
      <button className={`${btnPrimary} mt-6`} {...nextTap}>
        Continuar
      </button>
    </div>
  );
}

/* -------------------------------------------------------- Insights loader */

export function InsightsScreen({ step, onDone }: { step: Extract<Step, { kind: "insights" }>; onDone: () => void }) {
  const variant = getVariant("loader_v1");
  const copy = LOADER_COPY[variant];
  const insights = copy.insights ?? step.insights;

  const [shown, setShown] = useState(1);
  const total = insights.length;

  useEffect(() => {
    track("quiz_loader_start", { loader_messages: total });
  }, [total]);

  useEffect(() => {
    if (shown >= total) {
      const done = setTimeout(() => {
        track("quiz_loader_complete", { loader_messages: total });
        onDone();
      }, copy.hold);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setShown((n) => n + 1), copy.pace(shown - 1));
    return () => clearTimeout(timer);
  }, [shown, total, onDone, copy]);

  const pct = Math.round((shown / total) * 83);
  const status = copy.status?.(shown, total) ?? null;

  return (
    <div className="animate-enter" aria-live="polite">
      <Eyebrow>{step.subtitle}</Eyebrow>
      <h2 className="font-display text-[1.75rem] leading-[1.16] font-normal text-balance">{step.title}</h2>

      <div className="bg-sand relative mt-6 h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div className="shimmer pointer-events-none absolute inset-0" />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="text-muted-foreground text-sm tabular-nums">{pct}%</p>
        {status && (
          <p key={status} className="text-primary animate-fade-in text-sm font-medium">
            {status}
          </p>
        )}
      </div>

      <ul className="mt-7 space-y-3">
        {insights.slice(0, shown).map((insight) => (
          <li
            key={insight}
            className="surface animate-enter flex items-start gap-3 rounded-2xl px-4 py-3.5 text-[0.92rem] leading-snug"
          >
            <Check />
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------- Achados (T11) */

export function FindingsScreen({ answers, scores, onNext }: { answers: Answers; scores: Scores; onNext: () => void }) {
  const nextTap = useTap(onNext);
  const cause = primaryCause(scores);
  const list = highlights(answers, scores).slice(0, 4);
  const order: Cause[] = ["nutricional", "foliculo", "hormonal"];

  return (
    <div className="animate-enter">
      <Eyebrow>Encontramos alguns sinais importantes</Eyebrow>
      <h2 className="font-display text-[1.75rem] leading-[1.16] font-normal text-balance">
        Pelas suas respostas, sua queda parece estar relacionada principalmente a:
      </h2>

      <ul className="mt-5 space-y-2.5">
        {order.map((key) => {
          const active = key === cause;
          return (
            <li
              key={key}
              className={[
                "rounded-2xl border px-4 py-3.5 transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "surface text-muted-foreground",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    active ? "border-primary-foreground" : "border-border",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {active && <span className="bg-primary-foreground h-2 w-2 rounded-full" />}
                </span>
                <span className="text-[0.95rem] font-semibold">{CAUSES[key].label}</span>
              </div>
              {active && (
                <p className="text-primary-foreground/85 mt-2 text-[0.86rem] leading-snug">{CAUSES[key].body}</p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="surface mt-5 rounded-2xl p-4">
        <p className="text-primary/70 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
          O que pesou nessa leitura
        </p>
        <ul className="mt-3 space-y-2">
          {list.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[0.88rem] leading-snug">
              <Check />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className={`${btnPrimary} mt-6`} {...nextTap}>
        Continuar
      </button>
    </div>
  );
}

/* ------------------------------------------------- Chance de recuperação */

export function ChanceScreen({
  answers,
  scores,
  name,
  onNext,
}: {
  answers: Answers;
  scores: Scores;
  name: string;
  onNext: () => void;
}) {
  const target = recoveryChance(answers, scores);
  const [value, setValue] = useState(0);
  const nextTap = useTap(onNext);

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      setValue((v) => (v >= target ? target : Math.min(target, v + Math.ceil(target / 26))));
      if (frame > 40) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="animate-enter">
      <Eyebrow>Antes do protocolo</Eyebrow>
      <h2 className="font-display text-[1.75rem] leading-[1.16] font-normal text-balance">
        {name ? `${name}, calculamos` : "Calculamos"} sua chance de recuperação.
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        Estimativa baseada no tempo de evolução e nos sinais que você relatou.
      </p>

      <div className="surface mt-7 flex flex-col items-center rounded-3xl px-6 py-8">
        <div
          className="text-primary font-display text-[3.6rem] leading-none font-semibold tabular-nums"
          aria-live="polite"
        >
          {value}%
        </div>
        <p className="text-muted-foreground mt-2 text-center text-[0.9rem]">
          de probabilidade de melhora com um tratamento direcionado e contínuo
        </p>
        <div className="bg-sand mt-5 h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>

      <button className={`${btnPrimary} mt-6`} {...nextTap}>
        Continuar
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ Nome */

export function NameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const custom = useCustomization();
  const field = useFinalFields().find((f) => f.key === "name");

  return (
    <form
      className="animate-enter"
      onSubmit={(e) => {
        e.preventDefault();
        const clean = value.trim();
        if (clean.length < 2) {
          setError("Escreva pelo menos 2 letras para eu saber como te chamar.");
          return;
        }
        setError("");
        onSubmit(clean);
      }}
    >
      <Eyebrow>Personalizando sua análise</Eyebrow>
      <h2 className="font-display text-[1.75rem] leading-[1.16] font-normal text-balance">
        {custom.final.title || "Já entendi bastante coisa sobre o seu caso."}
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        {custom.final.body || "Antes de montar seu resultado, como posso te chamar?"}
      </p>

      <label htmlFor="quiz-name" className="sr-only">
        {field?.label ?? "Seu primeiro nome"}
      </label>
      <input
        id="quiz-name"
        autoFocus
        autoComplete="given-name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={field?.placeholder || "Seu primeiro nome"}
        aria-invalid={!!error}
        aria-describedby={error ? "quiz-name-error" : undefined}
        className="surface mt-6 w-full rounded-2xl px-4 py-4 text-[1rem] outline-none focus:border-primary"
      />
      {error && (
        <p id="quiz-name-error" role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}

      <button type="submit" className={`${btnPrimary} mt-6`}>
        Continuar
      </button>
    </form>
  );
}

/* -------------------------------------------------------------- WhatsApp */

export function PhoneScreen({
  name,
  onSubmit,
}: {
  name: string;
  onSubmit: (phone: string, optIn: boolean, email: string | null) => void;
}) {
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState("");
  const custom = useCustomization();
  const fields = useFinalFields();
  const phoneField = fields.find((f) => f.key === "phone" && f.enabled);
  const emailField = fields.find((f) => f.key === "email" && f.enabled);
  const optInField = fields.find((f) => f.key === "optIn" && f.enabled);
  const ordered = fields.filter((f) => f.enabled && f.key !== "name");

  const phoneBlock = phoneField && (
    <div key="phone">
      <label htmlFor="quiz-phone" className="sr-only">
        {phoneField.label}
      </label>
      <input
        id="quiz-phone"
        inputMode="numeric"
        autoComplete="tel-national"
        value={value}
        onChange={(e) => setValue(maskPhone(e.target.value))}
        placeholder={phoneField.placeholder || "(11) 99999-9999"}
        aria-invalid={!!error}
        aria-describedby={error ? "quiz-phone-error" : "quiz-phone-help"}
        className="surface mt-6 w-full rounded-2xl px-4 py-4 text-[1rem] tracking-wide outline-none focus:border-primary"
      />
      {error && (
        <p id="quiz-phone-error" role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
      <p id="quiz-phone-help" className="text-muted-foreground mt-3 text-[0.78rem] leading-relaxed">
        Usaremos esse número para enviar o seu resultado, conforme a política de privacidade da Anagrow.
      </p>
    </div>
  );

  const emailBlock = emailField && (
    <div key="email">
      <label htmlFor="quiz-email" className="text-muted-foreground mt-6 block text-[0.82rem]">
        {emailField.label}
      </label>
      <input
        id="quiz-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={emailField.placeholder || "seu@email.com"}
        aria-invalid={!!emailError}
        className="surface focus:border-primary mt-2 w-full rounded-2xl px-4 py-4 text-[1rem] outline-none"
      />
      {emailError && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {emailError}
        </p>
      )}
    </div>
  );

  const optInBlock = optInField && (
    <label key="optIn" className="mt-4 flex cursor-pointer items-start gap-3 text-[0.82rem] leading-snug">
      <input
        type="checkbox"
        checked={optIn}
        onChange={(e) => setOptIn(e.target.checked)}
        className="accent-primary mt-0.5 h-4 w-4"
      />
      <span className="text-muted-foreground">{optInField.label}</span>
    </label>
  );

  const blocks: Record<string, React.ReactNode> = {
    phone: phoneBlock,
    email: emailBlock,
    optIn: optInBlock,
  };

  return (
    <form
      className="animate-enter"
      onSubmit={(e) => {
        e.preventDefault();
        if (phoneField && (phoneField.required !== false || value.trim()) && !isValidBrPhone(value)) {
          setError("Confira o número: precisa ter DDD e 9 dígitos.");
          return;
        }
        const mail = email.trim();
        if (emailField?.required && !mail) {
          setEmailError("Informe seu e-mail para receber o diagnóstico.");
          return;
        }
        if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
          setEmailError("Confira o e-mail digitado.");
          return;
        }
        setError("");
        setEmailError("");
        onSubmit(value, optIn, mail || null);
      }}
    >
      <Eyebrow>Último passo</Eyebrow>
      <h2 className="font-display text-[1.75rem] leading-[1.16] font-normal text-balance">
        {custom.final.thanks || `Seu resultado está quase pronto${name ? `, ${name}` : ""}.`}
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        Para você conseguir consultar sua análise depois, qual WhatsApp prefere usar?
      </p>

      {ordered.map((f) => blocks[f.key])}

      <button type="submit" className={`${btnPrimary} mt-6`}>
        {custom.final.button || "Ver meu resultado"}
      </button>
    </form>
  );
}


/* ---------------------------------------------------------- Processamento */

const PROCESS_ITEMS = [
  "Padrão de queda analisado",
  "Tempo de evolução considerado",
  "Contexto hormonal avaliado",
  "Sinais nutricionais cruzados",
  "Perfil comparado às soluções Anagrow",
];

export function ProcessingScreen({ name, onDone }: { name: string; onDone: () => void }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= PROCESS_ITEMS.length) {
      const end = setTimeout(onDone, 700);
      return () => clearTimeout(end);
    }
    const timer = setTimeout(() => setDone((n) => n + 1), 620);
    return () => clearTimeout(timer);
  }, [done, onDone]);

  return (
    <div className="animate-enter" aria-live="polite">
      <Eyebrow>Analisando suas respostas</Eyebrow>
      <h2 className="font-display text-[1.75rem] leading-[1.16] font-normal text-balance">
        {name ? `${name}, ` : ""}estamos montando o seu perfil.
      </h2>

      <ul className="mt-7 space-y-3">
        {PROCESS_ITEMS.map((item, i) => {
          const ready = i < done;
          return (
            <li
              key={item}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.92rem] transition-all duration-300",
                ready ? "surface" : "border border-dashed border-border/70 opacity-45",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  ready ? "bg-primary text-primary-foreground animate-pop" : "bg-sand",
                ].join(" ")}
                aria-hidden="true"
              >
                {ready && (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="m5 12.5 4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- Result */

export function ResultScreen({
  answers,
  scores,
  tags,
  name,
  onRestart,
}: {
  answers: Answers;
  scores: Scores;
  tags: string[];
  name: string;
  onRestart: () => void;
}) {
  const cause = primaryCause(scores);
  const protocol = resolveProtocol(scores, tags);
  const chance = recoveryChance(answers, scores);
  const list = highlights(answers, scores);
  const ferritin = ferritinReading(answers);
  const custom = useCustomization();
  const rc = custom.results[protocol.id] ?? {};

  const FERRITIN_FILL: Record<string, number> = {
    critico: 18,
    baixo: 38,
    limitrofe: 68,
    ideal: 100,
    desconhecido: 8,
  };

  const [ctaVariant, setCtaVariant] = useState<Variant<"cta_v1">>("control");
  const [whyVariant, setWhyVariant] = useState<Variant<"why_v1">>("single");
  const [storeUrl, setStoreUrl] = useState(protocol.ctaUrl);
  const ecommerceItems = [
    { item_id: protocol.id, item_name: protocol.title, item_category: CAUSES[cause].label },
    ...protocol.complements.map((p) => ({
      item_id: p.name,
      item_name: p.name,
      item_category: "complemento",
    })),
  ];
  useEffect(() => {
    const assigned = getVariant("cta_v1");
    setCtaVariant(assigned);
    track("experiment_viewed", { experiment_id: "cta_v1", variant: assigned });
    const why = getVariant("why_v1");
    setWhyVariant(why);
    track("experiment_viewed", { experiment_id: "why_v1", variant: why });
    track("quiz_sticky_cta_shown", { variant: assigned });
    setStoreUrl(
      buildStoreUrl(protocol.ctaUrl, {
        protocolId: protocol.id,
        cause: CAUSES[cause].label,
        variantSuffix: assigned,
      }),
    );
    trackEcommerce("view_item", ecommerceItems, {
      item_list_id: "quiz_result",
      item_list_name: "Protocolo recomendado",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ctaCopy = CTA_COPY[ctaVariant];
  const causeLabel = CAUSES[cause].label;
  const whyBlocks = WHY_BLOCKS[whyVariant]({
    causeLabel,
    causeBody: CAUSES[cause].body,
    productName: protocol.main.name,
    productRole: protocol.main.role,
    chance,
  });

  /* Mobile-first: CTA flutuante entra a partir do primeiro scroll */
  const [ctaFloating, setCtaFloating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ctaShownRef = useRef(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight > 80;
      const visible = !scrollable || window.scrollY > 24;
      setCtaFloating(visible);
      if (visible && !ctaShownRef.current) {
        ctaShownRef.current = true;
        track("quiz_sticky_cta_visible", { trigger: "scroll" });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const floatingBar = (
    <div
      className={`border-border/60 bg-background/95 fixed inset-x-0 bottom-0 z-50 border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_28px_-18px_hsl(var(--foreground)/0.45)] backdrop-blur transition-transform duration-300 ease-out will-change-transform ${
        ctaFloating ? "translate-y-0" : "pointer-events-none translate-y-[130%]"
      }`}
      aria-hidden={!ctaFloating}
    >
      <div className="mx-auto max-w-[560px]">
        {ctaCopy.context && (
          <p className="text-foreground mb-2.5 line-clamp-2 text-center text-[0.8rem] leading-snug font-medium">
            {ctaCopy.context(causeLabel, chance)}
          </p>
        )}
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${ctaCopy.label(protocol.cta, causeLabel)} — abre em nova aba`}
          className={
            ctaCopy.highlight
              ? `${btnPrimary} shadow-primary/25 animate-pulse-soft min-h-[56px] touch-manipulation py-[1.15rem] shadow-xl transition-transform select-none active:scale-[0.985]`
              : `${btnPrimary} min-h-[56px] touch-manipulation py-[1.15rem] transition-transform select-none active:scale-[0.985]`
          }
          onClick={() => {
            track("quiz_cta_clicked", {
              recommended_protocol: protocol.id,
              recommended_product: protocol.main.name,
              url: storeUrl,
              cta_label: ctaCopy.label(protocol.cta, causeLabel),
            });
            trackEcommerce("select_item", ecommerceItems, {
              item_list_id: "quiz_result",
              item_list_name: "Protocolo recomendado",
            });
            trackEcommerce("begin_checkout", ecommerceItems);
          }}
        >
          <span>{ctaCopy.label(protocol.cta, causeLabel)}</span>
          <svg
            viewBox="0 0 24 24"
            className="ml-1.5 h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M17 7H9M17 7v8" />
          </svg>
        </a>
      </div>
    </div>
  );

  return (
    <>
      <div className="animate-enter pb-28">
        <Eyebrow>Resultado da sua avaliação</Eyebrow>
        <h2 className="text-[1.7rem] leading-[1.15] font-semibold text-balance">Seu Plano Capilar</h2>
        <p className="text-muted-foreground mt-3 text-[0.95rem] leading-relaxed">
          Criado com base nos seus objetivos e preferências. Um Tricologista vai revisar seu tratamento após a compra
          para confirmar que é o ideal para você.
        </p>
        <div className="border-primary/20 bg-primary text-primary-foreground mt-5 rounded-3xl border p-6">
          <p className="text-primary-foreground/70 text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
            Direção principal
          </p>
          <p className="font-display mt-2 text-[1.4rem] leading-tight font-semibold">{CAUSES[cause].label}</p>
          <p className="text-primary-foreground/85 mt-3 text-[0.9rem] leading-relaxed">{CAUSES[cause].body}</p>
          <div className="border-primary-foreground/20 mt-5 flex items-center gap-3 border-t pt-4">
            <span className="font-display text-[1.7rem] leading-none font-semibold tabular-nums">{chance}%</span>
            <span className="text-primary-foreground/80 text-[0.82rem] leading-snug">
              de chance estimada de melhora com tratamento direcionado e contínuo
            </span>
          </div>
        </div>

        <section className="mt-7">
          <h3 className="text-[1.15rem] font-semibold">O que chamou nossa atenção</h3>
          <ul className="mt-3 space-y-2.5">
            {list.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[0.92rem] leading-snug">
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {ferritin && (
          <section className="mt-8">
            <h3 className="text-[1.15rem] font-semibold">Sua leitura de ferritina</h3>
            <article className="border-primary/20 bg-primary/[0.05] mt-3 rounded-3xl border p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
                  {ferritin.range}
                </span>
                <span className="text-muted-foreground text-[0.78rem]">Referência capilar: 150 ng/mL</span>
              </div>

              <p className="mt-3 text-[1.02rem] font-semibold">{ferritin.status}</p>

              <div className="mt-4">
                <div className="bg-primary/10 relative h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${FERRITIN_FILL[ferritin.level]}%` }}
                  />
                </div>
                <div className="text-muted-foreground mt-1.5 flex justify-between text-[0.7rem]">
                  <span>0</span>
                  <span>150 ng/mL — ideal para o fio</span>
                </div>
              </div>

              <p className="mt-4 text-[0.9rem] leading-relaxed">{ferritin.meaning}</p>

              <div className="border-primary/15 mt-4 border-t pt-4">
                <p className="text-primary text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
                  O que fazer agora
                </p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed">{ferritin.nextStep}</p>
              </div>
            </article>
          </section>
        )}

        <section className="mt-8">
          <h3 className="text-[1.15rem] font-semibold">Por isso, sua recomendação é:</h3>
          <p className="text-muted-foreground mt-2 text-[0.92rem] leading-relaxed">{protocol.summary}</p>

          <div className="mt-4 space-y-3">
            {whyBlocks.map((block) => (
              <article key={block.title} className="border-primary/15 bg-primary/[0.04] rounded-3xl border p-5">
                <p className="text-primary text-[0.68rem] font-semibold tracking-[0.2em] uppercase">Por quê</p>
                <p className="mt-1.5 text-[1.02rem] font-semibold">{block.title}</p>
                <p className="text-muted-foreground mt-2 text-[0.9rem] leading-relaxed">{block.body}</p>
              </article>
            ))}
          </div>

          <article className="surface mt-4 rounded-3xl p-5">
            <p className="text-primary/60 text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
              Seu Protocolo principal
            </p>
            <p className="font-display mt-1 text-[1.25rem] font-semibold">{protocol.main.name}</p>
            <p className="text-muted-foreground mt-1 text-[0.85rem] leading-relaxed">
              Os principais produtos para combater a queda de cabelo.
            </p>
            <p className="text-muted-foreground mt-1 text-[0.85rem]">{protocol.main.short}</p>
            <p className="mt-3 text-[0.9rem] leading-relaxed">{protocol.main.role}</p>
            <p className="text-muted-foreground mt-3 text-[0.8rem]">{protocol.main.usage}</p>
          </article>

          {protocol.complements.map((product) => (
            <article key={product.id} className="surface mt-3 rounded-3xl p-5">
              <p className="text-primary/60 text-[0.68rem] font-semibold tracking-[0.2em] uppercase">Complemento</p>
              <p className="font-display mt-1 text-[1.15rem] font-semibold">{product.name}</p>
              <p className="mt-2 text-[0.88rem] leading-relaxed">{product.role}</p>
              <p className="text-muted-foreground mt-2 text-[0.8rem]">{product.usage}</p>
            </article>
          ))}
        </section>

        <p className="text-muted-foreground mt-8 text-[0.75rem] leading-relaxed">
          Esta avaliação é uma orientação de produtos e não constitui diagnóstico médico. Em caso de gestação,
          amamentação, uso de medicamentos ou condições de saúde, consulte um profissional antes de iniciar qualquer
          suplementação.
        </p>
      </div>
      {mounted ? createPortal(floatingBar, document.body) : null}
    </>
  );
}
