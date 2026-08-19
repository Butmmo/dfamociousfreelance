import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";

// This is a VAPID *public* key — by design, meant to ship in client JS.
// Its private counterpart lives only in the send-push edge function's
// VAPID_PRIVATE_KEY secret and never reaches the browser.
export const VAPID_PUBLIC_KEY =
  "BE2gJVLIiD3hwc7KuArfqViS44Pt-l5mEyp-M0FQ6tyTIu6s666BIfOnLuqLKytFVjeS9UTTnAhgijvvtHDahKo";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export interface PushSubscriptionState {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  loading: boolean;
  subscribe: () => Promise<boolean>;
}

/**
 * Push access is a prerequisite to using the Citadel (see the mandatory
 * gate in _authenticated/route.tsx) — every category except messages is
 * compulsory once subscribed. This hook owns the browser-side half of
 * that: registering the service worker, requesting permission, and
 * upserting the subscription row that send-push reads from.
 */
export function usePushSubscription(): PushSubscriptionState {
  const { user } = useSession();
  const supported =
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    supported ? Notification.permission : "unsupported",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(supported);

  useEffect(() => {
    if (!supported || !user) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const existing = await reg.pushManager.getSubscription();
        if (!alive) return;
        setSubscribed(!!existing);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [supported, user]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported || !user) return false;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const reg = await navigator.serviceWorker.register("/sw.js");
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }
      const json = sub.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
          user_agent: navigator.userAgent,
        },
        { onConflict: "endpoint" },
      );
      if (error) return false;
      setSubscribed(true);
      return true;
    } finally {
      setLoading(false);
    }
  }, [supported, user]);

  return { supported, permission, subscribed, loading, subscribe };
}
