import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import {
  getMyPayments, createDseEntryCheckout, createDfyRemittanceCheckout, createSucEntryCheckout,
} from "@/lib/payments.functions";
import {
  DSE_ENTRY_USD, DSE_ENTRY_NGN_NBO, LOCAL_EQUIVALENT_DISCLAIMER, SUC_ENTRY_TIERS,
  PAYMENT_PURPOSE_LABELS, type SucEntryTier, type EntryChannel,
} from "@/lib/payments";
import { toast } from "sonner";
import { CreditCard, Loader2, CheckCircle2, Send, GraduationCap, TrendingUp, Rocket, IdCard, Save } from "lucide-react";

const NIGERIA_ID_TYPES: { value: string; label: string }[] = [
  { value: "nin", label: "NIN" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "International Passport" },
];

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments — DBI Citadel" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { user } = useSession();
  const summaryFn = useServerFn(getMyPayments);
  const dseFn = useServerFn(createDseEntryCheckout);
  const dfyFn = useServerFn(createDfyRemittanceCheckout);
  const sucFn = useServerFn(createSucEntryCheckout);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [idForm, setIdForm] = useState({ befNumber: "", nboIdCardNumber: "", nigeriaIdType: "", nigeriaIdNumber: "" });
  const [savingId, setSavingId] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const d = await summaryFn({ data: undefined as never });
      setData(d);
      setIdForm({
        befNumber: d.befNumber ?? "", nboIdCardNumber: d.nboIdCardNumber ?? "",
        nigeriaIdType: d.nigeriaIdType ?? "", nigeriaIdNumber: d.nigeriaIdNumber ?? "",
      });
    } catch (e: any) { toast.error(e.message ?? "Failed to load payments"); }
    setLoading(false);
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const goCheckout = async (key: string, run: () => Promise<{ url: string }>) => {
    setBusyKey(key);
    try {
      const { url } = await run();
      window.location.href = url;
    } catch (e: any) {
      toast.error(e.message ?? "Failed to start checkout");
      setBusyKey(null);
    }
  };

  const saveIdentification = async () => {
    if (!user) return;
    if (!idForm.befNumber.trim() && !idForm.nboIdCardNumber.trim()) {
      toast.error("Provide your BEF number or NBO Identity card number."); return;
    }
    setSavingId(true);
    const { error } = await supabase.from("profiles").update({
      bef_number: idForm.befNumber.trim() || null,
      nbo_id_card_number: idForm.nboIdCardNumber.trim() || null,
      nigeria_id_type: idForm.nigeriaIdType || null,
      nigeria_id_number: idForm.nigeriaIdNumber.trim() || null,
    }).eq("id", user.id);
    if (error) { toast.error(error.message); setSavingId(false); return; }
    toast.success("Identification saved.");
    setSavingId(false);
    refresh();
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return null;

  const sucTierEntries = Object.entries(SUC_ENTRY_TIERS) as [SucEntryTier, typeof SUC_ENTRY_TIERS[SucEntryTier]][];
  const hasNboId = !!(data.befNumber || data.nboIdCardNumber);
  const hasNigeriaId = !!(data.nigeriaIdType && data.nigeriaIdNumber);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5" /> Payments
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Payments</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          DSE entry, DFY remittances, and SUC entry — all handled here. International payments run through Stripe;
          NBO-subsidized DSE entry from Nigeria can also pay through Paystack at the further-subsidized local rate.
        </p>
      </header>

      {/* DSE Entry */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><GraduationCap className="h-4 w-4" /> DSE Entry</h2>
        {data.dseEntryPaidAt ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Paid {new Date(data.dseEntryPaidAt).toLocaleDateString()}
          </div>
        ) : (
          <>
            {data.entryChannel === "nbo" && (
              <div className="mt-3 rounded-lg border border-border p-3">
                <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><IdCard className="h-3.5 w-3.5" /> NBO Identification — required before paying</div>
                <p className="mt-1 text-[11px] text-muted-foreground">Every NBO participant must present their BEF number or NBO Identity card number. Nigerian NBO participants paying via Paystack must also provide a means of identification.</p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  <input
                    type="text" placeholder="BEF number" value={idForm.befNumber}
                    onChange={(e) => setIdForm((f) => ({ ...f, befNumber: e.target.value }))}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  />
                  <input
                    type="text" placeholder="NBO Identity card number" value={idForm.nboIdCardNumber}
                    onChange={(e) => setIdForm((f) => ({ ...f, nboIdCardNumber: e.target.value }))}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  />
                  <select
                    value={idForm.nigeriaIdType} onChange={(e) => setIdForm((f) => ({ ...f, nigeriaIdType: e.target.value }))}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  >
                    <option value="">Nigeria ID type (for Paystack) — optional</option>
                    {NIGERIA_ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input
                    type="text" placeholder="Nigeria ID number" value={idForm.nigeriaIdNumber}
                    onChange={(e) => setIdForm((f) => ({ ...f, nigeriaIdNumber: e.target.value }))}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  />
                </div>
                <button
                  onClick={saveIdentification} disabled={savingId}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60"
                >
                  {savingId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save identification
                </button>
                {hasNboId && (
                  <p className="mt-2 text-[11px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> BEF number / NBO Identity card on file.</p>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => goCheckout("dse-stripe", () => dseFn({ data: { provider: "stripe" } }))}
                disabled={busyKey === "dse-stripe" || (data.entryChannel === "nbo" && !hasNboId)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busyKey === "dse-stripe" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Pay ${DSE_ENTRY_USD[data.entryChannel as EntryChannel]} via Stripe
              </button>
              {data.entryChannel === "nbo" && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => goCheckout("dse-paystack", () => dseFn({ data: { provider: "paystack" } }))}
                    disabled={busyKey === "dse-paystack" || !hasNboId || !hasNigeriaId}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-2 text-sm font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60"
                  >
                    {busyKey === "dse-paystack" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Pay ₦{DSE_ENTRY_NGN_NBO.toLocaleString()} via Paystack (Nigeria)
                  </button>
                  <p className="text-[10px] text-muted-foreground">NBO's own further-subsidized local rate — {LOCAL_EQUIVALENT_DISCLAIMER}.</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* DFY Remittances */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4" /> DFY Remittances</h2>
        <p className="mt-1 text-xs text-muted-foreground">20% of every qualified month's net income, via Stripe.</p>
        {data.unpaidDfyMonths.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">Nothing outstanding.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {data.unpaidDfyMonths.map((m: any) => (
              <div key={m.id} className="rounded-lg border border-border p-3 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm">
                  <span className="font-semibold">{new Date(m.period_month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
                  <span className="text-muted-foreground"> — ${Number(m.remittance_owed_usd).toFixed(2)} owed</span>
                </div>
                <button
                  onClick={() => goCheckout(`dfy-${m.id}`, () => dfyFn({ data: { dfy_month_id: m.id } }))}
                  disabled={busyKey === `dfy-${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busyKey === `dfy-${m.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Pay via Stripe
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SUC Entry */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><Rocket className="h-4 w-4" /> SUC Entry</h2>
        {data.sucEntryPaidAt ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Paid {new Date(data.sucEntryPaidAt).toLocaleDateString()} — {data.sucEntryTier && SUC_ENTRY_TIERS[data.sucEntryTier as SucEntryTier]?.label}
          </div>
        ) : (
          <div className="mt-3 grid sm:grid-cols-3 gap-3">
            {sucTierEntries.map(([key, tier]) => (
              <div key={key} className="rounded-lg border border-border p-3">
                <div className="font-display text-xl font-bold">${tier.usd.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{tier.label} · {tier.equityPercent}% equity</div>
                <button
                  onClick={() => goCheckout(`suc-${key}`, () => sucFn({ data: { tier: key } }))}
                  disabled={busyKey === `suc-${key}`}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busyKey === `suc-${key}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Pay via Stripe
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      {data.transactions.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 overflow-x-auto">
          <h2 className="font-display text-lg font-bold">Payment History</h2>
          <table className="mt-3 w-full text-xs min-w-[560px]">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                <th className="py-1.5 pr-3">Date</th><th className="py-1.5 pr-3">Purpose</th><th className="py-1.5 pr-3">Provider</th>
                <th className="py-1.5 pr-3">Amount</th><th className="py-1.5 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t: any) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="py-1.5 pr-3">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="py-1.5 pr-3">{PAYMENT_PURPOSE_LABELS[t.purpose as keyof typeof PAYMENT_PURPOSE_LABELS] ?? t.purpose}</td>
                  <td className="py-1.5 pr-3 capitalize">{t.provider}</td>
                  <td className="py-1.5 pr-3">{t.charged_currency === "NGN" ? `₦${Number(t.charged_amount).toLocaleString()}` : `$${Number(t.charged_amount).toFixed(2)}`}</td>
                  <td className="py-1.5 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest ${
                      t.status === "succeeded" ? "bg-emerald-500/15 text-emerald-600"
                      : t.status === "failed" ? "bg-crimson/15 text-crimson"
                      : "bg-muted text-muted-foreground"
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
