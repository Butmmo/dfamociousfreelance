import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { useServerFn } from "@tanstack/react-start";
import { revokeAscent } from "@/lib/ascent.functions";
import { DAYS, RANKS, ASCENT_PLAYBOOK_KEY } from "@/lib/ascent-data";
import { toast } from "sonner";
import { Crown, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ascent/council")({
  head: () => ({ meta: [{ title: "Ascent Council — DFS Citadel" }] }),
  component: AscentCouncil,
});

type Row = {
  user_id: string;
  granted_at: string;
  full_name: string | null;
  email: string;
  xp: number;
  percent: number;
  rank: string;
  tasks: number;
  lastActive: Date | null;
};

const TOTAL_XP = DAYS.reduce((s, d) => s + d.items.reduce((a, i) => a + i.xp, 0), 0);
const TOTAL_TASKS = DAYS.reduce((s, d) => s + d.items.length, 0);
const XP_BY_ID: Record<string, number> = {};
DAYS.forEach((d) => d.items.forEach((i) => { XP_BY_ID[i.id] = i.xp; }));

export function AscentCouncil() {
  const { role, isSuperAdmin } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const revoke = useServerFn(revokeAscent);

  const load = async () => {
    setLoading(true);
    const { data: access } = await supabase
      .from("ascent_access")
      .select("user_id, granted_at");
    const ids = (access ?? []).map((a: any) => a.user_id);
    if (ids.length === 0) { setRows([]); setLoading(false); return; }
    const [profiles, progress] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").in("id", ids),
      supabase.from("task_progress").select("user_id, task_id, completed, completed_at").in("user_id", ids).eq("playbook", ASCENT_PLAYBOOK_KEY),
    ]);
    const profMap = new Map<string, any>((profiles.data ?? []).map((p: any) => [p.id, p]));
    const grouped = new Map<string, any[]>();
    (progress.data ?? []).forEach((r: any) => {
      if (!grouped.has(r.user_id)) grouped.set(r.user_id, []);
      grouped.get(r.user_id)!.push(r);
    });
    const out: Row[] = (access ?? []).map((a: any) => {
      const p = profMap.get(a.user_id);
      const prs = grouped.get(a.user_id) ?? [];
      const doneRows = prs.filter((r: any) => r.completed);
      const xp = doneRows.reduce((s: number, r: any) => s + (XP_BY_ID[r.task_id] ?? 0), 0);
      const percent = TOTAL_XP ? Math.min(100, Math.round((xp / TOTAL_XP) * 100)) : 0;
      let rank = RANKS[0].name;
      RANKS.forEach((r) => { if (percent >= r.threshold) rank = r.name; });
      const ts = doneRows.map((r: any) => r.completed_at ? new Date(r.completed_at).getTime() : 0).filter(Boolean);
      return {
        user_id: a.user_id,
        granted_at: a.granted_at,
        full_name: p?.full_name ?? null,
        email: p?.email ?? "—",
        xp, percent, rank,
        tasks: doneRows.length,
        lastActive: ts.length ? new Date(Math.max(...ts)) : null,
      };
    }).sort((a, b) => b.percent - a.percent);
    setRows(out);
    setLoading(false);
  };

  useEffect(() => { if (role === "admin") load(); }, [role]);

  const sorted = useMemo(() => rows, [rows]);

  if (role !== "admin") {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8 text-center space-y-2">
        <Shield className="h-8 w-8 text-gold-deep mx-auto" />
        <h1 className="font-display text-xl font-bold">Council access only</h1>
        <p className="text-sm text-muted-foreground">This board is reserved for admins.</p>
      </div>
    );
  }

  const handleRevoke = async (userId: string, name: string) => {
    if (!confirm(`Revoke Ascent access for ${name}? Their progress remains recorded but the tab locks immediately.`)) return;
    try {
      await revoke({ data: { user_id: userId } });
      toast.success("Ascent access revoked.");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Revoke failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Admin Board</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Ascent Council</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Every beneficiary currently granted access to the Ascent programme, ranked by progress. Only the Founder can grant new access — do that from the main Citadel Council.
          </p>
        </div>
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Grant / manage from Citadel Council <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div className="col-span-4">Beneficiary</div>
          <div className="col-span-2">Rank</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-2">Tasks · XP</div>
          <div className="col-span-1">Last</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground text-center">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">
            No beneficiaries have Ascent access yet. Grant it from the{" "}
            <Link to="/admin" className="text-primary hover:underline">Citadel Council</Link>.
          </div>
        ) : (
          sorted.map((r) => (
            <div key={r.user_id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border last:border-b-0 text-sm">
              <div className="col-span-4 min-w-0">
                <div className="font-semibold truncate">{r.full_name ?? "Unnamed"}</div>
                <div className="text-[11px] text-muted-foreground truncate">{r.email}</div>
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-gold-deep" />
                <span className="text-xs font-mono">{r.rank}</span>
              </div>
              <div className="col-span-2">
                <div className="h-1.5 rounded bg-muted overflow-hidden">
                  <div className="h-full bg-insignia" style={{ width: `${r.percent}%` }} />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{r.percent}%</div>
              </div>
              <div className="col-span-2 text-xs font-mono">
                {r.tasks}/{TOTAL_TASKS} · {r.xp} XP
              </div>
              <div className="col-span-1 text-[11px] text-muted-foreground">
                {r.lastActive ? relTime(r.lastActive) : "—"}
              </div>
              <div className="col-span-1 text-right">
                {isSuperAdmin && (
                  <button
                    onClick={() => handleRevoke(r.user_id, r.full_name ?? r.email)}
                    className="text-[11px] text-crimson hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function relTime(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
