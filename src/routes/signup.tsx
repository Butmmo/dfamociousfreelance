import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listOpenCohorts, submitSignup } from "@/lib/signup.functions";
import { DSE_ENTRY_USD, DSE_ENTRY_NGN_NBO, LOCAL_EQUIVALENT_DISCLAIMER, type EntryChannel } from "@/lib/payments";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, IdCard, Send } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Apply — DBI" }] }),
  component: SignupPage,
});

const NIGERIA_ID_TYPES: { value: string; label: string }[] = [
  { value: "nin", label: "NIN" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "International Passport" },
];

type Cohort = { id: string; name: string; start_date: string; description: string | null };

function SignupPage() {
  const listCohortsFn = useServerFn(listOpenCohorts);
  const submitFn = useServerFn(submitSignup);

  const [redirectState, setRedirectState] = useState<"paid" | "cancelled" | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [entryChannel, setEntryChannel] = useState<EntryChannel>("direct");
  const [cohortId, setCohortId] = useState("");
  const [befNumber, setBefNumber] = useState("");
  const [nboIdCardNumber, setNboIdCardNumber] = useState("");
  const [nigeriaIdType, setNigeriaIdType] = useState("");
  const [nigeriaIdNumber, setNigeriaIdNumber] = useState("");
  const [provider, setProvider] = useState<"stripe" | "paystack">("stripe");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") setRedirectState("paid");
    else if (params.get("cancelled") === "1") setRedirectState("cancelled");
  }, []);

  useEffect(() => {
    listCohortsFn({ data: undefined as never })
      .then((rows: any) => { setCohorts(rows); if (rows.length > 0) setCohortId(rows[0].id); })
      .catch(() => toast.error("Couldn't load open cohorts."))
      .finally(() => setLoadingCohorts(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (entryChannel !== "nbo" && provider === "paystack") setProvider("stripe");
  }, [entryChannel, provider]);

  const hasNboId = !!(befNumber.trim() || nboIdCardNumber.trim());
  const hasNigeriaId = !!(nigeriaIdType && nigeriaIdNumber.trim());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortId) { toast.error("Pick a cohort to apply to."); return; }
    if (entryChannel === "nbo" && !hasNboId) {
      toast.error("Provide your BEF number or NBO Identity card number."); return;
    }
    if (provider === "paystack" && !hasNigeriaId) {
      toast.error("Nigerian NBO applicants must provide a means of identification for Paystack."); return;
    }
    setSubmitting(true);
    try {
      const { url } = await submitFn({
        data: {
          full_name: fullName.trim(), email: email.trim(), country: country.trim() || undefined,
          sponsor_name: sponsorName.trim() || undefined, entry_channel: entryChannel, cohort_id: cohortId,
          bef_number: befNumber.trim() || undefined, nbo_id_card_number: nboIdCardNumber.trim() || undefined,
          nigeria_id_type: (nigeriaIdType || undefined) as any, nigeria_id_number: nigeriaIdNumber.trim() || undefined,
          provider,
        },
      });
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't start checkout.");
      setSubmitting(false);
    }
  };

  const dseAmount = DSE_ENTRY_USD[entryChannel];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-4 text-center">
          <DfsMark className="h-14 w-14 mx-auto" />
          <Motto className="mt-3 inline-block" />
          <h1 className="mt-4 font-display text-3xl font-bold">Apply for DSE Entry</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in your details, pick a cohort, and pay the DSE entry fee. Your account is created — and you're
            added to the cohort — the moment payment is confirmed.
          </p>
        </div>

        {redirectState === "paid" ? (
          <div className="mt-8 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600" />
            <h2 className="mt-3 font-display text-xl font-bold">Payment received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is being created. Check your email for a link to set your password and step inside —
              it can take a few minutes to arrive.
            </p>
            <Link to="/auth" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Already got the email? Go to login <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6 shadow-regal">
            {redirectState === "cancelled" && (
              <div className="rounded-lg border border-crimson/40 bg-crimson/10 p-3 text-xs text-crimson flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" /> Checkout was cancelled — your details below weren't saved. Fill the form again when you're ready.
              </div>
            )}

            <Field label="Full name" value={fullName} onChange={setFullName} required />
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Country" value={country} onChange={setCountry} />
            <Field label="Sponsor name (optional)" value={sponsorName} onChange={setSponsorName} placeholder="Boluwatife Famokunwa" />

            <label className="block">
              <span className="text-xs tracking-widest text-muted-foreground font-medium">Entry channel</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setEntryChannel("direct")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${entryChannel === "direct" ? "border-primary bg-primary/10 text-primary" : "border-input"}`}>
                  Direct — ${DSE_ENTRY_USD.direct}
                </button>
                <button type="button" onClick={() => setEntryChannel("nbo")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${entryChannel === "nbo" ? "border-primary bg-primary/10 text-primary" : "border-input"}`}>
                  NBO — ${DSE_ENTRY_USD.nbo}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                NBO's subsidized rate is for Next Blazers beneficiaries only ({LOCAL_EQUIVALENT_DISCLAIMER}).
              </p>
            </label>

            <label className="block">
              <span className="text-xs tracking-widest text-muted-foreground font-medium">Cohort</span>
              {loadingCohorts ? (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading open cohorts…</div>
              ) : cohorts.length === 0 ? (
                <p className="mt-2 text-xs text-crimson">No cohorts are currently open. Contact an admin.</p>
              ) : (
                <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} required
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm">
                  {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </label>

            {entryChannel === "nbo" && (
              <div className="rounded-lg border border-border p-3">
                <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" /> NBO Identification — required
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Every NBO participant must present their BEF number or NBO Identity card number. Nigerian NBO
                  applicants paying via Paystack must also provide a means of identification.
                </p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  <input type="text" placeholder="BEF number" value={befNumber} onChange={(e) => setBefNumber(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                  <input type="text" placeholder="NBO Identity card number" value={nboIdCardNumber} onChange={(e) => setNboIdCardNumber(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                  <select value={nigeriaIdType} onChange={(e) => setNigeriaIdType(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                    <option value="">Nigeria ID type (for Paystack) — optional</option>
                    {NIGERIA_ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input type="text" placeholder="Nigeria ID number" value={nigeriaIdNumber} onChange={(e) => setNigeriaIdNumber(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-xs tracking-widest text-muted-foreground font-medium">Pay with</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setProvider("stripe")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${provider === "stripe" ? "border-primary bg-primary/10 text-primary" : "border-input"}`}>
                  Stripe (international) — ${dseAmount}
                </button>
                <button type="button" disabled={entryChannel !== "nbo"} onClick={() => setProvider("paystack")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-40 ${provider === "paystack" ? "border-primary bg-primary/10 text-primary" : "border-input"}`}>
                  Paystack (Nigeria) — ₦{DSE_ENTRY_NGN_NBO.toLocaleString()}
                </button>
              </div>
              {entryChannel !== "nbo" && <p className="mt-1 text-[11px] text-muted-foreground">Paystack is only available for NBO-subsidized entry.</p>}
            </label>

            <button type="submit" disabled={submitting || loadingCohorts || cohorts.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-regal">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Continue to payment
            </button>

            <p className="text-xs text-muted-foreground border-t border-border pt-4">
              Already have an account? <Link to="/auth" className="text-primary hover:underline">Log in</Link> and use the Payments page instead.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs tracking-widest text-muted-foreground font-medium">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
