import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { listAllPayments, markPaymentPaid } from "@/lib/payments.functions";
import { PAYMENT_PURPOSE_LABELS } from "@/lib/payments";
import { Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { CreditCard, ArrowLeft, Check, IdCard } from "lucide-react";

const NIGERIA_ID_LABELS: Record<string, string> = {
  nin: "NIN", voters_card: "Voter's Card", drivers_license: "Driver's License", passport: "Passport",
};

function IdentificationCell({ b }: { b: any }) {
  if (!b) return <span className="text-muted-foreground">—</span>;
  const parts: string[] = [];
  if (b.bef_number) parts.push(`BEF# ${b.bef_number}`);
  if (b.nbo_id_card_number) parts.push(`NBO ID ${b.nbo_id_card_number}`);
  if (b.nigeria_id_type && b.nigeria_id_number) {
    parts.push(`${NIGERIA_ID_LABELS[b.nigeria_id_type] ?? b.nigeria_id_type} ${b.nigeria_id_number}`);
  }
  if (parts.length === 0) return <span className="text-crimson">Not provided</span>;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <IdCard className="h-3 w-3 text-muted-foreground shrink-0" /> {parts.join(" · ")}
    </span>
  );
}

export const Route = createFileRoute("/_authenticated/council-payments")({
  head: () => ({ meta: [{ title: "Payments — DBI Council" }] }),
  component: CouncilPayments,
});

const STATUS_META: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  succeeded: "bg-emerald-500/15 text-emerald-600",
  failed: "bg-crimson/15 text-crimson",
  refunded: "bg-sky-500/15 text-sky-600",
};

function CouncilPayments() {
  const { role, loading } = useSession();
  const navigate = useNavigate();
  const listFn = useServerFn(listAllPayments);
  const markPaidFn = useServerFn(markPaymentPaid);

  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => { if (!loading && role !== "admin") navigate({ to: "/dashboard" }); }, [role, loading, navigate]);

  const refresh = async () => {
    setBusy(true);
    try { setRows(await listFn({ data: undefined as never })); }
    catch (e: any) { toast.error(e.message ?? "Failed to load"); }
    setBusy(false);
  };
  useEffect(() => { if (role === "admin") refresh(); /* eslint-disable-next-line */ }, [role]);

  const doMarkPaid = async (id: string) => {
    const note = prompt("How was this paid? (bank transfer, cash, etc. — required)");
    if (!note || !note.trim()) return;
    try { await markPaidFn({ data: { transaction_id: id, note: note.trim() } }); toast.success("Marked paid."); refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  };

  if (loading || role !== "admin") return null;

  const pending = rows.filter((r) => r.status === "pending");
  const decided = rows.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <Motto />
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Council
        </Link>
        <h1 className="mt-3 font-display text-4xl font-bold flex items-center gap-3">
          <CreditCard className="h-9 w-9 text-gold" /> Payments
        </h1>
        <p className="text-muted-foreground">DSE entry, DFY remittances, and SUC entry — Stripe and Paystack transactions, plus manual reconciliation for anything paid outside the app.</p>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold">Pending</h2>
        {busy ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing pending.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-xs min-w-[720px]">
              <thead className="text-muted-foreground border-b border-border">
                <tr className="text-left">
                  <th className="py-2 px-3">Beneficiary</th><th className="py-2 px-3">Purpose</th><th className="py-2 px-3">Provider</th>
                  <th className="py-2 px-3">Amount</th><th className="py-2 px-3">Identification</th><th className="py-2 px-3">Requested</th><th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="py-2 px-3">
                      {r.beneficiary?.full_name ?? r.beneficiary?.email ?? "—"}
                      {r.is_new_signup && (
                        <span className="ml-1.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-gold-deep align-middle">NEW APPLICANT</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{PAYMENT_PURPOSE_LABELS[r.purpose as keyof typeof PAYMENT_PURPOSE_LABELS] ?? r.purpose}</td>
                    <td className="py-2 px-3 capitalize">{r.provider}</td>
                    <td className="py-2 px-3">{r.charged_currency === "NGN" ? `₦${Number(r.charged_amount).toLocaleString()}` : `$${Number(r.charged_amount).toFixed(2)}`}</td>
                    <td className="py-2 px-3">{r.purpose === "dse_entry" ? <IdentificationCell b={r.beneficiary} /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => doMarkPaid(r.id)} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/10">
                        <Check className="h-3.5 w-3.5" /> Mark paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold">History</h2>
          <div className="mt-4 space-y-2">
            {decided.slice(0, 50).map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-3 text-sm flex items-center justify-between flex-wrap gap-2">
                <span>
                  {r.beneficiary?.full_name ?? r.beneficiary?.email ?? "?"} — {PAYMENT_PURPOSE_LABELS[r.purpose as keyof typeof PAYMENT_PURPOSE_LABELS] ?? r.purpose} —{" "}
                  {r.charged_currency === "NGN" ? `₦${Number(r.charged_amount).toLocaleString()}` : `$${Number(r.charged_amount).toFixed(2)}`}
                  {r.marked_paid_note && <span className="text-muted-foreground"> ({r.marked_paid_note})</span>}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest ${STATUS_META[r.status] ?? STATUS_META.pending}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
