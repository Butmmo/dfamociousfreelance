import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/use-session";
import { listAllMentorships, runAutoAssignMentees } from "@/lib/admin.functions";
import { leadershipProgress, LEADERSHIP_MENTEE_TARGET } from "@/lib/mentorship";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Users, Loader2, Flag, ArrowLeft, RefreshCw, Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/council-mentorship")({
  head: () => ({ meta: [{ title: "Mentorship — DBI Council" }] }),
  component: CouncilMentorship,
});

function CouncilMentorship() {
  const { role, loading } = useSession();
  const navigate = useNavigate();
  const listFn = useServerFn(listAllMentorships);
  const autoAssignFn = useServerFn(runAutoAssignMentees);

  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { if (!loading && role !== "admin") navigate({ to: "/dashboard" }); }, [role, loading, navigate]);

  const refresh = async () => {
    setBusy(true);
    try { setRows(await listFn({ data: undefined as never })); }
    catch (e: any) { toast.error(e.message ?? "Failed to load"); }
    setBusy(false);
  };
  useEffect(() => { if (role === "admin") refresh(); /* eslint-disable-next-line */ }, [role]);

  const doAutoAssign = async () => {
    setAssigning(true);
    try {
      const res: any = await autoAssignFn({ data: undefined as never });
      toast.success(`${res.assigned} of ${res.overdueCount} overdue beneficiaries matched.`);
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    setAssigning(false);
  };

  const byMentor = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const r of rows) {
      const arr = m.get(r.mentor_id) ?? [];
      arr.push(r);
      m.set(r.mentor_id, arr);
    }
    return m;
  }, [rows]);

  const flagged = rows.filter((r) => r.hasFlag);

  if (loading || role !== "admin") return null;

  return (
    <div className="space-y-8">
      <div>
        <Motto />
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Council
        </Link>
        <h1 className="mt-3 font-display text-4xl font-bold flex items-center gap-3">
          <Users className="h-9 w-9 text-gold" /> Mentorship
        </h1>
        <p className="text-muted-foreground">Leadership by Influence oversight — pairings, flagged checkpoints, and auto-assignment.</p>
      </div>

      <section className="rounded-2xl border border-gold bg-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Auto-assign overdue mentees</h2>
          <p className="text-sm text-muted-foreground mt-1">No mentee should go 30+ days unmatched. Weighted toward mentors with stronger verified track records.</p>
        </div>
        <button onClick={doAutoAssign} disabled={assigning} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Run auto-assign
        </button>
      </section>

      {flagged.length > 0 && (
        <section className="rounded-2xl border border-crimson bg-crimson/5 p-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2 text-crimson"><Flag className="h-5 w-5" /> Flagged checkpoint reviews</h2>
          <p className="text-sm text-muted-foreground mt-1">A mentor reported the support chain isn't working for these pairings.</p>
          <div className="mt-4 space-y-2">
            {flagged.map((r) => (
              <div key={r.id} className="rounded-lg border border-crimson/40 bg-card p-3 text-sm">
                <strong>{r.mentee?.full_name ?? r.mentee?.email}</strong> mentored by <strong>{r.mentor?.full_name ?? r.mentor?.email}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl font-bold">Mentors and their mentees</h2>
        {busy ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : byMentor.size === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No mentorships yet.</p>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {Array.from(byMentor.entries()).map(([mentorId, mentorships]) => {
              const progress = leadershipProgress(mentorships.map((m) => ({ menteeDfyComplete: !!m.mentee?.vetted_dse_certified_at })));
              const mentorName = mentorships[0]?.mentor?.full_name ?? mentorships[0]?.mentor?.email ?? mentorId.slice(0, 8);
              return (
                <div key={mentorId} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{mentorName}</div>
                    {progress.eligible && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><Award className="h-3.5 w-3.5" /> {progress.verifiedMenteeCount}/{LEADERSHIP_MENTEE_TARGET}</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {mentorships.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span>{m.mentee?.full_name ?? m.mentee?.email ?? m.mentee_id.slice(0, 8)}</span>
                        <span className="flex items-center gap-1.5">
                          {m.mentee?.vetted_dse_certified_at && <Award className="h-3 w-3 text-emerald-600" />}
                          {m.hasFlag && <Flag className="h-3 w-3 text-crimson" />}
                          <span className={`rounded-full px-2 py-0.5 tracking-widest ${m.status === "active" ? "bg-emerald-500/15 text-emerald-600" : m.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground"}`}>{m.status}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
