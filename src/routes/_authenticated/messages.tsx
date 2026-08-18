import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { getMyRep, listMyMentorships } from "@/lib/mentorship.functions";
import { listMembers, listMessageRequests, sendMessageRequest, respondToMessageRequest } from "@/lib/social.functions";
import { directCallUrl, cohortCallUrl } from "@/lib/video";
import { toast } from "sonner";
import {
  MessageSquare, Send, Video, Loader2, Shield, Users, User, Plus, Check, X, Globe,
  Paperclip, Camera, Smile, Sticker as StickerIcon, FileText,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "Messages — DBI Citadel" },
      {
        name: "description",
        content:
          "Cohort rooms, the general DBI chat, mentorship threads and private conversations inside the DBI Citadel.",
      },
    ],
  }),
  component: MessagesPage,
});

type Contact = { key: string; id: string; name: string; sub: string; icon: any; avatarUrl?: string | null };
type Member = { id: string; full_name: string | null; avatar_url: string | null; email?: string | null };

function MessagesPage() {
  const { user } = useSession();
  const getRep = useServerFn(getMyRep);
  const listMine = useServerFn(listMyMentorships);
  const fetchMembers = useServerFn(listMembers);
  const fetchRequests = useServerFn(listMessageRequests);
  const askToMessage = useServerFn(sendMessageRequest);
  const answerRequest = useServerFn(respondToMessageRequest);

  const [profile, setProfile] = useState<any>(null);
  const [rep, setRep] = useState<any>(null);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>("dbi");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const refreshRequests = async () => {
    const r = await fetchRequests({ data: undefined as never }).catch(() => []);
    setRequests(r as any[]);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, r, m, mem, req] = await Promise.all([
        supabase.from("profiles").select("id,full_name,cohort_id").eq("id", user.id).maybeSingle(),
        getRep({ data: undefined as never }).catch(() => null),
        listMine({ data: undefined as never }).catch(() => []),
        fetchMembers({ data: undefined as never }).catch(() => []),
        fetchRequests({ data: undefined as never }).catch(() => []),
      ]);
      setProfile(prof);
      setRep(r);
      setMentorships(m as any[]);
      setMembers(mem as Member[]);
      setRequests(req as any[]);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [user]);

  const contacts: Contact[] = useMemo(() => {
    const list: Contact[] = [];
    const seen = new Set<string>();
    const push = (c: Contact) => {
      if (!c.id || seen.has(c.id)) return;
      seen.add(c.id);
      list.push(c);
    };
    if (rep)
      push({
        key: `dm:${rep.id}`,
        id: rep.id,
        name: rep.full_name ?? rep.email ?? "Your DSE Rep",
        sub: "DSE Rep",
        icon: Shield,
        avatarUrl: rep.avatar_url,
      });
    const mentor = mentorships.find((m) => m.role === "mentee" && m.status === "active");
    if (mentor?.partner?.id)
      push({
        key: `dm:${mentor.partner.id}`,
        id: mentor.partner.id,
        name: mentor.partner.full_name ?? "Your mentor",
        sub: "Mentor",
        icon: User,
        avatarUrl: mentor.partner.avatar_url,
      });
    for (const m of mentorships.filter((x) => x.role === "mentor" && x.status === "active")) {
      if (m.partner?.id)
        push({
          key: `dm:${m.partner.id}`,
          id: m.partner.id,
          name: m.partner.full_name ?? "Mentee",
          sub: "Mentee",
          icon: User,
          avatarUrl: m.partner.avatar_url,
        });
    }
    // Accepted message requests open a conversation immediately, both ways.
    for (const r of requests.filter((x) => x.status === "accepted")) {
      if (r.partner?.id)
        push({
          key: `dm:${r.partner.id}`,
          id: r.partner.id,
          name: r.partner.full_name ?? r.partner.email ?? "Member",
          sub: "Private",
          icon: MessageSquare,
          avatarUrl: r.partner.avatar_url,
        });
    }
    return list;
  }, [rep, mentorships, requests]);

  // Every user's avatar this page knows about, keyed by id — sourced from
  // the member directory plus contacts (rep/mentors/mentees/requests),
  // so group and cohort bubbles can show a sender's photo without an
  // extra fetch per message.
  const avatarById = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const mem of members) m.set(mem.id, mem.avatar_url);
    for (const c of contacts) m.set(c.id, c.avatarUrl ?? null);
    return m;
  }, [members, contacts]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading messages…</div>;

  const activeContact = contacts.find((c) => c.key === selected);
  const cohortSelected = selected === "cohort";
  const dbiSelected = selected === "dbi";

  const incoming = requests.filter((r) => r.direction === "incoming" && r.status === "pending");
  const outgoing = requests.filter((r) => r.direction === "outgoing" && r.status === "pending");
  const openIds = new Set(contacts.map((c) => c.id));
  const pendingIds = new Set([...incoming, ...outgoing].map((r) => r.partner?.id));

  const startRequest = async (id: string) => {
    try {
      const res: any = await askToMessage({ data: { recipient_id: id } });
      await refreshRequests();
      toast.success(res?.status === "accepted" ? "Conversation opened." : "Message request sent.");
      setPickerOpen(false);
      setSearch("");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not send the request.");
    }
  };

  const respond = async (request_id: string, accept: boolean) => {
    try {
      await answerRequest({ data: { request_id, accept } });
      await refreshRequests();
      toast.success(accept ? "Conversation opened." : "Request declined.");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not respond.");
    }
  };

  const filteredMembers = members.filter((m) => {
    const label = `${m.full_name ?? ""} ${m.email ?? ""}`.toLowerCase();
    return !search.trim() || label.includes(search.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" /> Messages
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Messages</h1>
      </header>

      {incoming.length > 0 && (
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4">
          <div className="text-[10px] tracking-widest text-gold-deep">Message Requests</div>
          <ul className="mt-2 space-y-2">
            {incoming.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <strong>{r.partner?.full_name ?? r.partner?.email ?? "A member"}</strong> wants to start a private
                  conversation.
                </span>
                <span className="flex items-center gap-2">
                  <button
                    onClick={() => respond(r.id, true)}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => respond(r.id, false)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    <X className="h-3.5 w-3.5" /> Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-[240px_1fr] gap-4 rounded-2xl border border-border bg-card overflow-hidden min-h-[520px]">
        {/* CONTACT LIST */}
        <div className="border-b md:border-b-0 md:border-r border-border p-3 space-y-1">
          <button
            onClick={() => setSelected("dbi")}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${dbiSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate font-medium">DBI General</span>
              <span
                className={`block text-[10px] tracking-widest ${dbiSelected ? "opacity-80" : "text-muted-foreground"}`}
              >
                Everyone in the incubator
              </span>
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
                <span
                  className={`block text-[10px] tracking-widest ${cohortSelected ? "opacity-80" : "text-muted-foreground"}`}
                >
                  Successes · performance · encouragement
                </span>
              </span>
            </button>
          )}

          <div className="pt-3 mt-2 border-t border-border space-y-1">
            {contacts.length === 0 && (
              <p className="text-xs text-muted-foreground p-2">No private conversations yet.</p>
            )}
            {contacts.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelected(c.key)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selected === c.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <Avatar url={c.avatarUrl} icon={c.icon} size="h-7 w-7" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span
                    className={`block text-[10px] tracking-widest ${selected === c.key ? "opacity-80" : "text-muted-foreground"}`}
                  >
                    {c.sub}
                  </span>
                </span>
              </button>
            ))}
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="w-full flex items-center gap-2 rounded-lg border border-dashed border-gold/50 px-3 py-2 text-left text-xs font-semibold text-gold-deep hover:bg-gold/10"
            >
              <Plus className="h-4 w-4 shrink-0" /> New conversation
            </button>
            {pickerOpen && (
              <div className="rounded-lg border border-border p-2 space-y-1">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members…"
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                />
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredMembers.length === 0 && (
                    <p className="text-[11px] text-muted-foreground p-1">No members found.</p>
                  )}
                  {filteredMembers.map((m) => {
                    const already = openIds.has(m.id);
                    const pending = pendingIds.has(m.id);
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate">{m.full_name ?? m.email}</span>
                        {already ? (
                          <span className="text-[10px] text-muted-foreground shrink-0">Open</span>
                        ) : pending ? (
                          <span className="text-[10px] text-muted-foreground shrink-0">Pending</span>
                        ) : (
                          <button
                            onClick={() => startRequest(m.id)}
                            className="shrink-0 rounded-md border border-gold px-2 py-1 text-[10px] font-semibold text-gold-deep hover:bg-gold/10"
                          >
                            Request
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* THREAD / PANEL */}
        <div className="flex flex-col">
          {activeContact && user && <DmThread key={activeContact.key} meId={user.id} counterpart={activeContact} />}
          {dbiSelected && <GroupThread myName={profile?.full_name ?? "Member"} avatarById={avatarById} />}
          {cohortSelected && profile?.cohort_id && (
            <CohortThread cohortId={profile.cohort_id} myName={profile.full_name ?? "Beneficiary"} avatarById={avatarById} />
          )}
          {!activeContact && !cohortSelected && !dbiSelected && (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground p-6 text-center">
              Pick a conversation on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MESSAGE_ATTACHMENTS_BUCKET = "message-attachments";
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/** Bucket is private — attachment_url stores the object's storage path, not a fetchable URL. Sign it on read. */
async function uploadMessageAttachment(file: File, userId: string): Promise<{ path: string; type: string }> {
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error("Files must be under 20MB.");
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const { error } = await supabase.storage.from(MESSAGE_ATTACHMENTS_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return { path, type: file.type || "application/octet-stream" };
}

function AttachmentPreview({ path, type }: { path: string; type: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    supabase.storage.from(MESSAGE_ATTACHMENTS_BUCKET).createSignedUrl(path, 3600).then(({ data }: { data: { signedUrl: string } | null }) => {
      if (alive && data?.signedUrl) setUrl(data.signedUrl);
    });
    return () => {
      alive = false;
    };
  }, [path]);

  const filename = path.split("/").pop() ?? "attachment";

  if (!url) return <div className="mt-1.5 text-[10px] italic opacity-70">Loading attachment…</div>;

  if (type.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="Attachment" className="mt-1.5 max-h-48 w-auto rounded-lg border border-border/50 object-cover" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-1.5 flex items-center gap-1.5 rounded-md border border-border/50 bg-background/40 px-2 py-1.5 text-xs underline"
    >
      <FileText className="h-3.5 w-3.5 shrink-0" /> <span className="truncate max-w-[180px]">{filename}</span>
    </a>
  );
}

/** A message body is treated as a "sticker" — rendered oversized, no bubble chrome — when it's a short run of emoji with no attachment and no ordinary text. */
function isStickerBody(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 8) return false;
  return /\p{Extended_Pictographic}/u.test(trimmed) && !/[a-zA-Z0-9]/.test(trimmed);
}

/** Profile photo everywhere someone shows up in Messages — falls back to a generic icon when there's no avatar_url. */
function Avatar({ url, icon: Icon, size = "h-6 w-6" }: { url?: string | null; icon?: any; size?: string }) {
  if (url) {
    return <img src={url} alt="" className={`${size} shrink-0 rounded-full object-cover border border-gold/40`} />;
  }
  const FallbackIcon = Icon ?? User;
  return (
    <span className={`${size} shrink-0 rounded-full bg-muted grid place-items-center border border-gold/40`}>
      <FallbackIcon className="h-3.5 w-3.5" />
    </span>
  );
}

function Bubble({
  mine, name, body, at, attachmentPath, attachmentType, avatarUrl,
}: {
  mine: boolean; name?: string | null; body: string; at: string;
  attachmentPath?: string | null; attachmentType?: string | null; avatarUrl?: string | null;
}) {
  const sticker = !attachmentPath && isStickerBody(body);
  return (
    <div className={`flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && !sticker && <Avatar url={avatarUrl} size="h-6 w-6" />}
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          sticker ? "bg-transparent px-1" : mine ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {!mine && name && <div className="text-[10px] font-semibold text-gold-deep mb-0.5">{name}</div>}
        {attachmentPath && <AttachmentPreview path={attachmentPath} type={attachmentType ?? "application/octet-stream"} />}
        {body && (sticker ? <div className="text-4xl leading-none">{body}</div> : <div className="whitespace-pre-wrap break-words">{body}</div>)}
        <div className={`mt-1 text-[9px] ${sticker ? "text-muted-foreground" : mine ? "opacity-70" : "text-muted-foreground"}`}>
          {new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

const EMOJIS = [
  "😀", "😂", "😅", "😊", "😍", "🤔", "😎", "🙌", "👍", "👏",
  "🙏", "💪", "🔥", "🎉", "✅", "❤️", "💯", "🚀", "😢", "😮",
  "🤝", "👀", "🫡", "😴", "🥳", "🤯", "😤", "🙈", "✨", "⚡",
];
const STICKERS = ["🎉", "🔥", "👏", "💪", "🚀", "🏆", "❤️", "😂", "🙌", "✅", "💯", "🎯"];

function EmojiPopover({ emojis, onPick, big }: { emojis: string[]; onPick: (e: string) => void; big?: boolean }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 z-20 grid grid-cols-6 gap-1 rounded-xl border border-border bg-card p-2 shadow-regal w-56">
      {emojis.map((e, i) => (
        <button
          key={`${e}-${i}`}
          type="button"
          onClick={() => onPick(e)}
          className={`rounded-md p-1 hover:bg-muted ${big ? "text-2xl" : "text-lg"}`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

type PendingAttachment = { path: string; type: string; name: string };

function Composer({
  userId,
  onSend,
  sending,
  placeholder,
}: {
  userId: string;
  onSend: (body: string, attachment: { path: string; type: string } | null) => Promise<void> | void;
  sending: boolean;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emojiOpen && !stickerOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
        setStickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [emojiOpen, stickerOpen]);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { path, type } = await uploadMessageAttachment(file, userId);
      setAttachment({ path, type, name: file.name });
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() && !attachment) return;
    await onSend(value.trim(), attachment ? { path: attachment.path, type: attachment.type } : null);
    setValue("");
    setAttachment(null);
  };

  const sendSticker = async (emoji: string) => {
    setStickerOpen(false);
    await onSend(emoji, null);
  };

  const busy = sending || uploading;

  return (
    <div ref={wrapRef} className="border-t border-border">
      {attachment && (
        <div className="flex items-center justify-between gap-2 px-3 pt-2 text-xs text-muted-foreground">
          <span className="truncate inline-flex items-center gap-1">
            <Paperclip className="h-3 w-3 shrink-0" /> {attachment.name}
          </span>
          <button type="button" onClick={() => setAttachment(null)} className="shrink-0 hover:text-crimson" aria-label="Remove attachment">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <form onSubmit={submit} className="flex items-center gap-1 p-3">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          title="Attach a file"
          className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
          title="Camera"
          className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => { setEmojiOpen((v) => !v); setStickerOpen(false); }}
            title="Emoji"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <Smile className="h-4 w-4" />
          </button>
          {emojiOpen && <EmojiPopover emojis={EMOJIS} onPick={(e) => setValue((v) => v + e)} />}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => { setStickerOpen((v) => !v); setEmojiOpen(false); }}
            title="Stickers"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <StickerIcon className="h-4 w-4" />
          </button>
          {stickerOpen && <EmojiPopover emojis={STICKERS} big onPick={sendSticker} />}
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={uploading ? "Uploading…" : placeholder}
          disabled={uploading}
          className="flex-1 min-w-0 rounded-full border border-input bg-background px-4 py-2 text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || (!value.trim() && !attachment)}
          className="shrink-0 rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

function DmThread({ meId, counterpart }: { meId: string; counterpart: Contact }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${meId},recipient_id.eq.${counterpart.id}),and(sender_id.eq.${counterpart.id},recipient_id.eq.${meId})`,
      )
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessages(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [counterpart.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (bodyText: string, attachment: { path: string; type: string } | null) => {
    setSending(true);
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: meId,
      recipient_id: counterpart.id,
      body: bodyText,
      attachment_url: attachment?.path ?? null,
      attachment_type: attachment?.type ?? null,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Avatar url={counterpart.avatarUrl} icon={counterpart.icon} size="h-8 w-8" />
          <div>
            <div className="font-semibold">{counterpart.name}</div>
            <div className="text-[10px] tracking-widest text-muted-foreground">{counterpart.sub}</div>
          </div>
        </div>
        <a
          href={directCallUrl(meId, counterpart.id)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10"
        >
          <Video className="h-3.5 w-3.5" /> Video call
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — say hello.</p>}
        {messages.map((m) => (
          <Bubble key={m.id} mine={m.sender_id === meId} body={m.body} at={m.created_at} attachmentPath={m.attachment_url} attachmentType={m.attachment_type} avatarUrl={counterpart.avatarUrl} />
        ))}
        <div ref={bottomRef} />
      </div>
      <Composer userId={meId} onSend={send} sending={sending} placeholder="Write a message…" />
    </>
  );
}

function GroupThread({ myName, avatarById }: { myName: string; avatarById: Map<string, string | null> }) {
  const { user } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("group_messages")
      .select("*")
      .eq("room", "dbi")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessages(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (bodyText: string, attachment: { path: string; type: string } | null) => {
    if (!user) return;
    setSending(true);
    const { error } = await supabase.from("group_messages").insert({
      room: "dbi",
      sender_id: user.id,
      sender_name: myName,
      body: bodyText,
      attachment_url: attachment?.path ?? null,
      attachment_type: attachment?.type ?? null,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <div className="font-semibold">DBI General</div>
          <div className="text-[10px] tracking-widest text-muted-foreground">Every member of the incubator</div>
        </div>
        <a
          href={cohortCallUrl("dbi-general")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10"
        >
          <Video className="h-3.5 w-3.5" /> Group call
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — open the room.</p>}
        {messages.map((m) => (
          <Bubble key={m.id} mine={m.sender_id === user?.id} name={m.sender_name} body={m.body} at={m.created_at} attachmentPath={m.attachment_url} attachmentType={m.attachment_type} avatarUrl={avatarById.get(m.sender_id)} />
        ))}
        <div ref={bottomRef} />
      </div>
      {user && <Composer userId={user.id} onSend={send} sending={sending} placeholder="Share with DBI…" />}
    </>
  );
}

function CohortThread({ cohortId, myName, avatarById }: { cohortId: string; myName: string; avatarById: Map<string, string | null> }) {
  const { user } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("cohort_messages")
      .select("*")
      .eq("cohort_id", cohortId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessages(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [cohortId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (bodyText: string, attachment: { path: string; type: string } | null) => {
    if (!user) return;
    setSending(true);
    const { error } = await supabase.from("cohort_messages").insert({
      cohort_id: cohortId,
      sender_id: user.id,
      sender_name: myName,
      body: bodyText,
      attachment_url: attachment?.path ?? null,
      attachment_type: attachment?.type ?? null,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <div className="font-semibold">Cohort chat</div>
          <div className="text-[10px] tracking-widest text-muted-foreground">Successes · performance · engagement</div>
        </div>
        <a
          href={cohortCallUrl(cohortId)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold/10"
        >
          <Video className="h-3.5 w-3.5" /> Group call
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — share a win.</p>}
        {messages.map((m) => (
          <Bubble key={m.id} mine={m.sender_id === user?.id} name={m.sender_name} body={m.body} at={m.created_at} attachmentPath={m.attachment_url} attachmentType={m.attachment_type} avatarUrl={avatarById.get(m.sender_id)} />
        ))}
        <div ref={bottomRef} />
      </div>
      {user && <Composer userId={user.id} onSend={send} sending={sending} placeholder="Share with the cohort…" />}
    </>
  );
}
