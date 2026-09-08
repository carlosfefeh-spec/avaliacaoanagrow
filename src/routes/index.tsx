import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProgressBar } from "@/components/quiz/ProgressBar";
import { OptionCard } from "@/components/quiz/OptionCard";
import {
  ChanceScreen,
  FindingsScreen,
  InfoScreen,
  InsightsScreen,
  Landing,
  MilestoneScreen,
  NameScreen,
  PhoneScreen,
  ProcessingScreen,
  ResultScreen,
  btnPrimary,
} from "@/components/quiz/screens";
import { MICRO_FEEDBACKS, STEPS, type Answers, type Step } from "@/lib/quiz/config";
import {
  CAUSES,
  collectTags,
  computeScores,
  ferritinReading,
  primaryCause,
  recoveryChance,
  resolveProtocol,
} from "@/lib/quiz/engine";
import {
  captureUtms,
  reopenFunnel,
  track,
  trackDropOff,
  trackFunnelComplete,
  trackOptionSelected,
  trackProgress,
  trackStepView,
} from "@/lib/quiz/analytics";
import { activeVariants, decorateMicroFeedback, getVariant, type Variant } from "@/lib/quiz/experiments";
import { sendLead } from "@/lib/quiz/lead.functions";
import { buildStoreUrl, quizId } from "@/lib/quiz/attribution";
import { clearState, loadState, saveState } from "@/lib/quiz/storage";

const TITLE = "Avaliação Capilar Anagrow — descubra a causa da sua queda";
const DESCRIPTION =
  "Em 2 minutos, responda uma avaliação guiada e descubra qual protocolo Anagrow combina com a causa da sua queda de cabelo.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resumable, setResumable] = useState<ReturnType<typeof loadState>>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const microCount = useRef(0);
  const [microVariant, setMicroVariant] = useState<Variant<"micro_v1">>("neutral");

  useEffect(() => {
    const assigned = getVariant("micro_v1");
    setMicroVariant(assigned);
    track("experiment_viewed", { experiment_id: "micro_v1", variant: assigned });
  }, []);

  const [steps, setSteps] = useState<Step[]>(STEPS);
  useEffect(() => {
    void loadDiagnosticSteps().then((loaded) => setSteps(loaded));
  }, []);
  const step = steps[index] ?? steps[steps.length - 1]!;
  const scores = useMemo(() => computeScores(answers), [answers]);
  const tags = useMemo(() => collectTags(answers), [answers]);

  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);
  const progress = useMemo(() => {
    const done = steps.slice(0, index).reduce((sum, s) => sum + s.weight, 0);
    return step.kind === "result" ? 100 : Math.round((done / totalWeight) * 100);
  }, [index, step.kind, steps, totalWeight]);

  /* Retomada de abandono */
  useEffect(() => {
    const saved = loadState();
    if (saved && saved.stepId !== "landing") setResumable(saved);
  }, []);

  /* Persistência + eventos */
  useEffect(() => {
    saveState({ stepId: step.id, answers, name, phone });
    track("quiz_question_viewed", { question_id: step.id, progress });
    trackStepView({
      stepId: step.id,
      stepIndex: index,
      stepKind: step.kind,
      totalSteps: steps.length,
      progress,
      phase: step.kind === "question" ? step.phase : undefined,
    });
    if (step.kind === "result") trackFunnelComplete({ progress: 100 });
    trackProgress(progress);
  }, [step, index, steps.length, answers, name, phone, progress]);

  useEffect(() => {
    const onLeave = () => {
      if (step.kind !== "result") {
        track("quiz_abandoned", { question_id: step.id, progress });
        trackDropOff("pagehide");
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (step.kind !== "result") trackDropOff("hidden");
      } else {
        reopenFunnel();
      }
    };
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [step, progress]);


  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const answersRef = useRef<Answers>(answers);
  answersRef.current = answers;

  const go = useCallback((delta: number) => {
    setFeedback(null);
    setIndex((i) => {
      const dir = delta >= 0 ? 1 : -1;
      let next = i;
      for (let s = 0; s < Math.abs(delta); s++) {
        next += dir;
        while (
          next > 0 &&
          next < STEPS.length - 1 &&
          STEPS[next]!.condition &&
          !STEPS[next]!.condition!(answersRef.current)
        ) {
          next += dir;
        }
      }
      return Math.min(STEPS.length - 1, Math.max(0, next));
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const showFeedbackThenAdvance = useCallback(
    (message: string | null) => {
      const base = message ?? MICRO_FEEDBACKS[Math.floor(Math.random() * MICRO_FEEDBACKS.length)]!;
      const text = decorateMicroFeedback(microVariant, base, microCount.current++);
      setFeedback(text);
      feedbackTimer.current = setTimeout(() => go(1), microVariant === "empathic" ? 1100 : 900);
    },
    [go, microVariant],
  );

  const answerSingle = (currentStep: Extract<Step, { kind: "question" }>, optionId: string) => {
    const next = { ...answers, [currentStep.id]: [optionId] };
    answersRef.current = next;
    setAnswers(next);
    track("quiz_answered", { question_id: currentStep.id, answer_id: optionId, progress });
    trackOptionSelected({
      questionId: currentStep.id,
      questionTitle: currentStep.title,
      optionId,
      optionLabel: currentStep.options.find((o) => o.id === optionId)?.label ?? optionId,
      type: "single",
      selectionIndex: 0,
      totalSelected: 1,
      progress,
    });
    const micro =
      typeof currentStep.microFeedback === "function"
        ? currentStep.microFeedback(next)
        : (currentStep.microFeedback ?? null);
    showFeedbackThenAdvance(micro);
  };


  const toggleMulti = (currentStep: Extract<Step, { kind: "question" }>, optionId: string) => {
    const option = currentStep.options.find((o) => o.id === optionId)!;
    const current = answers[currentStep.id] ?? [];
    let next: string[];
    if (option.exclusive) {
      next = current.includes(optionId) ? [] : [optionId];
    } else {
      const withoutExclusive = current.filter((id) => !currentStep.options.find((o) => o.id === id)?.exclusive);
      next = withoutExclusive.includes(optionId)
        ? withoutExclusive.filter((id) => id !== optionId)
        : [...withoutExclusive, optionId];
    }
    setAnswers({ ...answers, [currentStep.id]: next });
  };

  const resume = () => {
    if (!resumable) return;
    setAnswers(resumable.answers);
    setName(resumable.name);
    setPhone(resumable.phone);
    const target = STEPS.findIndex((s) => s.id === resumable.stepId);
    setIndex(target > 0 ? target : 1);
    setResumable(null);
    track("quiz_resumed", { question_id: resumable.stepId });
  };

  const submitLead = useServerFn(sendLead);

  const dispatchLead = useCallback(
    (phoneValue: string, optIn: boolean) => {
      const protocol = resolveProtocol(scores, tags);
      const cause = primaryCause(scores);
      const reading = ferritinReading(answers);
      const payload = {
        quizId: quizId(),
        storeUrl: buildStoreUrl(protocol.ctaUrl, {
          protocolId: protocol.id,
          cause: CAUSES[cause].label,
        }),
        name,
        phone: phoneValue,
        phoneDigits: phoneValue.replace(/\D/g, ""),
        marketingOptIn: optIn,
        answers,
        answersLabeled: labelAnswers(answers),
        scores: scores as unknown as Record<string, number>,
        tags,
        cause: CAUSES[cause].label,
        protocol: {
          id: protocol.id,
          title: protocol.title,
          main: protocol.main.name,
          complements: protocol.complements.map((p) => p.name),
        },
        recoveryChance: recoveryChance(answers, scores),
        ferritin: reading ? reading.range : null,
        utms: captureUtms(),
        variants: activeVariants(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        completedAt: new Date().toISOString(),
      };
      void submitLead({ data: payload })
        .then((res) => track("quiz_lead_sent", { ok: res.ok, status: res.status }))
        .catch(() => track("quiz_lead_failed"));
    },
    [answers, name, scores, tags, submitLead],
  );

  const restart = () => {
    clearState();
    setAnswers({});
    setName("");
    setPhone("");
    setIndex(0);
  };

  if (step.kind === "landing") {
    return (
      <main className="mx-auto max-w-[560px]">
        <Landing
          onStart={() => {
            track("quiz_started");
            go(1);
          }}
          onResume={resumable ? resume : undefined}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[560px] flex-col px-5 pt-4 pb-10">
      <header className="bg-background/95 sticky top-0 z-10 -mx-5 mb-8 px-5 pt-2 pb-3 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Voltar para a etapa anterior"
            className="text-muted-foreground hover:text-primary -ml-1 flex h-9 w-9 items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="font-display text-primary text-[0.8rem] tracking-[0.34em] uppercase">Anagrow</span>
          <span className="h-9 w-9" />
        </div>
        <ProgressBar value={progress} />
      </header>


      <div key={step.id} className="flex-1">
        {step.kind === "question" && (
          <QuestionScreen
            step={step}
            selected={answers[step.id] ?? []}
            feedback={feedback}
            onSingle={(id) => answerSingle(step, id)}
            onToggle={(id) => toggleMulti(step, id)}
            onContinue={() => {
              const picked = answers[step.id] ?? [];
              track("quiz_answered", {
                question_id: step.id,
                answer_id: picked.join(","),
                progress,
              });
              picked.forEach((id, i) =>
                trackOptionSelected({
                  questionId: step.id,
                  questionTitle: step.title,
                  optionId: id,
                  optionLabel: step.options.find((o) => o.id === id)?.label ?? id,
                  type: "multi",
                  selectionIndex: i,
                  totalSelected: picked.length,
                  progress,
                }),
              );
              const micro =
                typeof step.microFeedback === "function" ? step.microFeedback(answers) : (step.microFeedback ?? null);
              showFeedbackThenAdvance(micro);
            }}
          />
        )}

        {step.kind === "info" && <InfoScreen step={step} onNext={() => go(1)} />}
        {step.kind === "milestone" && <MilestoneScreen step={step} onNext={() => go(1)} />}
        {step.kind === "insights" && <InsightsScreen step={step} onDone={() => go(1)} />}
        {step.kind === "findings" && <FindingsScreen answers={answers} scores={scores} onNext={() => go(1)} />}
        {step.kind === "name" && (
          <NameScreen
            onSubmit={(value) => {
              setName(value);
              track("quiz_name_submitted");
              go(1);
            }}
          />
        )}
        {step.kind === "chance" && <ChanceScreen answers={answers} scores={scores} name={name} onNext={() => go(1)} />}
        {step.kind === "phone" && (
          <PhoneScreen
            name={name}
            onSubmit={(value, optIn) => {
              setPhone(value);
              track("quiz_phone_submitted", { marketing_opt_in: optIn });
              track("quiz_completed", { progress: 100 });
              dispatchLead(value, optIn);
              go(1);
            }}
          />
        )}
        {step.kind === "processing" && <ProcessingScreen name={name} onDone={() => go(1)} />}
        {step.kind === "result" && (
          <ResultView answers={answers} scores={scores} tags={tags} name={name} onRestart={restart} />
        )}
      </div>
    </main>
  );
}

function ResultView(props: React.ComponentProps<typeof ResultScreen>) {
  useEffect(() => {
    track("quiz_result_viewed");
    track("quiz_protocol_recommended");
  }, []);
  return <ResultScreen {...props} />;
}

function QuestionScreen({
  step,
  selected,
  feedback,
  onSingle,
  onToggle,
  onContinue,
}: {
  step: Extract<Step, { kind: "question" }>;
  selected: string[];
  feedback: string | null;
  onSingle: (id: string) => void;
  onToggle: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="animate-enter">
      <p className="text-muted-foreground mb-3 text-[0.64rem] font-medium tracking-[0.24em] uppercase">{step.phase}</p>
      <h1 className="font-display text-[1.8rem] leading-[1.15] font-normal text-balance">{step.title}</h1>
      {step.subtitle && <p className="text-muted-foreground mt-3 text-[0.95rem] leading-relaxed">{step.subtitle}</p>}

      <div className="mt-8 space-y-3" role={step.type === "single" ? "radiogroup" : "group"}>
        {step.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            multi={step.type === "multi"}
            selected={selected.includes(option.id)}
            onSelect={() => (step.type === "single" ? onSingle(option.id) : onToggle(option.id))}
          />
        ))}
      </div>

      {step.type === "multi" && (
        <button className={`${btnPrimary} mt-8`} disabled={selected.length === 0} onClick={onContinue}>
          Continuar
        </button>
      )}
    </div>
  );

}

function labelAnswers(answers: Answers): { question: string; answers: string[] }[] {
  const out: { question: string; answers: string[] }[] = [];
  for (const step of STEPS) {
    if (step.kind !== "question") continue;
    const picked = answers[step.id];
    if (!picked?.length) continue;
    out.push({
      question: step.title,
      answers: picked.map((id) => step.options.find((o) => o.id === id)?.label ?? id),
    });
  }
  return out;
}
