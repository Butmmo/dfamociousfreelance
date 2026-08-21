import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";

type NotificationRow = {
  id: string;
  category: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Every push notification this app fires also lands in public.notifications
 * (see _shared/push.ts) — this is the in-app history of that log, for
 * anyone without a working push subscription or who just missed the toast.
 */
export function NotificationBell() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    refreshUnread();
    const interval = setInterval(refreshUnread, 20_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const loadList = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id,category,title,body,url,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as any) ?? []);
    setLoading(false);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const openNotification = async (n: NotificationRow) => {
    setOpen(false);
    if (!n.read_at) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i)));
    }
    if (n.url) navigate({ to: n.url });
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = items.filter((i) => !i.read_at).map((i) => i.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
    setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })));
    setUnread(0);
  };

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative p-2 rounded-md hover:bg-muted text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-crimson ring-2 ring-card" />
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-w-[90vw] rounded-xl border border-border bg-card shadow-regal py-1.5 z-50 max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[10px] tracking-widest text-gold-deep font-semibold">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground underline">
                Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <div className="px-3 py-6 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-xs text-center text-muted-foreground">Nothing yet.</p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => openNotification(n)}
                className={`w-full text-left px-3 py-2.5 border-t border-border first:border-t-0 hover:bg-muted transition ${!n.read_at ? "bg-gold/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read_at && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />}
                  <div className="min-w-0">
                    <div className={`text-xs ${!n.read_at ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">{relativeTime(n.created_at)}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
