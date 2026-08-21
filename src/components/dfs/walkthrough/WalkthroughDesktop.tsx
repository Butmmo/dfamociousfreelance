import { useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, X, Loader2, CheckCircle2 } from "lucide-react";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { WALKTHROUGH_STEPS } from "./content";

/**
 * A reading experience, not a swipe deck — a sidebar of every step (click
 * any one directly) beside a large content pane, the way a desktop has
 * room for. Skip and "Don't show this again" are always visible in the
 * footer here, unlike mobile which only surfaces that choice at the end;
 * a mouse-and-keyboard session can afford to offer the exit at every step.
 */
export function WalkthroughDesktop({
  step, setStep, onSkip, onDontShowAgain, saving,
}: {
  step: number; setStep: (n: number) => void; onSkip: () => void; onDontShowAgain: () => void; saving: boolean;
}) {
  const total = WALKTHROUGH_STEPS.length;
  const current = WALKTHROUGH_STEPS[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const Icon = current.icon;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { containerRef.current?.focus(); }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 backdrop-blur-sm p-6 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label="App walkthrough"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" && !isLast) setStep(step + 1);
        if (e.key === "ArrowLeft" && !isFirst) setStep(step - 1);
        if (e.key === "Escape") onSkip();
      }}
      tabIndex={-1}
    >
      <div className="flex w-full max-w-5xl h-[42rem] max-h-[88vh] overflow-hidden rounded-3xl border border-gold bg-card shadow-regal">
        {/* Sidebar */}
        <div className="w-72 shrink-0 bg-royal text-primary-foreground flex flex-col p-6">
          <div className="flex items-center gap-2.5">
            <DfsMark className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">DBI Citadel</div>
              <Motto className="text-[8px]" />
            </div>
          </div>
          <div className="mt-8 flex-1 min-h-0 overflow-y-auto space-y-1">
            {WALKTHROUGH_STEPS.map((s, i) => {
              const SIcon = s.icon;
              const active = i === step;
              return (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active ? "bg-gold/15 border-l-2 border-gold" : "border-l-2 border-transparent hover:bg-primary-foreground/5"
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${active ? "bg-gold text-onyx" : "bg-primary-foreground/10 text-primary-foreground/70"}`}>
                    <SIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className={`text-xs font-semibold leading-snug ${active ? "text-primary-foreground" : "text-primary-foreground/60"}`}>
                    {s.eyebrow}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pt-4 text-[10px] text-primary-foreground/40">
            Fortuna Audentes Iuvat
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto px-12 pt-10 pb-6">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-soft shadow-regal">
              <Icon className="h-8 w-8 text-onyx" />
            </div>
            <div className="mt-6 text-[10px] font-bold tracking-[0.25em] text-gold-deep uppercase">
              {current.eyebrow}
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight max-w-xl">
              {current.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-xl">
              {current.body}
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-background px-3.5 py-3">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-gold-deep" />
                  <span className="text-xs leading-relaxed">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer: nav + always-visible exits */}
          <div className="shrink-0 border-t border-border px-12 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onSkip} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Skip for now
              </button>
              <button
                onClick={onDontShowAgain}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson hover:text-crimson-deep disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Don't show this again
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-semibold tracking-widest">{step + 1} / {total}</span>
              <button
                onClick={() => setStep(step - 1)}
                disabled={isFirst}
                className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
              {isLast ? (
                <button
                  onClick={onDontShowAgain}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Finish
                </button>
              ) : (
                <button
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onSkip}
        aria-label="Close walkthrough"
        className="absolute top-8 right-8 rounded-full bg-card/80 p-2 text-foreground hover:bg-card"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
