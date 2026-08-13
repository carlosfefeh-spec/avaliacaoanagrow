import { MILESTONES } from "@/lib/quiz/config";

export function ProgressBar({ value }: { value: number }) {
  const milestone = [...MILESTONES].reverse().find((m) => value >= m.at) ?? MILESTONES[0]!;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between text-[0.7rem] tracking-[0.18em] uppercase">
        <span className="text-primary/70">{milestone.label}</span>
        <span className="text-muted-foreground tabular-nums">{Math.round(value)}%</span>
      </div>
      <div
        className="bg-sand h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da sua avaliação"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
    </div>
  );
}
