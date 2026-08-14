import type { Option } from "@/lib/quiz/config";

export function OptionCard({
  option,
  selected,
  multi,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  multi: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "group flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left",
        "min-h-[64px] transition-colors duration-150 active:scale-[0.995]",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/70 bg-card hover:border-primary/50 hover:bg-secondary/50",
      ].join(" ")}
    >
      <span className="min-w-0">
        <span className="block text-[1rem] leading-snug font-medium">{option.label}</span>
        {option.hint && (
          <span
            className={[
              "mt-1 block text-[0.82rem] leading-snug",
              selected ? "text-primary-foreground/70" : "text-muted-foreground",
            ].join(" ")}
          >
            {option.hint}
          </span>
        )}
      </span>

      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
          multi ? "rounded-[4px]" : "rounded-full",
          selected ? "border-primary-foreground bg-primary-foreground/15" : "border-border",
        ].join(" ")}
        aria-hidden="true"
      >
        {selected && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="m5 12.5 4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
