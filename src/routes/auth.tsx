import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Beneficiary Login — DBI" }] }),
  component: AuthPage,
});

type Mode = "login" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back, beneficiary.");
    navigate({ to: "/dashboard" });
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/accept-invite`,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("If that email is on the rolls, a reset link is on its way.");
    setMode("login");
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("Google sign-in failed"); setBusy(false); return; }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-royal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.78_0.13_80/0.2),transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> Back to the citadel
          </Link>
          <div>
            <Motto className="text-gold" />
            <h2 className="mt-4 font-display text-4xl font-bold">Welcome back, beneficiary.</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md">
              The gate recognises only those whom the council has invited. Step inside.
            </p>
          </div>
          <div className="text-xs text-primary-foreground/60">© D'Famocious Group · Fortuna Audentes Iuvat</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <DfsMark className="h-12 w-12" />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold">DBI</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">Beneficiary Portal</div>
            </div>
          </div>

          {mode === "login" ? (
            <>
              <h1 className="font-display text-3xl font-bold">Beneficiary Login</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the credentials tied to your invitation email.
              </p>
              <form onSubmit={onLogin} className="mt-8 space-y-4">
                <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} required />
                <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} required />
                <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-regal">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                </button>
              </form>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
              </div>
              <button onClick={onGoogle} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-card px-4 py-3 font-medium hover:bg-accent/40 disabled:opacity-60">
                <GoogleIcon /> Continue with Google
              </button>
              <div className="mt-6 flex items-center justify-between text-sm">
                <button onClick={() => setMode("forgot")} className="text-primary hover:underline">Forgot password?</button>
                <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
              </div>
              <p className="mt-8 text-xs text-muted-foreground border-t border-border pt-6">
                No account yet? <Link to="/signup" className="text-primary hover:underline">Apply for DSE entry</Link> — fill your details, pick a cohort, and pay to get started.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold">Recover access</h1>
              <p className="mt-2 text-sm text-muted-foreground">We'll email a secure link to set a new password.</p>
              <form onSubmit={onForgot} className="mt-8 space-y-4">
                <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} required />
                <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
                </button>
              </form>
              <button onClick={() => setMode("login")} className="mt-6 text-sm text-primary hover:underline inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type, value, onChange, required }: {
  icon: React.ComponentType<{ className?: string }>; label: string; type: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs tracking-widest text-muted-foreground font-medium">{label}</span>
      <div className="mt-2 relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded-md border border-input bg-card pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}
