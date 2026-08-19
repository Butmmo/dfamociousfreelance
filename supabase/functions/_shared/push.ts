// Shared Web Push sender — every notification-worthy event in the app
// (escalations, mentorship, BPS, DFY, admin/council actions, messages)
// funnels through this one function, either directly (edge functions that
// already run in this Deno runtime import it) or via the send-push HTTP
// entrypoint (DB triggers over pg_net, and client-side calls).
//
// "message" is the one category a beneficiary can silence — see
// profiles.push_messages_enabled — every other category always fires to
// every subscription a user has, by design (BEF's discipline framework
// applies to sanctions, not to whether a mentor's escalation reaches you).

// deno-lint-ignore-file no-explicit-any
import webpush from "npm:web-push@3.6.7";

export type PushCategory =
  | "escalation"
  | "mentorship"
  | "bps"
  | "dfy"
  | "admin"
  | "message"
  | "general";

export interface SendPushArgs {
  user_ids: string[];
  category: PushCategory;
  title: string;
  body: string;
  url?: string;
}

export async function sendWebPush(supa: any, args: SendPushArgs) {
  const { user_ids, category, title, body, url } = args;
  const ids = Array.from(new Set((user_ids ?? []).filter(Boolean)));
  if (ids.length === 0) return { sent: 0, skipped: "no recipients" };

  const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { sent: 0, skipped: "VAPID keys not configured" };
  }
  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:boluwatifefamokunwa@gmail.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );

  let recipientIds = ids;
  if (category === "message") {
    const { data: prefs } = await supa
      .from("profiles")
      .select("id,push_messages_enabled")
      .in("id", ids);
    const optedOut = new Set(
      (prefs ?? []).filter((p: any) => p.push_messages_enabled === false).map((p: any) => p.id),
    );
    recipientIds = ids.filter((id) => !optedOut.has(id));
  }
  if (recipientIds.length === 0) return { sent: 0, skipped: "all recipients opted out" };

  const { data: subs } = await supa
    .from("push_subscriptions")
    .select("*")
    .in("user_id", recipientIds);
  if (!subs || subs.length === 0) return { sent: 0, skipped: "no active subscriptions" };

  const payload = JSON.stringify({ title, body, url: url ?? "/", category });
  let sent = 0;
  const stale: string[] = [];
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent++;
    } catch (err: any) {
      const status = err?.statusCode;
      if (status === 404 || status === 410) stale.push(sub.id);
    }
  }
  if (stale.length > 0) {
    await supa.from("push_subscriptions").delete().in("id", stale);
  }
  return { sent, stale: stale.length, attempted: subs.length };
}
