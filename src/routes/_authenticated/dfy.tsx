import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { toast } from "sonner";
import {
  dfyProgress, sucPace, DFY_DISCLOSURE, currentPeriodMonth,
  QUALIFYING_MONTH_THRESHOLD_USD, DFY_CAP_USD, QUALIFIED_MONTHS_TARGET,
  type DfyMonthRow,
} from "@/lib/dfy";
import {
  DollarSign, Send, Loader2, Award, ShieldAlert, CheckCircle2, Circle, Clock, Ban,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dfy")({
  head: () => ({ meta: [{ title: "D'Famocious Year — DBI Citadel" }] }),
  component: DfyPage,
});

const STATUS_META: Record<string, { label: string; icon: any; className: string }> = {
  submitted: { label: "Submitted", icon: Clock, className: "text-amber-500" },
  remittance_paid: { label: "Remittance sent", icon: DollarSign, className: "text-sky-500" },
  verified: { label: "Verified", icon: CheckCircle2, className: "text-emerald-500" },
  disputed: { label: "Disputed", icon: Ban, className: "text-crimson" },
};

function yearsElapsed(startDate: string | null, now = new Date()): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const days = Math.max(0, (now.getTime() - start.getTime()) / 86_400_000);
  return days / 365.25;
}

function DfyPage() {
  const { user } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [months, setMonths] = useState<DfyMonthRow[]>([]);
  const [netIncome, setNetIncome] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const thisMonth = currentPeriodMonth();

  const load = async () => {
    if (!user) return;
    const [pRes, mRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("dfy_months").select("*").eq("user_id", user.id).order("period_month", { ascending: false }),
    ]);
    setProfile(pRes.data);
    setMonths((mRes.data as any) ?? []);
    const current = (mRes.data as any[])?.find((m) => m.period_month === thisMonth);
    if (current) {
      setNetIncome(Number(current.net_income_usd));
      setNotes(current.notes ?? "");
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const progress = useMemo(() => dfyProgress(months), [months]);
  const years = useMemo(() => yearsElapsed(profile?.start_date ?? null), [profile]);
  const pace = useMemo(() => sucPace(progress.cumulativeNetIncomeUsd, years), [progress, years]);

  const currentRow = months.find((m) => m.period_month === thisMonth);
  const currentLocked = currentRow?.status === "verified";
  const certifiedAt = profile?.vetted_dse_certified_at as string | null | undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || currentLocked) return;
    setBusy(true);
    const { error } = await supabase.from("dfy_months").upsert(
      {
        user_id: user.id,
        period_month: thisMonth,
        net_income_usd: netIncome,
        notes: notes.trim() || null,
      },
      { onConflict: "user_id,period_month" },
    );
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Month submitted. Report the matching remittance to your DSE Rep.");
    load();
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading DFY tracker…</div>;

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5" /> The D'Famocious Year
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">DFY Tracker</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Log net income the month you start earning. Every earning month owes a remittance — qualified months
          are the ones that move you toward completion.
        </p>
      </header>

      {/* DISCLOSURE — shown plainly, before anything else, not discovered mid-obligation */}
      <section className="rounded-2xl border border-gold/40 bg-accent/20 p-6">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-gold-deep">
          <ShieldAlert className="h-3.5 w-3.5" /> Disclosure
        </div>
        <p className="mt-2 text-sm leading-relaxed">{DFY_DISCLOSURE}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Illustrative range for a solid performer: roughly $3,600–$14,400 total over a genuine qualified year,
          capped at $18,000 regardless of how strong the year is. Sub-threshold months still owe the 20% even
          though they don't count toward the 12.
        </p>
      </section>

      {certifiedAt && (
        <section className="rounded-2xl border border-gold bg-gold/10 p-6 flex items-start gap-4">
          <Award className="h-8 w-8 text-gold-deep flex-shrink-0" />
          <div>
            <h2 className="font-display text-xl font-bold text-gold-deep">Vetted Digital Systems Engineer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              DFY completed and certified on {new Date(certifiedAt).toLocaleDateString()}. Stage 1 finished on real
              income, not attendance.
            </p>
          </div>
        </section>
      )}

      {/* PROGRESS */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] tracking-widest text-gold-deep">Progress</div>
        <h2 className="mt-1 font-display text-2xl font-bold">DFY Completion</h2>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Qualified months" value={`${progress.qualifiedMonths} / ${QUALIFIED_MONTHS_TARGET}`} />
          <Stat label="Cumulative remitted" value={`$${progress.cumulativeRemittedUsd.toLocaleString()} / $${DFY_CAP_USD.toLocaleString()}`} />
          <Stat label="Cumulative net income" value={`$${progress.cumulativeNetIncomeUsd.toLocaleString()}`} />
          <Stat label="Status" value={progress.complete ? "Complete" : "Active"} accent={progress.complete} />
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Toward 12 qualified months</span>
            <span>{progress.qualifiedMonths} / {QUALIFIED_MONTHS_TARGET}</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-gold" style={{ width: `${Math.min(100, (progress.qualifiedMonths / QUALIFIED_MONTHS_TARGET) * 100)}%` }} />
          </div>
        </div>
        {progress.complete && !certifiedAt && (
          <p className="mt-4 text-xs text-emerald-600">
            DFY requirements met ({progress.completionReason === "cap" ? "$18,000 cap reached" : "12 qualified months"}) —
            your DSE Rep will confirm this with the council for V. DsE. certification.
          </p>
        )}
      </section>

      {/* SUC PACE */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] tracking-widest text-gold-deep">SUC readiness</div>
        <h2 className="mt-1 font-display text-2xl font-bold">Pace toward Start-up Catalyst</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          $450,000 cumulative earnings is the real qualification criterion, not years elapsed alone. All three
          tiers are shown together — you may not know yet which one you'll land in.
        </p>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Years since DSE entry" value={years.toFixed(2)} />
          <Stat label="Pace signal" value={`${pace.pacePercent.toFixed(0)}%`} />
          <TierStat label="Tier 1 — Excellence (yrs 1–4)" target={pace.excellenceTargetUsd} met={pace.excellenceMet} eligible={pace.excellenceEligible} cumulative={pace.cumulativeEarningsUsd} />
          <TierStat label="Tier 2 — Normal Gate (yr 5)" target={pace.normalGateTargetUsd} met={pace.normalGateMet} eligible={pace.normalGateEligible} cumulative={pace.cumulativeEarningsUsd} />
        </div>
        <div className="mt-3">
          <TierStat label="Tier 3 — Equivalent Qualification (yr 5+)" target={pace.equivalentTargetUsd} met={pace.equivalentMet} eligible={pace.equivalentEligible} cumulative={pace.cumulativeEarningsUsd} wide />
        </div>
        {pace.qualifies && (
          <p className="mt-4 text-xs text-emerald-600">
            You've met a SUC earnings tier. Leadership by Influence (5 mentees through full DFY, or Verified Retail)
            is still required alongside this before an invitation is issued.
          </p>
        )}
      </section>

      {/* THIS MONTH */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] tracking-widest text-gold-deep">This month</div>
        <h2 className="mt-1 font-display text-2xl font-bold">
          {new Date(thisMonth).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h2>
        {currentLocked ? (
          <p className="mt-3 text-sm text-muted-foreground">
            This month has been verified and can no longer be edited. Net income: ${Number(currentRow?.net_income_usd).toLocaleString()},
            remittance owed: ${Number(currentRow?.remittance_owed_usd).toLocaleString()}.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block max-w-xs">
              <span className="text-[10px] tracking-widest text-muted-foreground">Net income this month ($)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={netIncome}
                onChange={(e) => setNetIncome(Math.max(0, parseFloat(e.target.value || "0")))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-display text-2xl font-bold"
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                ${QUALIFYING_MONTH_THRESHOLD_USD.toLocaleString()}+ qualifies this month toward the 12. Remittance is
                20% of this figure regardless.
              </span>
            </label>
            {netIncome > 0 && (
              <div className="rounded-lg border border-border bg-background p-3 text-xs">
                <span className="text-muted-foreground">Remittance owed on this figure: </span>
                <strong className="text-foreground">${(netIncome * 0.20).toFixed(2)}</strong>
                {netIncome >= QUALIFYING_MONTH_THRESHOLD_USD ? (
                  <span className="ml-2 text-emerald-600">Qualifies this month</span>
                ) : (
                  <span className="ml-2 text-amber-500">Below threshold — still owed, doesn't count toward 12</span>
                )}
              </div>
            )}
            <label className="block">
              <span className="text-[10px] tracking-widest text-muted-foreground">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Anything your DSE Rep should know about this month's figure"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {currentRow ? "Update this month" : "Submit this month"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* HISTORY */}
      <section>
        <div className="text-[10px] tracking-widest text-gold-deep">History</div>
        <h2 className="mt-1 font-display text-2xl font-bold">Every month filed</h2>
        {months.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No months filed yet. Log your first once you start earning — see the disclosure above before you do.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {months.map((m) => {
              const meta = STATUS_META[m.status] ?? STATUS_META.submitted;
              const Icon = meta.icon;
              return (
                <div key={m.period_month} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold">
                      {new Date(m.period_month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ${Number(m.net_income_usd).toLocaleString()} net · ${Number(m.remittance_owed_usd).toLocaleString()} owed
                      {m.qualified ? " · qualified" : " · below threshold"}
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.className}`}>
                    <Icon className="h-3.5 w-3.5" /> {meta.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Reporting is manual today — file each month here, then send the corresponding remittance to the account
        your <Link to="/report" className="text-primary font-semibold hover:underline">DSE Rep</Link> designates.
        A systemized payment platform is planned but not yet built.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-xl font-bold ${accent ? "text-emerald-500" : ""}`}>{value}</div>
    </div>
  );
}

function TierStat({
  label, target, met, eligible, cumulative, wide,
}: { label: string; target: number; met: boolean; eligible: boolean; cumulative: number; wide?: boolean }) {
  const pct = target > 0 ? Math.min(100, (cumulative / target) * 100) : 0;
  return (
    <div className={`rounded-xl border p-4 ${met ? "border-emerald-500 bg-emerald-500/5" : "border-border bg-background"} ${wide ? "sm:col-span-2 lg:col-span-4" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
        {met ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </div>
      <div className="mt-2 font-display text-lg font-bold">${target.toLocaleString()}</div>
      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${met ? "bg-emerald-500" : "bg-gradient-gold"}`} style={{ width: `${pct}%` }} />
      </div>
      {!eligible && <div className="mt-1 text-[10px] text-muted-foreground">Not yet in this tier's window</div>}
    </div>
  );
}
