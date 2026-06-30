import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { inviteBeneficiary, listBeneficiaries, listInvitations } from "@/lib/admin.functions";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Crown, UserPlus, Loader2, Mail, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Council — DFS Admin" }] }),
  component: Admin,
});

function Admin() {
  const { role, loading } = useSession();
  const navigate = useNavigate();
  const invite = useServerFn(inviteBeneficiary);
  const listBens = useServerFn(listBeneficiaries);
  const listInvs = useServerFn(listInvitations);

  const [bens, setBens] = useState<any[]>([]);
  const [invs, setInvs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [asAdmin, setAsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && role !== "admin") navigate({ to: "/dashboard" });
  }, [role, loading, navigate]);

  const refresh = async () => {
    try {
      const [b, i] = await Promise.all([listBens({ data: undefined as never }), listInvs({ data: undefined as never })]);
      setBens(b); setInvs(i);
    } catch (e: any) { toast.error(e.message ?? "Failed to load"); }
  };

  useEffect(() => { if (role === "admin") refresh(); /* eslint-disable-next-line */ }, [role]);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await invite({ data: { email: email.trim(), full_name: fullName.trim() || undefined, role: asAdmin ? "admin" : "beneficiary" } });
      toast.success(`Invitation dispatched to ${email}`);
      setEmail(""); setFullName(""); setAsAdmin(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Invite failed");
    } finally { setBusy(false); }
  };

  if (loading || role !== "admin") return null;

  return (
    <div className="space-y-10">
      <div>
        <Motto />
        <h1 className="mt-2 font-display text-4xl font-bold flex items-center gap-3">
          <Crown className="h-9 w-9 text-gold" /> Council
        </h1>
        <p className="text-muted-foreground">Issue invitations. Promote admins. Watch over the beneficiaries.</p>
      </div>

      <section className="rounded-2xl border border-gold bg-card p-6 shadow-regal">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><UserPlus className="h-5 w-5" /> Invite a beneficiary</h2>
        <p className="text-sm text-muted-foreground mt-1">Only invited emails can join DFS. The user receives a one-click link to set their password.</p>
        <form onSubmit={onInvite} className="mt-6 grid md:grid-cols-3 gap-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="beneficiary@email.com"
            className="md:col-span-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name (optional)"
            className="md:col-span-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <div className="md:col-span-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={asAdmin} onChange={(e) => setAsAdmin(e.target.checked)} />
              <Crown className="h-4 w-4 text-gold-deep" /> Admin
            </label>
            <button disabled={busy} type="submit" className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send invite
            </button>
          </div>
        </form>
      </section>

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

      <section>
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5" /> Beneficiary roll</h2>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bens.length === 0 && <p className="text-muted-foreground text-sm">No beneficiaries yet.</p>}
          {bens.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4">
              <div className="font-display font-semibold">{b.full_name ?? "Unnamed"}</div>
              <div className="text-xs text-muted-foreground">{b.email}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="uppercase tracking-widest text-gold-deep">{b.rank}</span>
                <span className="text-muted-foreground">{b.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
