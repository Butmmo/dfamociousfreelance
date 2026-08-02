import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/use-session";
import {
  inviteBeneficiary, listBeneficiaries, listInvitations, listAdmins, listAssignments,
  removeBeneficiary, promoteToAdmin, demoteFromAdmin, assignAdminToBeneficiary,
  listEscalations, openEscalation, logCheckIn,
} from "@/lib/admin.functions";
import { listAscentAccess, grantAscent, revokeAscent } from "@/lib/ascent.functions";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Mountain } from "lucide-react";
import { Crown, UserPlus, Loader2, Mail, Shield, AlertTriangle, MessageSquare, Link2, Trash2, ArrowDown, ArrowUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Council — DFS Admin" }] }),
  component: Admin,
});

function Admin() {
  const { role, loading, user, isSuperAdmin } = useSession();
  const navigate = useNavigate();

  const invite = useServerFn(inviteBeneficiary);
  const listBens = useServerFn(listBeneficiaries);
  const listInvs = useServerFn(listInvitations);
  const listAdms = useServerFn(listAdmins);
  const listAssigns = useServerFn(listAssignments);
  const listEsc = useServerFn(listEscalations);
  const removeUser = useServerFn(removeBeneficiary);
  const promote = useServerFn(promoteToAdmin);
  const demote = useServerFn(demoteFromAdmin);
  const assign = useServerFn(assignAdminToBeneficiary);
  const openEsc = useServerFn(openEscalation);
  const logCi = useServerFn(logCheckIn);
  const listAscent = useServerFn(listAscentAccess);
  const grantAsc = useServerFn(grantAscent);
  const revokeAsc = useServerFn(revokeAscent);
  const [ascent, setAscent] = useState<any[]>([]);

  const [bens, setBens] = useState<any[]>([]);
  const [invs, setInvs] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [assigns, setAssigns] = useState<any[]>([]);
  const [escs, setEscs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [asAdmin, setAsAdmin] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<string | null>(null);
  const [checkinText, setCheckinText] = useState("");
  const [checkinMood, setCheckinMood] = useState<"green" | "yellow" | "red">("green");
  const [checkinAction, setCheckinAction] = useState("");

  useEffect(() => { if (!loading && role !== "admin") navigate({ to: "/dashboard" }); }, [role, loading, navigate]);

  const refresh = async () => {
    try {
      const [b, i, a, s, e, ac] = await Promise.all([
        listBens({ data: undefined as never }), listInvs({ data: undefined as never }),
        listAdms({ data: undefined as never }), listAssigns({ data: undefined as never }),
        listEsc({ data: undefined as never }), listAscent({ data: undefined as never }),
      ]);
      setBens(b); setInvs(i); setAdmins(a); setAssigns(s); setEscs(e); setAscent(ac);
    } catch (e: any) { toast.error(e.message ?? "Failed to load"); }
  };
  useEffect(() => { if (role === "admin") refresh(); /* eslint-disable-next-line */ }, [role]);

  const onInvite = async (ev: React.FormEvent) => {
    ev.preventDefault(); setBusy(true);
    try {
      await invite({ data: { email: email.trim(), full_name: fullName.trim() || undefined, role: asAdmin ? "admin" : "beneficiary" } });
      toast.success(`Invitation dispatched to ${email}`);
      setEmail(""); setFullName(""); setAsAdmin(false); refresh();
    } catch (e: any) { toast.error(e.message ?? "Invite failed"); }
    finally { setBusy(false); }
  };

  const assignmentByBen = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of assigns) m.set(a.beneficiary_id, a.admin_id);
    return m;
  }, [assigns]);

  const doRemove = async (uid: string, label: string) => {
    if (!confirm(`Remove ${label}? This deletes their account.`)) return;
    try { await removeUser({ data: { user_id: uid } }); toast.success("Removed."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doPromote = async (uid: string) => {
    try { await promote({ data: { user_id: uid } }); toast.success("Promoted to admin."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doDemote = async (uid: string) => {
    try { await demote({ data: { user_id: uid } }); toast.success("Demoted."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doAssign = async (beneficiary_id: string, admin_id: string | null) => {
    try { await assign({ data: { beneficiary_id, admin_id } }); toast.success("Assignment saved."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const doEscalate = async (beneficiary_id: string, level: "watch" | "at_risk" | "critical" | "resolved") => {
    try { await openEsc({ data: { beneficiary_id, level } }); toast.success("Escalation updated."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const toggleAscent = async (uid: string, has: boolean) => {
    try {
      if (has) { await revokeAsc({ data: { user_id: uid } }); toast.success("Ascent access revoked."); }
      else    { await grantAsc({ data: { user_id: uid } }); toast.success("Ascent access granted."); }
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };
  const ascentSet = useMemo(() => new Set(ascent.map((a) => a.user_id)), [ascent]);
  const submitCheckIn = async () => {
    if (!checkinTarget || checkinText.trim().length < 2) return;
    try {
      await logCi({ data: { beneficiary_id: checkinTarget, mood: checkinMood, summary: checkinText.trim(), next_action: checkinAction.trim() || undefined } });
      toast.success("Check-in logged."); setCheckinTarget(null); setCheckinText(""); setCheckinAction(""); setCheckinMood("green");
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };

  if (loading || role !== "admin") return null;

  return (
    <div className="space-y-10">
      <div>
        <Motto />
        <h1 className="mt-2 font-display text-4xl font-bold flex items-center gap-3">
          <Crown className="h-9 w-9 text-gold" /> Council
          {isSuperAdmin && <span className="ml-2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-onyx">SUPER ADMIN</span>}
        </h1>
        <p className="text-muted-foreground">Issue invitations, appoint admins, assign mentors, and manage the escalation cadence.</p>
        <Link to="/council-reports" className="mt-3 inline-flex items-center gap-2 rounded-md border border-gold bg-accent/30 px-4 py-2 text-sm font-semibold text-gold-deep hover:bg-accent/60">
          <FileText className="h-4 w-4" /> View weekly filings
        </Link>
      </div>


      {/* Invite */}
      <section className="rounded-2xl border border-gold bg-card p-6 shadow-regal">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><UserPlus className="h-5 w-5" /> Invite a beneficiary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Only invited emails can join DFS. {isSuperAdmin ? "As super admin, you may invite admins too." : "Only the super admin can invite admins."}
        </p>
        <form onSubmit={onInvite} className="mt-6 grid md:grid-cols-3 gap-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="beneficiary@email.com" className="md:col-span-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name (optional)" className="md:col-span-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <div className="md:col-span-1 flex items-center gap-3">
            {isSuperAdmin && (
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={asAdmin} onChange={(e) => setAsAdmin(e.target.checked)} />
                <Crown className="h-4 w-4 text-gold-deep" /> Admin
              </label>
            )}
            <button disabled={busy} type="submit" className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send invite
            </button>
          </div>
        </form>
      </section>

      {/* Escalations */}
      <section>
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-crimson" /> Escalation queue</h2>
        <p className="text-sm text-muted-foreground mt-1">Open flags on beneficiaries who need intervention. Manual check-ins live in the roll below.</p>
        <div className="mt-4 rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-widest">
              <tr><th className="text-left p-3">Beneficiary</th><th className="text-left p-3">Level</th><th className="text-left p-3">Reason</th><th className="text-left p-3">Opened</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {escs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No active escalations. Steady hand.</td></tr>}
              {escs.map((r) => {
                const b = bens.find((x) => x.id === r.beneficiary_id);
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">{b?.full_name ?? b?.email ?? r.beneficiary_id.slice(0, 8)}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${r.level === "critical" ? "bg-crimson text-white" : r.level === "at_risk" ? "bg-gold text-onyx" : "bg-muted"}`}>{r.level}</span></td>
                    <td className="p-3 text-muted-foreground">{r.reason ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => doEscalate(r.beneficiary_id, "resolved")} className="text-xs underline">Resolve</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admins */}
      <section>
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5" /> Admins</h2>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold flex items-center gap-2">
                    {a.full_name ?? "Unnamed"}
                    {a.is_super_admin && <Crown className="h-4 w-4 text-gold" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </div>
                {isSuperAdmin && !a.is_super_admin && a.id !== user?.id && (
                  <div className="flex gap-2">
                    <button title="Demote" onClick={() => doDemote(a.id)} className="rounded-md border border-border p-1.5 hover:bg-muted"><ArrowDown className="h-4 w-4" /></button>
                    <button title="Remove" onClick={() => doRemove(a.id, a.email)} className="rounded-md border border-crimson p-1.5 text-crimson hover:bg-crimson/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pending invites */}
      <section>
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Mail className="h-5 w-5" /> Pending invitations</h2>
        <div className="mt-4 rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-widest">
              <tr><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-left p-3">Status</th><th className="text-left p-3">Invited</th></tr>
            </thead>
            <tbody>
              {invs.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No invitations yet.</td></tr>}
              {invs.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="p-3">{i.email}</td>
                  <td className="p-3 capitalize">{i.role}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${i.status === "accepted" ? "bg-accent/40 text-accent-foreground" : "bg-muted"}`}>{i.status}</span></td>
                  <td className="p-3 text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Beneficiary roll */}
      <section>
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5" /> Beneficiary roll</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {bens.length === 0 && <p className="text-muted-foreground text-sm">No beneficiaries yet.</p>}
          {bens.filter((b) => (b.email ?? "").toLowerCase() !== "boluwatifefamokunwa@gmail.com" && !admins.some((a) => a.id === b.id)).map((b) => {
            const assignedAdmin = assignmentByBen.get(b.id) ?? "";
            return (
              <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display font-semibold">{b.full_name ?? "Unnamed"}</div>
                    <div className="text-xs text-muted-foreground">{b.email}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="uppercase tracking-widest text-gold-deep">{b.rank}</span>
                      <span className="text-muted-foreground">{b.xp} XP</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {isSuperAdmin && (
                      <button onClick={() => doPromote(b.id)} title="Promote to admin" className="rounded-md border border-border p-1.5 hover:bg-muted"><ArrowUp className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => doRemove(b.id, b.email)} title="Remove" className="rounded-md border border-crimson p-1.5 text-crimson hover:bg-crimson/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {isSuperAdmin ? (
                    <label className="col-span-2 flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5" />
                      <span className="text-muted-foreground">Mentor:</span>
                      <select value={assignedAdmin} onChange={(e) => doAssign(b.id, e.target.value || null)} className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs">
                        <option value="">— unassigned —</option>
                        {admins.map((a) => (<option key={a.id} value={a.id}>{a.full_name ?? a.email}</option>))}
                      </select>
                    </label>
                  ) : (
                    <div className="col-span-2 text-muted-foreground">Mentor: {admins.find((a) => a.id === assignedAdmin)?.full_name ?? "unassigned"}</div>
                  )}

                  <button onClick={() => doEscalate(b.id, "at_risk")} className="rounded-md border border-gold py-1.5 text-gold-deep hover:bg-gold/10">Flag at-risk</button>
                  <button onClick={() => doEscalate(b.id, "critical")} className="rounded-md border border-crimson py-1.5 text-crimson hover:bg-crimson/10">Critical</button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => toggleAscent(b.id, ascentSet.has(b.id))}
                      className={`col-span-2 inline-flex items-center justify-center gap-1 rounded-md py-1.5 border ${
                        ascentSet.has(b.id)
                          ? "border-gold bg-gold/15 text-gold-deep"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Mountain className="h-3.5 w-3.5" />
                      {ascentSet.has(b.id) ? "Revoke Ascent access" : "Grant Ascent access"}
                    </button>
                  )}
                  <button onClick={() => setCheckinTarget(b.id)} className="col-span-2 inline-flex items-center justify-center gap-1 rounded-md bg-primary py-1.5 text-primary-foreground hover:bg-primary/90"><MessageSquare className="h-3.5 w-3.5" /> Log check-in</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Check-in modal */}
      {checkinTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setCheckinTarget(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-gold bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Log a check-in</h3>
            <p className="text-xs text-muted-foreground mt-1">Recorded on their file for continuity of care.</p>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2 text-xs">
                {(["green", "yellow", "red"] as const).map((m) => (
                  <button key={m} onClick={() => setCheckinMood(m)} className={`px-3 py-1.5 rounded-full border ${checkinMood === m ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{m}</button>
                ))}
              </div>
              <textarea value={checkinText} onChange={(e) => setCheckinText(e.target.value)} rows={4} placeholder="Summary of the conversation…" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <input value={checkinAction} onChange={(e) => setCheckinAction(e.target.value)} placeholder="Next action (optional)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setCheckinTarget(null)} className="rounded-md border border-border px-3 py-2 text-sm">Cancel</button>
                <button onClick={submitCheckIn} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Save check-in</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
