import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { useIsMobile } from "@/lib/use-is-mobile";
import { WalkthroughDesktop } from "./WalkthroughDesktop";
import { WalkthroughMobile } from "./WalkthroughMobile";

/**
 * Mounted once in the authenticated layout, so it only ever (re)appears on
 * an actual app load/reload — not on every internal navigation, since
 * TanStack Router keeps this layout mounted across route changes.
 *
 * "Skip" writes nothing to the database on purpose — the tour is meant to
 * come back next reload. Only "Don't show this again" persists, via
 * profiles.onboarding_dismissed_at. `replaySignal` is an incrementing
 * counter the profile menu's "Replay walkthrough" action bumps to force
 * it open again without touching that dismissed state.
 */
export function Walkthrough({ replaySignal }: { replaySignal: number }) {
  const { user } = useSession();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles").select("onboarding_dismissed_at").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      if (!(data as any)?.onboarding_dismissed_at) { setStep(0); setOpen(true); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (replaySignal > 0) { setStep(0); setOpen(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replaySignal]);

  const skip = () => setOpen(false);

  const dontShowAgain = async () => {
    if (!user) { setOpen(false); return; }
    setSaving(true);
    await supabase.from("profiles").update({ onboarding_dismissed_at: new Date().toISOString() } as never).eq("id", user.id);
    setSaving(false);
    setOpen(false);
  };

  if (!open || !user) return null;

  const shared = { step, setStep, onSkip: skip, onDontShowAgain: dontShowAgain, saving };
  return isMobile ? <WalkthroughMobile {...shared} /> : <WalkthroughDesktop {...shared} />;
}
