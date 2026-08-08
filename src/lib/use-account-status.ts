import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";

export interface AccountStatus {
  loading: boolean;
  suspended: boolean;
  suspendedAt: string | null;
  reason: string | null;
  feeUsd: number;
}

/** Reads the beneficiary's standing so the Citadel can bar a suspended account. */
export function useAccountStatus(): AccountStatus {
  const { user, isSuperAdmin, loading: sessionLoading } = useSession();
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let alive = true;
    supabase
      .from("profiles")
      .select("suspended, suspended_at, suspension_reason, reinstatement_fee_usd")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setRow(data ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user, sessionLoading]);

  return {
    loading: sessionLoading || loading,
    suspended: !isSuperAdmin && !!row?.suspended,
    suspendedAt: row?.suspended_at ?? null,
    reason: row?.suspension_reason ?? null,
    feeUsd: Number(row?.reinstatement_fee_usd ?? 10),
  };
}
