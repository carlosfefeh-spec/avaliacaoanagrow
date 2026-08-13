import type { Option } from "@/lib/quiz/config";

function Glyph({ name }: { name?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
      {name === "drop" && <path d="M12 3s5 5.7 5 9.3A5 5 0 0 1 7 12.3C7 8.7 12 3 12 3Z" />}
      {name === "strand" && <path d="M8 3c0 5 8 5 8 10a4 4 0 0 1-8 0M12 3v18" />}
      {name === "spark" && (
        <path d="M12 4v6m0 4v6M4 12h6m4 0h6M6.5 6.5l3 3m5 5 3 3m0-11-3 3m-5 5-3 3" />
      )}
      {name === "wave" && <path d="M3 9c3-4 6 4 9 0s6-4 9 0M3 16c3-4 6 4 9 0s6-4 9 0" />}
      {name === "dots" && <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth={2.2} />}
    </svg>
  );
}

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
        "group flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200",
        "min-h-[62px] active:scale-[0.99]",
        selected
          ? "border-primary bg-primary text-primary-foreground animate-pop shadow-[0_10px_30px_-12px_oklch(0.35_0.115_12/0.55)]"
          : "surface hover:border-primary/40 hover:bg-secondary/60",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground"
            : "border-border text-primary/70",
          multi && !option.icon ? "rounded-md" : "",
        ].join(" ")}
        aria-hidden="true"
      >
        {option.icon ? (
          <Glyph name={option.icon} />
        ) : selected ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4}>
            <path d="m5 12.5 4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="bg-border/70 h-2 w-2 rounded-full" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.98rem] leading-snug font-semibold">{option.label}</span>
        {option.hint && (
          <span
            className={[
              "mt-0.5 block text-[0.8rem] leading-snug",
              selected ? "text-primary-foreground/75" : "text-muted-foreground",
            ].join(" ")}
          >
            {option.hint}
          </span>
        )}
      </span>
    </button>
  );
}
