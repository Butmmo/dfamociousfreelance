import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { dfyProgress, sucPace, type DfyMonthRow } from "@/lib/dfy";
import { computePaymentsGate, type PaymentsGate } from "@/lib/payments";

function yearsElapsed(startDate: string | null, now = new Date()): number {
  if (!startDate) return 0;
  const days = Math.max(0, (now.getTime() - new Date(startDate).getTime()) / 86_400_000);
  return days / 365.25;
}

const CLOSED_GATE: PaymentsGate = {
  showPaymentsLink: false, sucSectionUnlocked: false, dseButtonsClickable: false, enteredSucDirect: false,
};

/** Shared by the nav (show/hide the Payments link) and the Payments page itself (section/button gating) — one query, one source of truth. */
export function usePaymentsGate(): { gate: PaymentsGate; loading: boolean } {
  const { user, loading: sessionLoading } = useSession();
  const [gate, setGate] = useState<PaymentsGate>(CLOSED_GATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) { setLoading(false); return; }
    let alive = true;
    (async () => {
      const [{ data: profile }, { data: months }] = await Promise.all([
        supabase.from("profiles").select("dse_entry_paid_at,suc_entry_paid_at,vetted_dse_certified_at,start_date").eq("id", user.id).maybeSingle(),
        supabase.from("dfy_months").select("period_month,net_income_usd,qualified,remittance_owed_usd,remittance_paid,status").eq("user_id", user.id),
      ]);
      if (!alive) return;
      const rows = (months as any as DfyMonthRow[]) ?? [];
      const progress = dfyProgress(rows);
      const pace = sucPace(progress.cumulativeNetIncomeUsd, yearsElapsed((profile as any)?.start_date ?? null));
      setGate(computePaymentsGate({
        dseEntryPaidAt: (profile as any)?.dse_entry_paid_at ?? null,
        sucEntryPaidAt: (profile as any)?.suc_entry_paid_at ?? null,
        vettedDseCertifiedAt: (profile as any)?.vetted_dse_certified_at ?? null,
        dfyComplete: progress.complete,
        sucPaceQualifies: pace.qualifies,
        hasUnpaidDfyRemittance: rows.some((r) => r.qualified && !r.remittance_paid),
      }));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user, sessionLoading]);

  return { gate, loading };
}
