// Generic Web Push entrypoint. Two callers:
//   - pg_net triggers (DFY verification, admin/council actions, etc.) that
//     don't run inside a Deno process and need an HTTP hop in.
//   - client-side calls (e.g. right after a message send) via
//     supabase.functions.invoke("send-push", { body: {...} }).
// Edge functions that already run in this Deno runtime (mentorship-
// escalation-notify, bps-weekly-report) import sendWebPush from
// ../_shared/push.ts directly instead of hopping through this HTTP layer.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }
  const { user_ids, category, title, body, url } = payload ?? {};

  if (!Array.isArray(user_ids) || typeof title !== "string" || typeof body !== "string") {
    return new Response(JSON.stringify({ error: "user_ids: string[], title, body are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await sendWebPush(supa, {
    user_ids,
    category: category ?? "general",
    title,
    body,
    url,
  });

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
