import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { getMyRep, listMyMentorships } from "@/lib/mentorship.functions";
import { directCallUrl, cohortCallUrl } from "@/lib/video";
import { toast } from "sonner";
import { MessageSquare, Send, Video, Loader2, Shield, Users, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Messages — DBI Citadel" }] }),
  component: MessagesPage,
});

type Contact = { key: string; id: string; name: string; sub: string; icon: any };

function MessagesPage() {
  const { user } = useSession();
  const getRep = useServerFn(getMyRep);
  const listMine = useServerFn(listMyMentorships);

  const [profile, setProfile] = useState<any>(null);
  const [rep, setRep] = useState<any>(null);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, r, m] = await Promise.all([
        supabase.from("profiles").select("id,full_name,cohort_id").eq("id", user.id).maybeSingle(),
        getRep({ data: undefined as never }).catch(() => null),
        listMine({ data: undefined as never }).catch(() => []),
      ]);
      setProfile(prof);
      setRep(r);
      setMentorships(m);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [user]);

  const contacts: Contact[] = useMemo(() => {
    const list: Contact[] = [];
    if (rep) list.push({ key: `dm:${rep.id}`, id: rep.id, name: rep.full_name ?? rep.email ?? "Your DSE Rep", sub: "DSE Rep", icon: Shield });
    const mentor = mentorships.find((m) => m.role === "mentee" && m.status === "active");
    if (mentor) list.push({ key: `dm:${mentor.partner?.id}`, id: mentor.partner?.id, name: mentor.partner?.full_name ?? "Your mentor", sub: "Mentor", icon: User });
    for (const m of mentorships.filter((x) => x.role === "mentor" && x.status === "active")) {
      if (m.partner?.id) list.push({ key: `dm:${m.partner.id}`, id: m.partner.id, name: m.partner.full_name ?? "Mentee", sub: "Mentee", icon: User });
    }
    return list;
  }, [rep, mentorships]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading messages…</div>;

  const activeContact = contacts.find((c) => c.key === selected);
  const cohortSelected = selected === "cohort";

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" /> Messages
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Messages</h1>
      </header>

      <div className="grid md:grid-cols-[240px_1fr] gap-4 rounded-2xl border border-border bg-card overflow-hidden min-h-[520px]">
        {/* CONTACT LIST */}
        <div className="border-b md:border-b-0 md:border-r border-border p-3 space-y-1">
          {contacts.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No DSE Rep or mentorship contacts yet.</p>
          )}
          {contacts.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selected === c.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <c.icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{c.name}</span>
                <span className={`block text-[10px] tracking-widest ${selected === c.key ? "opacity-80" : "text-muted-foreground"}`}>{c.sub}</span>
              </span>
            </button>
          ))}
          {profile?.cohort_id && (
            <button
              onClick={() => setSelected("cohort")}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm mt-2 border-t border-border pt-3 ${cohortSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-medium">Cohort chat</span>
                <span className={`block text-[10px] tracking-widest ${cohortSelected ? "opacity-80" : "text-muted-foreground"}`}>Successes · performance · encouragement</span>
              </span>
            </button>
          )}
        </div>

        {/* THREAD */}
        <div className="flex flex-col">
          {activeContact && user && (
            <DmThread key={activeContact.key} meId={user.id} counterpart={activeContact} />
          )}
          {cohortSelected && profile?.cohort_id && (
            <CohortThread cohortId={profile.cohort_id} myName={profile.full_name ?? "Beneficiary"} />
          )}
          {!activeContact && !cohortSelected && (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground p-6 text-center">
              Pick a conversation on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DmThread({ meId, counterpart }: { meId: string; counterpart: Contact }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${meId},recipient_id.eq.${counterpart.id}),and(sender_id.eq.${counterpart.id},recipient_id.eq.${meId})`)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) { toast.error(error.message); return; }
    setMessages(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [counterpart.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: meId, recipient_id: counterpart.id, body: body.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <div className="font-semibold">{counterpart.name}</div>
          <div className="text-[10px] tracking-widest text-muted-foreground">{counterpart.sub}</div>
        </div>
        <a href={directCallUrl(meId, counterpart.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10">
          <Video className="h-3.5 w-3.5" /> Video call
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — say hello.</p>}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.body}
                <div className={`mt-1 text-[9px] ${mine ? "opacity-70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm" />
        <button type="submit" disabled={sending} className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}

function CohortThread({ cohortId, myName }: { cohortId: string; myName: string }) {
  const { user } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("cohort_messages").select("*").eq("cohort_id", cohortId).order("created_at", { ascending: true }).limit(200);
    if (error) { toast.error(error.message); return; }
    setMessages(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [cohortId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("cohort_messages").insert({
      cohort_id: cohortId, sender_id: user.id, sender_name: myName, body: body.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <div className="font-semibold">Cohort chat</div>
          <div className="text-[10px] tracking-widest text-muted-foreground">Successes · performance · engagement</div>
        </div>
        <a href={cohortCallUrl(cohortId)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10">
          <Video className="h-3.5 w-3.5" /> Group call
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — share a win.</p>}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {!mine && <div className="text-[10px] font-semibold text-gold-deep mb-0.5">{m.sender_name}</div>}
                {m.body}
                <div className={`mt-1 text-[9px] ${mine ? "opacity-70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share with the cohort…" className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm" />
        <button type="submit" disabled={sending} className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}
