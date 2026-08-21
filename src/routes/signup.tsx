import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitSignup } from "@/lib/signup.functions";
import { checkNin } from "@/lib/payments.functions";
import { DSE_ENTRY_USD, DSE_ENTRY_NGN_NBO, LOCAL_EQUIVALENT_DISCLAIMER, type EntryChannel } from "@/lib/payments";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, IdCard, Send, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Apply — DBI" }] }),
  component: SignupPage,
});

function SignupPage() {
  const submitFn = useServerFn(submitSignup);
  const checkNinFn = useServerFn(checkNin);

  const [redirectState, setRedirectState] = useState<"paid" | "cancelled" | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [entryChannel, setEntryChannel] = useState<EntryChannel>("direct");
  const [befNumber, setBefNumber] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [ninVerified, setNinVerified] = useState(false);
  const [verifyingNin, setVerifyingNin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") setRedirectState("paid");
    else if (params.get("cancelled") === "1") setRedirectState("cancelled");
  }, []);

  // NIN verification is tied to the exact number+name pair it was checked
  // against — editing either after a successful check invalidates it, so
  // the ₦75,000 button can never ride on a stale verification.
  useEffect(() => { setNinVerified(false); }, [ninNumber, fullName]);

  const verifyNin = async () => {
    if (!fullName.trim()) { toast.error("Enter your full name first."); return; }
    if (!/^\d{11}$/.test(ninNumber.trim())) { toast.error("NIN must be 11 digits."); return; }
    setVerifyingNin(true);
    try {
      await checkNinFn({ data: { full_name: fullName.trim(), nin_number: ninNumber.trim() } });
      setNinVerified(true);
      toast.success("NIN verified.");
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't verify that NIN.");
    }
    setVerifyingNin(false);
  };

  const pay = async (currency: "USD" | "NGN") => {
    if (!fullName.trim() || !email.trim()) { toast.error("Fill in your name and email."); return; }
    if (entryChannel === "nbo" && !befNumber.trim()) { toast.error("Provide your BEF Reg. Number."); return; }
    if (currency === "NGN" && !ninVerified) { toast.error("Verify your NIN first."); return; }
    setBusyKey(currency);
    try {
      const { url } = await submitFn({
        data: {
          full_name: fullName.trim(), email: email.trim(), country: country.trim() || undefined,
          sponsor_name: sponsorName.trim() || undefined, entry_channel: entryChannel,
          bef_number: befNumber.trim() || undefined,
          nin_number: currency === "NGN" ? ninNumber.trim() : undefined,
          currency,
        },
      });
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't start checkout.");
      setBusyKey(null);
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
            Fill in your details and pay the DSE entry fee. Your account is created the moment payment is confirmed —
            the founder assigns your cohort afterward.
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
          <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6 shadow-regal">
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

            {entryChannel === "nbo" && (
              <>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5" /> BEF Reg. Number — required
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Your BEF Registration Number is enough to confirm NBO access — no separate NBO Identity card needed.
                  </p>
                  <input type="text" placeholder="BEF Reg. Number" value={befNumber} onChange={(e) => setBefNumber(e.target.value)}
                    className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verify your NIN — unlocks the ₦75,000 local rate
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Only Nigerian NBO applicants who verify their NIN against their name above can pay the further-subsidized
                    local rate. Just the 11-digit number — no NIN slip or ID card upload needed. Everyone else pays ${DSE_ENTRY_USD.nbo} via Paystack.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input type="text" placeholder="NIN (11 digits)" value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                    <button type="button" onClick={verifyNin} disabled={verifyingNin || ninVerified}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60 whitespace-nowrap">
                      {verifyingNin ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      {ninVerified ? "Verified" : "Verify NIN"}
                    </button>
                  </div>
                  {ninVerified && (
                    <p className="mt-2 text-[11px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> NIN verified — the local rate is unlocked below.</p>
                  )}
                </div>
              </>
            )}

            <div className="pt-2 space-y-2">
              <span className="text-xs tracking-widest text-muted-foreground font-medium">Pay with Paystack</span>
              <button type="button" onClick={() => pay("USD")} disabled={busyKey !== null}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-regal">
                {busyKey === "USD" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Pay ${dseAmount} via Paystack
              </button>
              {entryChannel === "nbo" && ninVerified && (
                <button type="button" onClick={() => pay("NGN")} disabled={busyKey !== null}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gold px-4 py-3 font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60">
                  {busyKey === "NGN" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Pay ₦{DSE_ENTRY_NGN_NBO.toLocaleString()} via Paystack (Nigeria)
                </button>
              )}
              <p className="text-[10px] text-muted-foreground">
                Stripe is temporarily unavailable — every payment runs through Paystack for now, in USD or (once verified) NGN.
              </p>
            </div>

            <p className="text-xs text-muted-foreground border-t border-border pt-4">
              Already have an account? <Link to="/auth" className="text-primary hover:underline">Log in</Link> and use the Payments page instead.
            </p>
          </div>
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
