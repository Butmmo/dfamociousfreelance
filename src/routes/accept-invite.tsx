import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/accept-invite")({
  head: () => ({ meta: [{ title: "Set your password — DBI" }] }),
  component: AcceptInvite,
});

function AcceptInvite() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the magic-link hash automatically.
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password set. Welcome to the citadel.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <DfsMark className="h-16 w-16 mx-auto" />
          <Motto className="mt-4 inline-block" />
          <h1 className="mt-4 font-display text-3xl font-bold">Set your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome, beneficiary. Choose the password you'll use to enter the citadel from now on.
          </p>
        </div>

        {!hasSession ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-6 text-center">
            <ShieldCheck className="h-10 w-10 mx-auto text-gold-deep" />
            <p className="mt-4 text-sm text-muted-foreground">
              This page requires a valid invitation link. Open the link sent to your email, or
              <Link to="/auth" className="text-primary hover:underline ml-1">go to login</Link>.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-xl border border-border bg-card p-6 shadow-regal">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">New password</span>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Confirm password</span>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </label>
            <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Set password & enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
