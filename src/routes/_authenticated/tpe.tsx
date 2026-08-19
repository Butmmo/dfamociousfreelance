import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { TPE_TOPICS, TPE_PLAYBOOK_KEY, tpeProgressPercent } from "@/lib/tpe";
import { toast } from "sonner";
import { Headphones, CheckCircle2, Circle, Loader2, Save, NotebookPen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tpe")({
  head: () => ({
    meta: [
      { title: "TPE — DBI Citadel" },
      { name: "description", content: "Twelve audio sessions on what actually runs an enterprise." },
    ],
  }),
  component: TpePage,
});

function TpePage() {
  const [done, setDone] = useSyncedTaskMap(TPE_PLAYBOOK_KEY);
  const completedKeys = new Set(Object.keys(done).filter((k) => done[k]));
  const percent = tpeProgressPercent(completedKeys);

  const toggle = (key: string) => {
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <Headphones className="h-3.5 w-3.5" /> TPE
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Twelve sessions on running an enterprise</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Order, intelligence, leadership, communication, time, strategy, execution, systems, resilience, finance,
          culture and ethics — one session each. Listen, mark it done, and write down the one thing you're taking
          into the business this week.
        </p>
      </header>

      <div className="rounded-2xl border border-gold/40 bg-accent/20 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{completedKeys.size}/{TPE_TOPICS.length} sessions listened</span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-gold transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        {TPE_TOPICS.map((topic) => (
          <TopicCard key={topic.key} topicKey={topic.key} order={topic.order} title={topic.title} blurb={topic.blurb} audioUrl={topic.audioUrl}
            listened={!!done[topic.key]} onToggle={() => toggle(topic.key)} />
        ))}
      </div>
    </div>
  );
}

function TopicCard({
  topicKey, order, title, blurb, audioUrl, listened, onToggle,
}: {
  topicKey: string; order: number; title: string; blurb: string; audioUrl: string;
  listened: boolean; onToggle: () => void;
}) {
  const { user } = useSession();
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadNote = async () => {
    if (loaded || !user) return;
    const { data } = await supabase
      .from("tpe_reflections").select("note").eq("user_id", user.id).eq("topic_key", topicKey).maybeSingle();
    setNote((data as any)?.note ?? "");
    setLoaded(true);
  };

  const saveNote = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("tpe_reflections")
      .upsert({ user_id: user.id, topic_key: topicKey, note } as never, { onConflict: "user_id,topic_key" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Takeaway saved.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] tracking-widest text-gold-deep">Session {order}</div>
          <h2 className="mt-0.5 font-display text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
        </div>
        <button
          onClick={onToggle}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
            listened ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600" : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {listened ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
          {listened ? "Listened" : "Mark as listened"}
        </button>
      </div>

      <audio controls preload="none" className="mt-4 w-full" src={audioUrl}>
        Your browser doesn't support inline audio — download the session instead.
      </audio>

      {!expanded ? (
        <button
          onClick={() => { setExpanded(true); loadNote(); }}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep hover:underline"
        >
          <NotebookPen className="h-3.5 w-3.5" /> Write your takeaway
        </button>
      ) : (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[10px] tracking-widest text-gold-deep">Your takeaway</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="The one thing from this session you're actually going to apply this week…"
            rows={3}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={saveNote}
            disabled={saving}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save takeaway
          </button>
        </div>
      )}
    </div>
  );
}
