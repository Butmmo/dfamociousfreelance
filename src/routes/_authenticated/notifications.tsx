import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { relativeTime } from "@/lib/relative-time";
import { Bell, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DBI Citadel" }] }),
  component: NotificationsPage,
});

type NotificationRow = {
  id: string;
  category: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

const PAGE_SIZE = 25;

function NotificationsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unread, setUnread] = useState(0);

  const loadPage = async (offset: number) => {
    if (!user) return [];
    const { data } = await supabase
      .from("notifications")
      .select("id,category,title,body,url,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    return (data as any as NotificationRow[]) ?? [];
  };

  const refreshUnread = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    setUnread(count ?? 0);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const first = await loadPage(0);
      setItems(first);
      setHasMore(first.length === PAGE_SIZE);
      setLoading(false);
      refreshUnread();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMore = async () => {
    setLoadingMore(true);
    const next = await loadPage(items.length);
    setItems((prev) => [...prev, ...next]);
    setHasMore(next.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const openNotification = async (n: NotificationRow) => {
    if (!n.read_at) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i)));
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.url) navigate({ to: n.url });
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = items.filter((i) => !i.read_at).map((i) => i.id);
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    if (unreadIds.length > 0) {
      setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })));
    }
    setUnread(0);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Notifications</h1>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="rounded-md border border-input px-3 py-2 text-sm font-semibold hover:bg-muted">
            Mark all read ({unread})
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing yet — you'll see every notification the app fires here, even if you missed the push toast.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => openNotification(n)}
              className={`w-full text-left px-4 py-3.5 hover:bg-muted transition ${!n.read_at ? "bg-gold/5" : ""}`}
            >
              <div className="flex items-start gap-3">
                {!n.read_at && <span className="mt-1.5 h-2 w-2 rounded-full bg-gold shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-sm ${!n.read_at ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</div>
                    <span className="shrink-0 text-[10px] text-muted-foreground/70">{relativeTime(n.created_at)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                  <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{n.category}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} Load more
          </button>
        </div>
      )}
    </div>
  );
}
