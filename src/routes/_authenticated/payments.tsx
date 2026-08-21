import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { usePaymentsGate } from "@/lib/use-payments-gate";
import {
  getMyPayments, createDseEntryCheckout, createDfyRemittanceCheckout, createSucEntryCheckout,
  verifyAndSaveNin,
} from "@/lib/payments.functions";
import {
  DSE_ENTRY_USD, DSE_ENTRY_NGN_NBO, LOCAL_EQUIVALENT_DISCLAIMER, SUC_ENTRY_TIERS,
  PAYMENT_PURPOSE_LABELS, type SucEntryTier, type EntryChannel,
} from "@/lib/payments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Loader2, CheckCircle2, Send, GraduationCap, TrendingUp, Rocket, IdCard, Save, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments — DBI Citadel" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { user } = useSession();
  const { gate } = usePaymentsGate();
  const summaryFn = useServerFn(getMyPayments);
  const dseFn = useServerFn(createDseEntryCheckout);
  const dfyFn = useServerFn(createDfyRemittanceCheckout);
  const sucFn = useServerFn(createSucEntryCheckout);
  const verifyAndSaveNinFn = useServerFn(verifyAndSaveNin);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [befNumber, setBefNumber] = useState("");
  const [savingBef, setSavingBef] = useState(false);
  const [ninNumber, setNinNumber] = useState("");
  const [verifyingNin, setVerifyingNin] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const d = await summaryFn({ data: undefined as never });
      setData(d);
      setBefNumber(d.befNumber ?? "");
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

  const saveBefNumber = async () => {
    if (!user) return;
    if (!befNumber.trim()) { toast.error("Provide your BEF Reg. Number."); return; }
    setSavingBef(true);
    const { error } = await supabase.from("profiles").update({ bef_number: befNumber.trim() }).eq("id", user.id);
    if (error) { toast.error(error.message); setSavingBef(false); return; }
    toast.success("BEF Reg. Number saved.");
    setSavingBef(false);
    refresh();
  };

  const verifyNin = async () => {
    if (!/^\d{11}$/.test(ninNumber.trim())) { toast.error("NIN must be 11 digits."); return; }
    setVerifyingNin(true);
    try {
      await verifyAndSaveNinFn({ data: { nin_number: ninNumber.trim() } });
      toast.success("NIN verified — the local rate is unlocked.");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't verify that NIN.");
    }
    setVerifyingNin(false);
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return null;

  const sucTierEntries = Object.entries(SUC_ENTRY_TIERS) as [SucEntryTier, typeof SUC_ENTRY_TIERS[SucEntryTier]][];
  const hasBefNumber = !!data.befNumber;
  const ninVerified = data.nigeriaIdType === "nin" && !!data.nigeriaIdVerifiedAt;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5" /> Payments
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Payments</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          DSE entry, DFY remittances, and SUC entry — all handled here, all via Paystack for now (Stripe is temporarily
          unavailable). NBO-subsidized DSE entry from Nigeria can pay the further-subsidized local rate once your NIN is verified.
        </p>
      </header>

      {/* DSE Entry */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><GraduationCap className="h-4 w-4" /> DSE Entry</h2>
        {data.dseEntryPaidAt ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Paid {new Date(data.dseEntryPaidAt).toLocaleDateString()}
          </div>
        ) : !gate.dseButtonsClickable ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Your DSE entry access is already active. Payment for it is handled by your DSE Rep or an admin — reach out
            to them if you'd like to arrange or confirm it.
          </p>
        ) : (
          <>
            {data.entryChannel === "nbo" && (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><IdCard className="h-3.5 w-3.5" /> BEF Reg. Number — required before paying</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Your BEF Registration Number is enough to confirm NBO access — no separate NBO Identity card needed.</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text" placeholder="BEF Reg. Number" value={befNumber}
                      onChange={(e) => setBefNumber(e.target.value)}
                      className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    />
                    <button
                      onClick={saveBefNumber} disabled={savingBef}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60 whitespace-nowrap"
                    >
                      {savingBef ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                    </button>
                  </div>
                  {hasBefNumber && (
                    <p className="mt-2 text-[11px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> BEF Reg. Number on file.</p>
                  )}
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Verify your NIN — unlocks the ₦75,000 local rate</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Just the 11-digit number, checked against your name — no NIN slip or ID card upload needed.
                  </p>
                  {ninVerified ? (
                    <p className="mt-2 text-[11px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> NIN verified {data.nigeriaIdVerifiedAt && `on ${new Date(data.nigeriaIdVerifiedAt).toLocaleDateString()}`}.</p>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <input type="text" placeholder="NIN (11 digits)" value={ninNumber}
                        onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                      <button onClick={verifyNin} disabled={verifyingNin}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60 whitespace-nowrap">
                        {verifyingNin ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />} Verify NIN
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => goCheckout("dse-usd", () => dseFn({ data: { currency: "USD" } }))}
                disabled={busyKey === "dse-usd" || (data.entryChannel === "nbo" && !hasBefNumber)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busyKey === "dse-usd" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Pay ${DSE_ENTRY_USD[data.entryChannel as EntryChannel]} via Paystack
              </button>
              {data.entryChannel === "nbo" && ninVerified && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => goCheckout("dse-ngn", () => dseFn({ data: { currency: "NGN" } }))}
                    disabled={busyKey === "dse-ngn"}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-2 text-sm font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60"
                  >
                    {busyKey === "dse-ngn" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
        <p className="mt-1 text-xs text-muted-foreground">20% of every qualified month's net income, via Paystack.</p>
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
                  {busyKey === `dfy-${m.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Pay via Paystack
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SUC Entry — hidden until you qualify or have at least finished DFY, except once already paid */}
      {(data.sucEntryPaidAt || gate.sucSectionUnlocked) && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><Rocket className="h-4 w-4" /> SUC Entry</h2>
          {data.sucEntryPaidAt ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Paid {new Date(data.sucEntryPaidAt).toLocaleDateString()} — {data.sucEntryTier && SUC_ENTRY_TIERS[data.sucEntryTier as SucEntryTier]?.label}
            </div>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                The Standard tier needs an actual SUC invitation — that verification isn't built yet, so only the
                direct-entry tiers are payable for now.
              </p>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                {sucTierEntries.map(([key, tier]) => {
                  const payable = key !== "standard_2000";
                  return (
                    <div key={key} className="rounded-lg border border-border p-3">
                      <div className="font-display text-xl font-bold">${tier.usd.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{tier.label} · {tier.equityPercent}% equity</div>
                      <button
                        onClick={() => goCheckout(`suc-${key}`, () => sucFn({ data: { tier: key } }))}
                        disabled={!payable || busyKey === `suc-${key}`}
                        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        {busyKey === `suc-${key}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : !payable ? <Lock className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                        {payable ? "Pay via Paystack" : "Not available yet"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

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
