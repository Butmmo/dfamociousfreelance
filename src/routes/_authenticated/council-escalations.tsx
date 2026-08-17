import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import {
  listAllEscalations, acknowledgeEscalation, classifyEscalation, resolveEscalation,
  listAdmins, assignAdminToBeneficiary,
} from "@/lib/admin.functions";
import { slaSnapshot, formatHours, CLASSIFICATIONS, type EscalationRow } from "@/lib/escalation-sla";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { ShieldAlert, ArrowLeft, Check, Link2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/council-escalations")({
  head: () => ({ meta: [{ title: "Escalations — DBI Council" }] }),
  component: CouncilEscalations,
});

const STATUS_META: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-muted text-muted-foreground" },
  due_soon: { label: "Due soon", className: "bg-amber-500/15 text-amber-600" },
  breached: { label: "SLA breached", className: "bg-crimson/15 text-crimson" },
  acknowledged: { label: "Acknowledged", className: "bg-sky-500/15 text-sky-600" },
  resolved: { label: "Resolved", className: "bg-emerald-500/15 text-emerald-600" },
};

function CouncilEscalations() {
  const { role, loading } = useSession();
  const navigate = useNavigate();
  const listFn = useServerFn(listAllEscalations);
  const ackFn = useServerFn(acknowledgeEscalation);
  const classifyFn = useServerFn(classifyEscalation);
  const resolveFn = useServerFn(resolveEscalation);
  const listAdminsFn = useServerFn(listAdmins);
  const assignFn = useServerFn(assignAdminToBeneficiary);

  const [rows, setRows] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [, forceTick] = useState(0);

  useEffect(() => { if (!loading && role !== "admin") navigate({ to: "/dashboard" }); }, [role, loading, navigate]);

  const refresh = async () => {
    setBusy(true);
    try {
      const [e, a] = await Promise.all([listFn({ data: undefined as never }), listAdminsFn({ data: undefined as never })]);
      setRows(e); setAdmins(a);
    } catch (err: any) { toast.error(err.message ?? "Failed to load"); }
    setBusy(false);
  };
  useEffect(() => { if (role === "admin") refresh(); /* eslint-disable-next-line */ }, [role]);

  // Live SLA countdowns — re-render every minute so badges/hours stay accurate without a manual refresh.
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const doAck = async (id: string) => {
    try { await ackFn({ data: { escalation_id: id } }); toast.success("Acknowledged."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doClassify = async (id: string, classification: "acceptable" | "correctable" | "disciplinary") => {
    const note = prompt("Classification note (optional):") ?? undefined;
    try { await classifyFn({ data: { escalation_id: id, classification, classification_note: note || undefined } }); toast.success("Classified."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doResolve = async (id: string, reassigned: boolean) => {
    const note = prompt("Resolution note (optional):") ?? undefined;
    try { await resolveFn({ data: { escalation_id: id, resolution_note: note || undefined, reassigned } }); toast.success("Resolved."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doReassign = async (menteeId: string, newAdminId: string) => {
    try { await assignFn({ data: { beneficiary_id: menteeId, admin_id: newAdminId } }); toast.success("Rep reassigned."); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };

  if (loading || role !== "admin") return null;

  const open = rows.filter((r) => !r.resolved_at);
  const resolved = rows.filter((r) => !!r.resolved_at);

  return (
    <div className="space-y-8">
      <div>
        <Motto />
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Council
        </Link>
        <h1 className="mt-3 font-display text-4xl font-bold flex items-center gap-3">
          <ShieldAlert className="h-9 w-9 text-gold" /> Escalations
        </h1>
        <p className="text-muted-foreground">Mentor-reported support-chain problems — acknowledge within 48-72h, classify, then resolve.</p>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold">Open</h2>
        {busy ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : open.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No open escalations.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {open.map((r) => (
              <EscalationCard key={r.id} row={r} admins={admins} onAck={doAck} onClassify={doClassify} onResolve={doResolve} onReassign={doReassign} />
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold">Resolved</h2>
          <div className="mt-4 space-y-2">
            {resolved.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-3 text-sm flex items-center justify-between flex-wrap gap-2">
                <span>{r.mentor?.full_name ?? "?"} → {r.mentee?.full_name ?? "?"}: {r.description}</span>
                <span className="text-xs text-emerald-600 inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {r.classification ?? "resolved"}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EscalationCard({
  row, admins, onAck, onClassify, onResolve, onReassign,
}: {
  row: any; admins: any[];
  onAck: (id: string) => void;
  onClassify: (id: string, c: "acceptable" | "correctable" | "disciplinary") => void;
  onResolve: (id: string, reassigned: boolean) => void;
  onReassign: (menteeId: string, adminId: string) => void;
}) {
  const snap = slaSnapshot(row as EscalationRow);
  const meta = STATUS_META[snap.status];
  const [reassignTo, setReassignTo] = useState("");

  return (
    <div className={`rounded-xl border p-5 ${snap.status === "breached" ? "border-crimson bg-crimson/5" : snap.status === "due_soon" ? "border-amber-500 bg-amber-500/5" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-widest ${meta.className}`}>{meta.label}</span>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {formatHours(snap.hoursElapsed)} since raised</span>
          </div>
          <p className="mt-2 text-sm">
            <strong>{row.reporter?.full_name ?? "A mentor"}</strong> flagged: mentorship between{" "}
            <strong>{row.mentor?.full_name ?? "mentor"}</strong> and <strong>{row.mentee?.full_name ?? "mentee"}</strong>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{row.description}</p>
          {row.classification && (
            <p className="mt-2 text-xs">
              <span className="font-semibold">{CLASSIFICATIONS.find((c) => c.key === row.classification)?.label}</span>
              {row.classification_note ? ` — ${row.classification_note}` : ""}
            </p>
          )}
        </div>
        {!row.acknowledged_at && (
          <button onClick={() => onAck(row.id)} className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            <Check className="h-3.5 w-3.5" /> Acknowledge
          </button>
        )}
      </div>

      {row.acknowledged_at && !row.classification && (
        <div className="mt-4 flex flex-wrap gap-2">
          {CLASSIFICATIONS.map((c) => (
            <button key={c.key} title={c.blurb} onClick={() => onClassify(row.id, c.key)} className="rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10">
              {c.label}
            </button>
          ))}
        </div>
      )}

      {row.acknowledged_at && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
            <option value="">Reassign mentee's DSE Rep…</option>
            {admins.map((a) => (<option key={a.id} value={a.id}>{a.full_name ?? a.email}</option>))}
          </select>
          <button
            disabled={!reassignTo || !row.mentee_id}
            onClick={() => reassignTo && row.mentee_id && onReassign(row.mentee_id, reassignTo)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50"
          >
            <Link2 className="h-3.5 w-3.5" /> Reassign
          </button>
          <button onClick={() => onResolve(row.id, !!reassignTo)} className="ml-auto rounded-md border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10">
            Mark resolved
          </button>
        </div>
      )}
    </div>
  );
}
