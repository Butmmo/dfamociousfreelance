import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { PATHS, BRIEFINGS, type PathKey } from "@/lib/paths";
import { usePath, formatCountdown } from "@/lib/use-path";
import { useSession } from "@/lib/use-session";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { ArrowLeft, Check, Clock, Loader2, ShieldAlert, Sparkles, AlertTriangle, X, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/choose-path")({
  head: () => ({
    meta: [
      { title: "Choose Your Path — DBI Citadel" },
      {
        name: "description",
        content:
          "The Seven Paths of Digital Engineering. Read each briefing, then commit to the one path you will run inside the Citadel.",
      },
    ],
  }),
  component: ChoosePathPage,
});

function ChoosePathPage() {
  const { isSuperAdmin } = useSession();
  const { pathKey, msRemaining, revisionWindowOpen, revisionMsRemaining, canSeeAllPaths, choose, loading } = usePath();
  const navigate = useNavigate();
  const [open, setOpen] = useState<PathKey | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PathKey | null>(null);
  const [busy, setBusy] = useState<PathKey | null>(null);

  // Once a path is sealed and the one-time revision window has closed, only
  // the founder may keep browsing the briefings.
  const locked = !loading && !isSuperAdmin && !!pathKey && !revisionWindowOpen;
  useEffect(() => {
    if (locked) navigate({ to: "/dashboard", replace: true });
  }, [locked, navigate]);

  const isFirstChoice = !pathKey;
  const isRevision = !!pathKey && revisionWindowOpen;

  const commit = async (key: PathKey) => {
    setBusy(key);
    try {
      await choose(key);
      toast.success(
        isSuperAdmin ? "Viewing this path as the founder."
        : isRevision ? "Path switched. Your Citadel is rescoped — this did not reset your revision window."
        : "Path sealed. Your Citadel is now scoped to this system.",
      );
      setConfirmTarget(null);
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save your path.");
    } finally {
      setBusy(null);
    }
  };

  const requestCommit = (key: PathKey) => {
    if (isSuperAdmin) { commit(key); return; }
    setConfirmTarget(key);
  };

  if (loading || locked) {
    return <div className="p-10 text-center text-muted-foreground">Loading the seven paths…</div>;
  }

  if (open) {
    const Briefing = BRIEFINGS[open];
    const def = PATHS.find((p) => p.key === open)!;
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setOpen(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> All seven paths
          </button>
          <button
            onClick={() => requestCommit(open)}
            disabled={busy === open}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy === open ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSuperAdmin ? `Inspect ${def.short}` : `Commit to ${def.short}`}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Opening briefing…</div>}>
            <Briefing />
          </Suspense>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => requestCommit(open)}
            disabled={busy === open}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy === open ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSuperAdmin ? `Inspect ${def.short}` : `Commit to ${def.short}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Motto />
        <div className="mt-2 text-[10px] tracking-widest text-gold-deep">The Citadel · Enrolment</div>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">The Seven Paths of Digital Engineering</h1>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          Seven separate systems. You run <strong className="text-foreground">one</strong>. This is deliberate — it keeps
          DBI beneficiaries out of each other's markets and gives each of you a lane wide enough to actually win in.
          Read the briefings honestly: each one lists the highs, the lows, the durability and the competition before you
          commit.
        </p>

        {!isSuperAdmin && isFirstChoice && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-crimson/40 bg-crimson/5 p-4 max-w-3xl">
            <Clock className="h-5 w-5 text-crimson shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-crimson">
                {msRemaining > 0 ? `${formatCountdown(msRemaining)} left to choose` : "Your choice window has closed"}
              </div>
              <p className="mt-1 text-muted-foreground">
                You have 24 hours from entering the Citadel. If the window closes without a decision, the council
                assigns you a path at random — and it is just as binding. Once you choose, you'll get a one-time
                48-hour window to revise it if you change your mind.
              </p>
            </div>
          </div>
        )}

        {!isSuperAdmin && isRevision && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-gold/50 bg-gold/5 p-4 max-w-3xl">
            <History className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-gold-deep">
                Revision window open — {formatCountdown(revisionMsRemaining)} left
              </div>
              <p className="mt-1 text-muted-foreground">
                You're currently on <strong className="text-foreground">{PATHS.find((p) => p.key === pathKey)?.name}</strong>.
                You may still switch to a different path — nothing you do during this window affects your escalation
                standing. This is a one-time window from your very first choice; switching does not reset or extend it,
                and once it closes your path is permanent.
              </p>
            </div>
          </div>
        )}

        {isSuperAdmin && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4 max-w-3xl">
            <ShieldAlert className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-gold-deep">Founder access</div>
              <p className="mt-1 text-muted-foreground">
                You are not locked to a path. Selecting one here switches the Citadel into that path so you can inspect
                it end to end.
              </p>
            </div>
          </div>
        )}

        {pathKey && canSeeAllPaths && (
          <p className="mt-3 text-xs text-muted-foreground">
            Currently inspecting: <strong className="text-foreground">{PATHS.find((p) => p.key === pathKey)?.name}</strong>.{" "}
            <Link to="/dashboard" className="text-primary hover:underline">
              Back to the Citadel
            </Link>
          </p>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {PATHS.map((p) => {
          const active = pathKey === p.key;
          return (
            <div
              key={p.key}
              className={`group relative overflow-hidden rounded-2xl border bg-card p-6 transition ${
                active ? "border-gold shadow-regal" : "border-border hover:border-gold/60"
              }`}
            >
              <div
                className={`pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br ${p.accent} blur-3xl`}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-3xl leading-none">{p.emoji}</div>
                  <span className="rounded-full border border-emerald-700/40 bg-emerald-700/10 px-2.5 py-0.5 text-[10px] font-mono tracking-widest text-emerald-700">
                    Playbooks live
                  </span>
                </div>

                <div className="mt-3 text-[10px] tracking-widest text-gold-deep">{p.tagline}</div>
                <h2 className="mt-1 font-display text-xl font-bold">{p.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  <strong className="text-foreground">Suits you if:</strong> {p.fit}
                </p>
                {p.ranks === "closer" && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-gold-deep">
                    <Sparkles className="h-3.5 w-3.5" /> Runs its own closer rank ladder
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setOpen(p.key)}
                    className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold text-gold-deep hover:bg-gold/10"
                  >
                    Read the briefing
                  </button>
                  <button
                    onClick={() => requestCommit(p.key)}
                    disabled={busy === p.key || (active && !canSeeAllPaths)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {busy === p.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {active
                      ? (canSeeAllPaths ? "Inspecting" : "Your path")
                      : canSeeAllPaths ? "Inspect" : isRevision ? "Switch to this path" : "Choose this path"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] tracking-widest text-gold-deep">Why only one</div>
        <h2 className="mt-1 font-display text-2xl font-bold">One path, no cannibalism</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          Every path carries the full Citadel machinery — dashboard, playbooks, 45-day calendar, field report, weekly
          filings, XP and ranks, escalation tracking and council oversight. Locking each beneficiary to a single path
          means two DBI students never knock on the same door, and each of you compounds depth instead of splitting
          attention.
        </p>
      </section>

      {confirmTarget && (
        <PathWarningDialog
          target={confirmTarget}
          isRevision={isRevision}
          currentPathName={pathKey ? PATHS.find((p) => p.key === pathKey)?.name ?? null : null}
          revisionMsRemaining={revisionMsRemaining}
          busy={busy === confirmTarget}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => commit(confirmTarget)}
        />
      )}
    </div>
  );
}

function PathWarningDialog({
  target, isRevision, currentPathName, revisionMsRemaining, busy, onCancel, onConfirm,
}: {
  target: PathKey; isRevision: boolean; currentPathName: string | null; revisionMsRemaining: number;
  busy: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const def = PATHS.find((p) => p.key === target)!;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-lg rounded-2xl border border-crimson/40 bg-card p-6 shadow-regal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crimson/10">
            <AlertTriangle className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Before you commit to {def.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Read this — it's exactly what changes once you confirm.</p>
          </div>
          <button onClick={onCancel} className="ml-auto rounded-md p-1.5 hover:bg-muted shrink-0"><X className="h-4 w-4" /></button>
        </div>

        <ul className="mt-4 space-y-2.5 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-crimson shrink-0" />
            <span>
              This path becomes the scope of your entire Citadel — playbooks, the 45-day calendar, XP, rank, and
              escalation tracking are all locked to <strong>{def.name}</strong>. The other six paths become unavailable.
            </span>
          </li>
          {isRevision ? (
            <>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-crimson shrink-0" />
                <span>
                  Switching away from <strong>{currentPathName}</strong> wipes any progress already recorded under it —
                  calendar completions, weekly filings, XP and rank all reset.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>
                  You're inside your one-time 48-hour revision window ({formatCountdown(revisionMsRemaining)} left).
                  Switching now does <strong>not</strong> reset or extend that window — once it closes, whatever path
                  you're on becomes permanent.
                </span>
              </li>
            </>
          ) : (
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
              <span>
                You'll get a one-time 48-hour window after this to change your mind if you're unsure — after that,
                it's permanent. Only the founder can reset a path back to a clean slate, and only after a mentor-vetted
                petition.
              </span>
            </li>
          )}
        </ul>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
            Go back
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Yes, commit to {def.short}
          </button>
        </div>
      </div>
    </div>
  );
}
