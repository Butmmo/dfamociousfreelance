import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/use-session";
import { listAllWeeklyReports } from "@/lib/admin.functions";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { FileText, Search, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/council-reports")({
  head: () => ({
    meta: [
      { title: "Weekly Filings — DBI Council" },
      { name: "description", content: "Council view of every weekly report filed by DBI beneficiaries — list and full submission detail." },
      { property: "og:title", content: "Weekly Filings — DBI Council" },
      { property: "og:description", content: "Every weekly report filed by DBI beneficiaries, week after week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CouncilReports,
});

function CouncilReports() {
  const { role, loading } = useSession();
  const navigate = useNavigate();
  const fetchReports = useServerFn(listAllWeeklyReports);

  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => { if (!loading && role !== "admin") navigate({ to: "/dashboard" }); }, [role, loading, navigate]);

  useEffect(() => {
    if (role !== "admin") return;
    setBusy(true);
    fetchReports({ data: undefined as never })
      .then((d: any) => setRows(d ?? []))
      .catch((e: any) => toast.error(e.message ?? "Failed to load filings"))
      .finally(() => setBusy(false));
    // eslint-disable-next-line
  }, [role]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      (r.profile?.full_name ?? "").toLowerCase().includes(s) ||
      (r.profile?.email ?? "").toLowerCase().includes(s) ||
      String(r.week_number ?? "").includes(s)
    );
  }, [rows, q]);

  const grouped = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const r of filtered) {
      const key = r.user_id;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    }
    return [...m.entries()];
  }, [filtered]);

  if (selected) {
    return <Detail report={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <Motto />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Weekly Filings</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Every weekly report filed across the Citadel — grouped by beneficiary, newest first. Tap any filing for the full submission.
            </p>
          </div>
          <Link to="/admin" className="text-sm font-semibold text-primary hover:underline">← Council</Link>
        </div>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email or week number"
          className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {busy ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading filings…</div>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No weekly reports filed yet.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([uid, list]) => (
            <section key={uid} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-bold">{list[0]?.profile?.full_name ?? list[0]?.profile?.email ?? uid.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{list[0]?.profile?.email} · {list.length} filing{list.length === 1 ? "" : "s"}</div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gold-deep">{list[0]?.profile?.rank ?? "recruit"}</span>
              </div>

              <div className="mt-4 divide-y divide-border">
                {list.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-accent/30 rounded-md px-2 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-gold-deep shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">Week {r.week_number ?? "—"} · {new Date(r.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Out {r.outreach_count ?? 0} · Demos {r.demos_built ?? 0} · Calls {r.calls_booked ?? 0} · Closed {r.clients_closed ?? 0}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ report, onBack }: { report: any; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All filings
      </button>

      <header>
        <div className="text-[10px] uppercase tracking-widest text-gold-deep">weekly filing</div>
        <h1 className="mt-1 font-display text-3xl font-bold">
          {report.profile?.full_name ?? report.profile?.email ?? "Beneficiary"} — Week {report.week_number ?? "—"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filed {new Date(report.created_at).toLocaleString()} · {report.profile?.email}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Outreach" value={report.outreach_count ?? 0} />
        <Stat label="Demos" value={report.demos_built ?? 0} />
        <Stat label="Calls" value={report.calls_booked ?? 0} />
        <Stat label="Closed" value={report.clients_closed ?? 0} />
        <Stat label="Revenue ₦" value={Number(report.revenue_usd ?? 0).toLocaleString()} />
      </div>

      <div className="space-y-4">
        <Field label="Wins" value={report.wins} />
        <Field label="Blockers" value={report.blockers} />
        <Field label="Commitment for next week" value={report.next_week_focus} />
      </div>

      {(
        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground">Raw submission</summary>
          <pre className="mt-3 overflow-x-auto text-xs text-muted-foreground">{JSON.stringify(report, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-gold-deep">{label}</div>
      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{value?.trim() ? value : "— nothing recorded —"}</p>
    </div>
  );
}
