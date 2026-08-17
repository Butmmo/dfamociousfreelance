import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { getMyRep, listMyMentorships } from "@/lib/mentorship.functions";
import {
  listGeneralMembers,
  listMyRequestedContacts,
  listMyMessageRequests,
  requestConversation,
  respondToMessageRequest,
} from "@/lib/messaging.functions";
import { directCallUrl, cohortCallUrl, generalCallUrl } from "@/lib/video";
import { toast } from "sonner";
import { MessageSquare, Send, Video, Loader2, Shield, Users, User, Globe2, UserPlus, Inbox, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Messages — DBI Citadel" }] }),
  component: MessagesPage,
});

type Contact = { key: string; id: string; name: string; sub: string; icon: any };
type Member = { id: string; full_name: string | null; avatar_url: string | null; email?: string | null };

function MessagesPage() {
  const { user } = useSession();
  const getRep = useServerFn(getMyRep);
  const listMine = useServerFn(listMyMentorships);
  const listGeneral = useServerFn(listGeneralMembers);
  const listRequested = useServerFn(listMyRequestedContacts);
  const listRequests = useServerFn(listMyMessageRequests);
  const requestConv = useServerFn(requestConversation);
  const respond = useServerFn(respondToMessageRequest);

  const [profile, setProfile] = useState<any>(null);
  const [rep, setRep] = useState<any>(null);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [generalMembers, setGeneralMembers] = useState<Member[]>([]);
  const [requestedContacts, setRequestedContacts] = useState<Member[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [adHoc, setAdHoc] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const loadAll = async () => {
    const [{ data: prof }, r, m, gm, rc, mr] = await Promise.all([
      supabase.from("profiles").select("id,full_name,cohort_id").eq("id", user!.id).maybeSingle(),
      getRep({ data: undefined as never }).catch(() => null),
      listMine({ data: undefined as never }).catch(() => []),
      listGeneral({ data: undefined as never }).catch(() => []),
      listRequested({ data: undefined as never }).catch(() => []),
      listRequests({ data: undefined as never }).catch(() => []),
    ]);
    setProfile(prof);
    setRep(r);
    setMentorships(m);
    setGeneralMembers(gm as Member[]);
    setRequestedContacts(rc as Member[]);
    setMyRequests(mr);
  };

  useEffect(() => {
    if (!user) return;
    loadAll().finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [user]);

  const refreshRequests = async () => {
    const mr = await listRequests({ data: undefined as never }).catch(() => []);
    setMyRequests(mr);
  };

  const contacts: Contact[] = useMemo(() => {
    const byId = new Map<string, Contact>();
    if (rep) byId.set(rep.id, { key: `dm:${rep.id}`, id: rep.id, name: rep.full_name ?? rep.email ?? "Your DSE Rep", sub: "DSE Rep", icon: Shield });
    const mentor = mentorships.find((m) => m.role === "mentee" && m.status === "active");
    if (mentor?.partner?.id && !byId.has(mentor.partner.id)) {
      byId.set(mentor.partner.id, { key: `dm:${mentor.partner.id}`, id: mentor.partner.id, name: mentor.partner.full_name ?? "Your mentor", sub: "Mentor", icon: User });
    }
    for (const m of mentorships.filter((x) => x.role === "mentor" && x.status === "active")) {
      if (m.partner?.id && !byId.has(m.partner.id)) {
        byId.set(m.partner.id, { key: `dm:${m.partner.id}`, id: m.partner.id, name: m.partner.full_name ?? "Mentee", sub: "Mentee", icon: User });
      }
    }
    for (const c of [...requestedContacts, ...adHoc]) {
      if (!byId.has(c.id)) byId.set(c.id, { key: `dm:${c.id}`, id: c.id, name: c.full_name ?? "Member", sub: "Connected", icon: User });
    }
    return Array.from(byId.values());
  }, [rep, mentorships, requestedContacts, adHoc]);

  const connectedIds = useMemo(() => new Set(contacts.map((c) => c.id)), [contacts]);
  const incomingPending = myRequests.filter((r) => r.direction === "incoming" && r.status === "pending");

  const handleMessageMember = async (member: Member) => {
    try {
      const res: any = await requestConv({ data: { recipient_id: member.id } });
      if (res.alreadyConnected || res.accepted) {
        setAdHoc((prev) => (prev.some((p) => p.id === member.id) ? prev : [...prev, member]));
        setSelected(`dm:${member.id}`);
        toast.success(res.accepted ? "Request accepted — conversation started." : "Conversation ready.");
      } else {
        toast.success("Message request sent — you'll be able to chat once they accept.");
      }
      refreshRequests();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not send request.");
    }
  };

  const handleRespond = async (r: any, accept: boolean) => {
    try {
      await respond({ data: { request_id: r.id, accept } });
      if (accept && r.counterpart) {
        setAdHoc((prev) => (prev.some((p) => p.id === r.counterpart.id) ? prev : [...prev, r.counterpart]));
        setSelected(`dm:${r.counterpart.id}`);
        toast.success("Request accepted — conversation started.");
      } else {
        toast.success("Request declined.");
      }
      refreshRequests();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not respond.");
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading messages…</div>;

  const activeContact = contacts.find((c) => c.key === selected);
  const cohortSelected = selected === "cohort";
  const generalSelected = selected === "general";
  const browseSelected = selected === "browse";
  const requestsSelected = selected === "requests";

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
        <div className="border-b md:border-b-0 md:border-r border-border p-3 space-y-1 md:max-h-[600px] md:overflow-y-auto">
          {contacts.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No conversations yet — browse people to start one.</p>
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

          <div className="border-t border-border pt-2 mt-2 space-y-1">
            <button
              onClick={() => setSelected("general")}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${generalSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Globe2 className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-medium">General DBI chat</span>
                <span className={`block text-[10px] tracking-widest ${generalSelected ? "opacity-80" : "text-muted-foreground"}`}>Everyone in the Citadel</span>
              </span>
            </button>
            {profile?.cohort_id && (
              <button
                onClick={() => setSelected("cohort")}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${cohortSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">Cohort chat</span>
                  <span className={`block text-[10px] tracking-widest ${cohortSelected ? "opacity-80" : "text-muted-foreground"}`}>Successes · performance · encouragement</span>
                </span>
              </button>
            )}
          </div>

          <div className="border-t border-border pt-2 mt-2 space-y-1">
            <button
              onClick={() => setSelected("browse")}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${browseSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span className="block truncate font-medium">Browse people</span>
            </button>
            <button
              onClick={() => setSelected("requests")}
              className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${requestsSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <span className="flex items-center gap-2">
                <Inbox className="h-4 w-4 shrink-0" />
                <span className="font-medium">Requests</span>
              </span>
              {incomingPending.length > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${requestsSelected ? "bg-primary-foreground text-primary" : "bg-crimson text-white"}`}>
                  {incomingPending.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* THREAD / PANEL */}
        <div className="flex flex-col">
          {activeContact && user && (
            <DmThread key={activeContact.key} meId={user.id} counterpart={activeContact} />
          )}
          {cohortSelected && profile?.cohort_id && (
            <CohortThread cohortId={profile.cohort_id} myName={profile.full_name ?? "Beneficiary"} />
          )}
          {generalSelected && user && (
            <GeneralThread myName={profile?.full_name ?? "Beneficiary"} />
          )}
          {browseSelected && (
            <MemberBrowser members={generalMembers} connectedIds={connectedIds} onMessage={handleMessageMember} />
          )}
          {requestsSelected && (
            <RequestsPanel requests={myRequests} onRespond={handleRespond} />
          )}
          {!activeContact && !cohortSelected && !generalSelected && !browseSelected && !requestsSelected && (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground p-6 text-center">
              Pick a conversation on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberBrowser({ members, connectedIds, onMessage }: { members: Member[]; connectedIds: Set<string>; onMessage: (m: Member) => void }) {
  return (
    <div className="p-4 space-y-2 overflow-y-auto md:max-h-[600px]">
      <p className="text-xs text-muted-foreground mb-2">
        Everyone in the DBI Citadel. Message anyone directly — if you're not already connected, a request goes out first and the conversation opens once they confirm.
      </p>
      {members.length === 0 && <p className="text-xs text-muted-foreground">No one else here yet.</p>}
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{m.full_name ?? m.email ?? "Member"}</div>
          </div>
          <button
            onClick={() => onMessage(m)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10"
          >
            {connectedIds.has(m.id) ? "Open chat" : "Message"}
          </button>
        </div>
      ))}
    </div>
  );
}

function RequestsPanel({ requests, onRespond }: { requests: any[]; onRespond: (r: any, accept: boolean) => void }) {
  const incoming = requests.filter((r) => r.direction === "incoming" && r.status === "pending");
  const outgoing = requests.filter((r) => r.direction === "outgoing" && r.status === "pending");
  const past = requests.filter((r) => r.status !== "pending");

  return (
    <div className="p-4 space-y-6 overflow-y-auto md:max-h-[600px]">
      <div>
        <h3 className="text-xs font-semibold tracking-widest text-gold-deep mb-2">INCOMING</h3>
        {incoming.length === 0 && <p className="text-xs text-muted-foreground">No pending requests.</p>}
        <div className="space-y-2">
          {incoming.map((r) => (
            <div key={r.id} className="rounded-lg border border-border px-3 py-2">
              <div className="text-sm font-medium">{r.counterpart?.full_name ?? "Someone"}</div>
              {r.message && <p className="text-xs text-muted-foreground mt-0.5">"{r.message}"</p>}
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => onRespond(r, true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
                  <Check className="h-3 w-3" /> Accept
                </button>
                <button onClick={() => onRespond(r, false)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted">
                  <X className="h-3 w-3" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold tracking-widest text-gold-deep mb-2">SENT — AWAITING REPLY</h3>
        {outgoing.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
        <div className="space-y-2">
          {outgoing.map((r) => (
            <div key={r.id} className="rounded-lg border border-border px-3 py-2 text-sm">
              {r.counterpart?.full_name ?? "Someone"}
            </div>
          ))}
        </div>
      </div>
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground mb-2">PAST</h3>
          <div className="space-y-1">
            {past.map((r) => (
              <div key={r.id} className="text-xs text-muted-foreground px-1">
                {r.counterpart?.full_name ?? "Someone"} — {r.status}
              </div>
            ))}
          </div>
        </div>
      )}
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

function GeneralThread({ myName }: { myName: string }) {
  const { user } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("general_messages").select("*").order("created_at", { ascending: true }).limit(200);
    if (error) { toast.error(error.message); return; }
    setMessages(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("general_messages").insert({
      sender_id: user.id, sender_name: myName, body: body.trim(),
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
          <div className="font-semibold">General DBI chat</div>
          <div className="text-[10px] tracking-widest text-muted-foreground">The whole Citadel, in one room</div>
        </div>
        <a href={generalCallUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10">
          <Video className="h-3.5 w-3.5" /> Group call
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — say hello to the Citadel.</p>}
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
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share with the Citadel…" className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm" />
        <button type="submit" disabled={sending} className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}
