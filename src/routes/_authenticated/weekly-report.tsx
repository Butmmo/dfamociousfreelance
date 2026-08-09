import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { toast } from "sonner";
import { FileText, Send, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/weekly-report")({
  head: () => ({ meta: [{ title: "Weekly Report — DBI Citadel" }] }),
  component: WeeklyReportPage,
});

function currentIsoWeek(now = new Date()) {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function WeeklyReportPage() {
  const { user } = useSession();
  const [outreach, setOutreach] = useState(0);
  const [demos, setDemos] = useState(0);
  const [calls, setCalls] = useState(0);
  const [clients, setClients] = useState(0);
  const [revenueNgn, setRevenueNgn] = useState(0);
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("weekly_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setHistory(data ?? []));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("weekly_reports").insert({
      user_id: user.id,
      week_number: currentIsoWeek(),
      outreach_count: outreach,
      demos_built: demos,
      calls_booked: calls,
      clients_closed: clients,
      revenue_usd: revenueNgn,
      wins: wins.trim(),
      blockers: blockers.trim(),
      next_week_focus: nextWeek.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Report filed. Council notified.");
    setWins(""); setBlockers(""); setNextWeek("");
    setOutreach(0); setDemos(0); setCalls(0); setClients(0); setRevenueNgn(0);
    const { data } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);
    setHistory(data ?? []);
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] uppercase tracking-widest text-gold-deep flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" /> Weekly cadence
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">File this week's report</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Every Sunday. Even zero counts. The council reads cadence, not perfection — a filed report of nothing beats a missed one.
          Your <Link to="/report" className="text-primary font-semibold hover:underline">Field Report</Link> aggregates these into your escalation score.
        </p>
        <div className="mt-3 rounded-lg border border-crimson/40 bg-crimson/5 px-4 py-2.5 text-xs text-crimson max-w-2xl">
          <strong>Missed filing = ₦2,500 fine</strong> and a hit to your escalation rating. File it — even if every count is zero.
        </div>
      </header>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <NumField label="Outreach sent" value={outreach} onChange={setOutreach} />
          <NumField label="Demos built" value={demos} onChange={setDemos} />
          <NumField label="Calls booked" value={calls} onChange={setCalls} />
          <NumField label="Clients closed" value={clients} onChange={setClients} />
        </div>

        <NumField label="Revenue this week (₦)" value={revenueNgn} onChange={setRevenueNgn} big />

        <TextArea label="Wins this week" value={wins} onChange={setWins} placeholder="What went well? Any breakthroughs?" />
        <TextArea label="Blockers" value={blockers} onChange={setBlockers} placeholder="What's stuck? What would you ask your mentor?" />
        <TextArea label="Commitment for next week" value={nextWeek} onChange={setNextWeek} placeholder="What will you have completed by next Sunday?" />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            File report
          </button>
        </div>
      </form>

      <section>
        <div className="text-[10px] uppercase tracking-widest text-gold-deep">Recent filings</div>
        <h2 className="mt-1 font-display text-2xl font-bold">Your last 6 reports</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No reports filed yet.</p>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {history.map((h) => (
              <div key={h.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(h.created_at).toLocaleDateString()}</span>
                  <span className="uppercase tracking-widest">Week {h.week_number ?? "—"}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <MiniStat label="Out" value={h.outreach_count ?? 0} />
                  <MiniStat label="Demos" value={h.demos_built ?? 0} />
                  <MiniStat label="Calls" value={h.calls_booked ?? 0} />
                  <MiniStat label="Closed" value={h.clients_closed ?? 0} />
                </div>
                {h.revenue_usd ? (
                  <p className="mt-3 text-xs text-muted-foreground"><strong className="text-foreground">Revenue:</strong> ₦{Number(h.revenue_usd).toLocaleString()}</p>
                ) : null}
                {h.wins && (
                  <p className="mt-2 text-xs text-muted-foreground"><strong className="text-foreground">Wins:</strong> {h.wins}</p>
                )}
                {h.blockers && (
                  <p className="mt-1 text-xs text-muted-foreground"><strong className="text-foreground">Blockers:</strong> {h.blockers}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NumField({ label, value, onChange, big }: { label: string; value: number; onChange: (n: number) => void; big?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || "0", 10)))}
        className={`mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-display font-bold ${big ? "text-2xl" : "text-xl"}`}
      />
    </label>
  );
}
function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (s: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-background border border-border p-2 text-center">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold">{value}</div>
    </div>
  );
}
