import { useRef, useState } from "react";
import { ChevronRight, ChevronLeft, X, Loader2, CheckCircle2 } from "lucide-react";
import { WALKTHROUGH_STEPS } from "./content";

/**
 * Full-screen, swipeable, one idea per tap — built for a thumb, not a
 * mouse. Deliberately a completely different layout from the desktop
 * tour (a spotlight-and-sidebar reading experience makes no sense on a
 * 375px-wide screen), sharing only the copy in content.tsx.
 */
export function WalkthroughMobile({
  step, setStep, onSkip, onDontShowAgain, saving,
}: {
  step: number; setStep: (n: number) => void; onSkip: () => void; onDontShowAgain: () => void; saving: boolean;
}) {
  const total = WALKTHROUGH_STEPS.length;
  const current = WALKTHROUGH_STEPS[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const Icon = current.icon;

  const touchStartX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  const goNext = () => { if (!isLast) setStep(step + 1); };
  const goPrev = () => { if (!isFirst) setStep(step - 1); };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; setDragX(0); };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    setDragX(e.touches[0].clientX - touchStartX.current);
  };
  const onTouchEnd = () => {
    if (Math.abs(dragX) > 48) { dragX < 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
    setDragX(0);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-royal text-primary-foreground overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      role="dialog"
      aria-modal="true"
      aria-label="App walkthrough"
    >
      {/* Top bar: progress dots + skip */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4 shrink-0">
        <div className="flex items-center gap-1.5">
          {WALKTHROUGH_STEPS.map((s, i) => (
            <button
              key={s.key}
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-gold" : "w-1.5 bg-primary-foreground/30"}`}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-foreground/70 hover:text-primary-foreground px-2 py-1"
        >
          Skip <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Swipeable content */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-6 pt-8 pb-4 flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: dragX ? `translateX(${dragX * 0.15}px)` : undefined }}
      >
        <div className="mx-auto grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-soft shadow-regal">
          <Icon className="h-10 w-10 text-onyx" />
        </div>

        <div className="mt-6 text-center text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
          {current.eyebrow}
        </div>
        <h2 className="mt-2 text-center font-display text-2xl font-bold leading-tight">
          {current.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85 text-center">
          {current.body}
        </p>

        <ul className="mt-6 space-y-2.5">
          {current.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 px-3.5 py-2.5">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
              <span className="text-xs leading-relaxed text-primary-foreground/90">{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 px-6 pb-6 pt-3 space-y-3">
        {isLast ? (
          <>
            <button
              onClick={onDontShowAgain}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 text-sm font-bold text-onyx hover:bg-gold-soft disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Don't show this again
            </button>
            <button onClick={onSkip} className="w-full text-center text-xs font-semibold text-primary-foreground/70 hover:text-primary-foreground py-1">
              Got it — see you next time
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-primary-foreground/25 px-4 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center text-[11px] text-primary-foreground/50 font-semibold tracking-widest">
              {step + 1} / {total}
            </div>
            <button
              onClick={goNext}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold px-5 py-3.5 text-sm font-bold text-onyx hover:bg-gold-soft"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
