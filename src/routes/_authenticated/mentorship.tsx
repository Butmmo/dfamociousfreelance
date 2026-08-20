import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/use-session";
import {
  listAvailableMentees, requestMentee, respondToMentorshipRequest, endMentorship,
  listMyMentorships, logMentorshipCheckin, listMentorshipCheckins, logMentorshipReview, listMentorshipReviews,
  listEscalationsForMentorship,
} from "@/lib/mentorship.functions";
import { leadershipProgress, currentWeekStart, LEADERSHIP_MENTEE_TARGET, MENTOR_SOFT_CAP } from "@/lib/mentorship";
import { slaSnapshot } from "@/lib/escalation-sla";
import { mentorshipCallUrl } from "@/lib/video";
import { getMenteeInvestmentStatus, releaseInvestmentFunds } from "@/lib/pocket.functions";
import { toast } from "sonner";
import {
  Users, UserPlus, Loader2, Check, X, Video, Award, ChevronDown, ChevronUp, Flag, Search, UserRound, Lock,
} from "lucide-react";

function MiniAvatar({ url, size = "h-9 w-9" }: { url?: string | null; size?: string }) {
  return url ? (
    <img src={url} alt="" className={`${size} shrink-0 rounded-full object-cover border border-gold/40`} />
  ) : (
    <span className={`${size} shrink-0 rounded-full bg-muted grid place-items-center border border-gold/40`}>
      <UserRound className="h-4 w-4 text-muted-foreground" />
    </span>
  );
}

export const Route = createFileRoute("/_authenticated/mentorship")({
  head: () => ({ meta: [{ title: "Leadership by Influence — DBI Citadel" }] }),
  component: MentorshipPage,
});

function MentorshipPage() {
  const { user } = useSession();
  const listMine = useServerFn(listMyMentorships);
  const listAvailable = useServerFn(listAvailableMentees);
  const requestFn = useServerFn(requestMentee);
  const respondFn = useServerFn(respondToMentorshipRequest);
  const endFn = useServerFn(endMentorship);

  const [mine, setMine] = useState<any[]>([]);
  const [browsing, setBrowsing] = useState(false);
  const [available, setAvailable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    if (!user) return;
    try {
      const rows = await listMine({ data: undefined as never });
      setMine(rows);
    } catch (e: any) { toast.error(e.message ?? "Failed to load"); }
    setLoading(false);
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user]);

  const openMarketplace = async () => {
    setBrowsing(true);
    try {
      const rows = await listAvailable({ data: undefined as never });
      setAvailable(rows);
    } catch (e: any) { toast.error(e.message ?? "Failed to load"); }
  };

  const asMentor = mine.filter((m) => m.role === "mentor");
  const asMentee = mine.filter((m) => m.role === "mentee");
  const myOwnMentorship = asMentee.find((m) => m.status === "active" || m.status === "pending");
  const activeMentees = asMentor.filter((m) => m.status === "active");
  const pendingMentees = asMentor.filter((m) => m.status === "pending");

  const progress = useMemo(
    () => leadershipProgress(asMentor.map((m) => ({ menteeDfyComplete: !!m.menteeDfyComplete }))),
    [asMentor],
  );

  const doRequest = async (menteeId: string, label: string) => {
    if (activeMentees.length + pendingMentees.length >= MENTOR_SOFT_CAP) {
      if (!confirm(`You already have ${activeMentees.length + pendingMentees.length} mentees — the recommended cap is ${MENTOR_SOFT_CAP}. Request ${label} anyway?`)) return;
    }
    try {
      await requestFn({ data: { mentee_id: menteeId } });
      toast.success(`Request sent to ${label}.`);
      setAvailable((a) => a.filter((x) => x.id !== menteeId));
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doRespond = async (mentorshipId: string, accept: boolean) => {
    try {
      await respondFn({ data: { mentorship_id: mentorshipId, accept } });
      toast.success(accept ? "Mentorship confirmed." : "Request declined.");
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doEnd = async (mentorshipId: string, label: string) => {
    if (!confirm(`End the mentorship with ${label}?`)) return;
    const reason = prompt("Reason (optional):") ?? undefined;
    try {
      await endFn({ data: { mentorship_id: mentorshipId, reason: reason || undefined } });
      toast.success("Mentorship ended.");
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };

  const filteredAvailable = available.filter((a) =>
    !search.trim() || (a.full_name ?? "").toLowerCase().includes(search.trim().toLowerCase()),
  );

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <Users className="h-3.5 w-3.5" /> Leadership by Influence
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Mentorship</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Authority from character, competence and service — not title. Mentor beneficiaries through their own
          full DFY completion, or find your own mentor here.
        </p>
      </header>

      {/* LEADERSHIP PROGRESS */}
      <section className="rounded-2xl border border-gold/40 bg-accent/20 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">SUC eligibility, path 1</div>
            <h2 className="mt-1 font-display text-2xl font-bold">Verified Mentorship</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              {progress.verifiedMenteeCount} of {LEADERSHIP_MENTEE_TARGET} mentees have completed their own full
              DFY. This is the primary path to SUC's Leadership by Influence standard.
            </p>
          </div>
          {progress.eligible && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-600">
              <Award className="h-4 w-4" /> Standard met
            </span>
          )}
        </div>
        <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-gold" style={{ width: `${Math.min(100, (progress.verifiedMenteeCount / progress.target) * 100)}%` }} />
        </div>
      </section>

      {/* YOUR OWN MENTOR */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Your mentor</h2>
        {!myOwnMentorship ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No mentor yet — mentors browse the marketplace below and reach out. Your DSE Rep can also arrange one.
          </p>
        ) : (
          <MentorshipCard mentorship={myOwnMentorship} onRespond={doRespond} onEnd={doEnd} isMenteeView />
        )}
      </section>

      {/* YOUR MENTEES */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-xl font-bold">Your mentees</h2>
          <button onClick={openMarketplace} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <UserPlus className="h-4 w-4" /> Find a mentee
          </button>
        </div>
        {asMentor.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Not mentoring anyone yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {asMentor.map((m) => (
              <MentorshipCard key={m.id} mentorship={m} onRespond={doRespond} onEnd={doEnd} />
            ))}
          </div>
        )}
      </section>

      {/* MARKETPLACE */}
      {browsing && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-xl font-bold">Available mentees</h2>
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm" />
            </div>
          </div>
          {filteredAvailable.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No unmatched beneficiaries right now.</p>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {filteredAvailable.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-background p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <MiniAvatar url={a.avatar_url} />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{a.full_name ?? "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground">{a.rank ?? "recruit"} · {a.xp ?? 0} XP</div>
                    </div>
                  </div>
                  <button onClick={() => doRequest(a.id, a.full_name ?? "this beneficiary")} className="shrink-0 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10">
                    Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function MentorshipCard({
  mentorship, onRespond, onEnd, isMenteeView,
}: { mentorship: any; onRespond: (id: string, accept: boolean) => void; onEnd: (id: string, label: string) => void; isMenteeView?: boolean }) {
  const [open, setOpen] = useState(false);
  const partnerName = mentorship.partner?.full_name ?? "Unnamed";
  const label = isMenteeView ? "your mentor" : "your mentee";

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <MiniAvatar url={mentorship.partner?.avatar_url} />
          <div>
            <div className="font-semibold">{partnerName} <span className="text-xs font-normal text-muted-foreground">({label})</span></div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <StatusBadge status={mentorship.status} />
              {mentorship.menteeDfyComplete && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><Award className="h-3 w-3" /> DFY complete</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mentorship.status === "pending" && isMenteeView && (
            <>
              <button onClick={() => onRespond(mentorship.id, true)} className="inline-flex items-center gap-1 rounded-md border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10"><Check className="h-3.5 w-3.5" /> Accept</button>
              <button onClick={() => onRespond(mentorship.id, false)} className="inline-flex items-center gap-1 rounded-md border border-crimson px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson/10"><X className="h-3.5 w-3.5" /> Decline</button>
            </>
          )}
          {mentorship.status === "active" && (
            <>
              <a href={mentorshipCallUrl(mentorship.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10">
                <Video className="h-3.5 w-3.5" /> Video call
              </a>
              <button onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-md hover:bg-muted">
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </>
          )}
          {(mentorship.status === "active" || mentorship.status === "pending") && (
            <button onClick={() => onEnd(mentorship.id, partnerName)} className="text-xs text-muted-foreground underline">End</button>
          )}
        </div>
      </div>
      {open && mentorship.status === "active" && <MentorshipDetail mentorship={mentorship} isMenteeView={isMenteeView} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-600",
    active: "bg-emerald-500/15 text-emerald-600",
    ended: "bg-muted text-muted-foreground",
    declined: "bg-crimson/10 text-crimson",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest ${meta[status] ?? "bg-muted"}`}>{status}</span>;
}

function MentorshipDetail({ mentorship, isMenteeView }: { mentorship: any; isMenteeView?: boolean }) {
  const listCheckins = useServerFn(listMentorshipCheckins);
  const logCheckin = useServerFn(logMentorshipCheckin);
  const listReviews = useServerFn(listMentorshipReviews);
  const logReview = useServerFn(logMentorshipReview);
  const listEscalations = useServerFn(listEscalationsForMentorship);

  const [checkins, setCheckins] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [repAssessment, setRepAssessment] = useState("");
  const [flagRaised, setFlagRaised] = useState(false);
  const [flagNote, setFlagNote] = useState("");

  const load = async () => {
    try {
      const [c, r, esc] = await Promise.all([
        listCheckins({ data: { mentorship_id: mentorship.id } }),
        listReviews({ data: { mentorship_id: mentorship.id } }),
        listEscalations({ data: { mentorship_id: mentorship.id } }),
      ]);
      setCheckins(c); setReviews(r); setEscalations(esc);
    } catch (e: any) { toast.error(e.message ?? "Failed to load"); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [mentorship.id]);

  const thisWeek = currentWeekStart();
  const loggedThisWeek = checkins.some((c) => c.week_of === thisWeek);

  const doCheckin = async (happened: boolean) => {
    setBusy(true);
    try {
      await logCheckin({ data: { mentorship_id: mentorship.id, week_of: thisWeek, happened } });
      toast.success("Check-in logged.");
      load();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    setBusy(false);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await logReview({ data: { mentorship_id: mentorship.id, mentee_progress_note: progressNote.trim() || undefined, rep_support_assessment: repAssessment.trim() || undefined, flag_raised: flagRaised, flag_note: flagNote.trim() || undefined } });
      toast.success("Checkpoint review logged.");
      setProgressNote(""); setRepAssessment(""); setFlagRaised(false); setFlagNote("");
      load();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    setBusy(false);
  };

  return (
    <div className="border-t border-border p-4 space-y-5">
      <div>
        <div className="text-[10px] tracking-widest text-muted-foreground mb-2">This week's check-in</div>
        {loggedThisWeek ? (
          <p className="text-xs text-emerald-600">Logged for the week of {thisWeek}.</p>
        ) : (
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => doCheckin(true)} className="rounded-md border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10">Session happened</button>
            <button disabled={busy} onClick={() => doCheckin(false)} className="rounded-md border border-border px-3 py-1.5 text-xs">Didn't happen</button>
          </div>
        )}
        {checkins.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {checkins.slice(0, 8).map((c) => (
              <span key={c.id} title={`${c.week_of} — ${c.logged_by}`} className={`h-2 w-6 rounded-full ${c.happened ? "bg-emerald-500" : "bg-muted"}`} />
            ))}
          </div>
        )}
      </div>

      {escalations.length > 0 && (
        <div>
          <div className="text-[10px] tracking-widest text-muted-foreground mb-2">Escalations raised</div>
          <div className="space-y-2">
            {escalations.map((e) => {
              const snap = slaSnapshot(e);
              const meta: Record<string, string> = {
                open: "bg-muted text-muted-foreground",
                due_soon: "bg-amber-500/15 text-amber-600",
                breached: "bg-crimson/15 text-crimson",
                acknowledged: "bg-sky-500/15 text-sky-600",
                resolved: "bg-emerald-500/15 text-emerald-600",
              };
              return (
                <div key={e.id} className="rounded-md border border-border bg-card p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 font-semibold tracking-widest ${meta[snap.status]}`}>{snap.status.replace("_", " ")}</span>
                    <span className="text-muted-foreground">{new Date(e.raised_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{e.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isMenteeView && (
        <div>
          <div className="text-[10px] tracking-widest text-muted-foreground mb-2">40-day checkpoint review — checkpoint {reviews.length + 1}</div>
          <form onSubmit={submitReview} className="space-y-2">
            <textarea value={progressNote} onChange={(e) => setProgressNote(e.target.value)} placeholder="Mentee's progress and patterns" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs" />
            <textarea value={repAssessment} onChange={(e) => setRepAssessment(e.target.value)} placeholder="Is their DSE Rep actually engaging?" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs" />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={flagRaised} onChange={(e) => setFlagRaised(e.target.checked)} />
              <Flag className="h-3.5 w-3.5 text-crimson" /> Flag for admin — support chain isn't working
            </label>
            {flagRaised && (
              <textarea value={flagNote} onChange={(e) => setFlagNote(e.target.value)} placeholder="What's not working" rows={2} className="w-full rounded-md border border-crimson bg-background px-3 py-2 text-xs" />
            )}
            <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Log checkpoint
            </button>
          </form>
          {reviews.length > 0 && (
            <div className="mt-3 space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-md border border-border bg-card p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Checkpoint {r.checkpoint_number}</span>
                    {r.flag_raised && <span className="inline-flex items-center gap-1 text-crimson"><Flag className="h-3 w-3" /> flagged</span>}
                  </div>
                  {r.mentee_progress_note && <p className="mt-1 text-muted-foreground">{r.mentee_progress_note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isMenteeView && <InvestmentReleasePanel menteeId={mentorship.mentee_id} />}
    </div>
  );
}

function InvestmentReleasePanel({ menteeId }: { menteeId: string }) {
  const statusFn = useServerFn(getMenteeInvestmentStatus);
  const releaseFn = useServerFn(releaseInvestmentFunds);

  const [status, setStatus] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setStatus(await statusFn({ data: { mentee_id: menteeId } })); }
    catch (e: any) { toast.error(e.message ?? "Failed to load Investments status"); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [menteeId]);

  const doRelease = async () => {
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) { toast.error("Enter a valid amount."); return; }
    setBusy(true);
    try {
      await releaseFn({ data: { beneficiary_id: menteeId, amount_usd: value, note: note.trim() || undefined } });
      toast.success("Released.");
      setAmount(""); setNote("");
      load();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    setBusy(false);
  };

  if (!status) return null;

  return (
    <div className="border-t border-border pt-4">
      <div className="text-[10px] tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Investments Pocket</div>
      <p className="text-xs text-muted-foreground">
        {`Locked: $${Number(status.lockedUsd).toFixed(2)} of $${Number(status.fundedUsd).toFixed(2)} funded. Release what's needed for what your mentee is actively working on — whatever's left releases in full automatically once a year regardless.`}
      </p>
      {Number(status.lockedUsd) > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input type="number" min="0" step="0.01" max={status.lockedUsd} placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
          <input type="text" placeholder="What's it for? (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1 min-w-[160px] rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
          <button onClick={doRelease} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Release
          </button>
        </div>
      )}
      {status.unlocks.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {status.unlocks.map((u: any) => (
            <div key={u.id} className="text-[11px] text-muted-foreground">
              <span className="text-emerald-600 font-semibold">${Number(u.amount_usd).toFixed(2)}</span>
              {u.note && <> — {u.note}</>} · {new Date(u.unlocked_at).toLocaleDateString()}{u.is_annual_safeguard && " · annual safeguard"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
