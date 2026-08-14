import { MILESTONES } from "@/lib/quiz/config";

export function ProgressBar({ value }: { value: number }) {
  const milestone = [...MILESTONES].reverse().find((m) => value >= m.at) ?? MILESTONES[0]!;

  return (
    <div className="w-full">
      <div
        className="bg-border/60 h-px w-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da sua avaliação"
      >
        <div
          className="bg-primary h-px transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between text-[0.62rem] tracking-[0.2em] uppercase">
        <span className="text-muted-foreground">{milestone.label}</span>
        <span className="text-muted-foreground/70 tabular-nums">{Math.round(value)}%</span>
      </div>
    </div>
  );
}
