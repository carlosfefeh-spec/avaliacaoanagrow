import logoAsset from "@/assets/logo-anagrow.png.asset.json";
import { ProgressBar } from "@/components/quiz/ProgressBar";

export function QuizHeader({
  logoUrl,
  progress,
  onBack,
}: {
  logoUrl?: string | undefined;
  progress?: number | undefined;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card">
      <div className="relative mx-auto flex h-[85px] max-w-[640px] items-center justify-center px-6 sm:px-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar para a etapa anterior"
            className="text-muted-foreground hover:text-primary absolute left-6 flex h-11 w-11 items-center justify-center rounded-lg transition-colors sm:left-10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <img src={logoUrl || logoAsset.url} alt="Anagrow" className="h-9 max-w-[180px] object-contain" />
      </div>
      {progress !== undefined && <ProgressBar value={progress} />}
    </header>
  );
}