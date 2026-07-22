// @ts-nocheck
// THE ASCENT — High-Ticket Sales Closing entry system.
// Access-controlled: only super admin, or beneficiaries granted ascent_access.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkMyAscentAccess } from "@/lib/ascent.functions";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { SaveBar } from "@/components/dfs/SaveBar";
import { Mountain, Lock, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ascent")({
  head: () => ({ meta: [{ title: "The Ascent — High-Ticket Closing" }] }),
  component: AscentPage,
});

const DAYS = [
  { day: 1, phase: 1, title: `Orientation & Self-Audit`,
    objective: `Learn how the game works and inventory what you're bringing to it.`,
    items: [
      { id: 'd1i1', xp: 10, text: `Study the CLOSER call-flow model at a glance (full breakdown in Scripts)` },
      { id: 'd1i2', xp: 15, text: `Write your 3–4 sentence "Why I Can Close" positioning statement` },
      { id: 'd1i3', xp: 10, text: `List 5+ transferable skills from your work history that map directly to sales` },
      { id: 'd1i4', xp: 15, text: `Set up your Warm List tracker (Notion or Sheets): two tables — Target Companies (Company | Niche | Tier | Source | Contact | Date | Status | Follow-up) and Warm Prospects (Name/handle | Where found | Signal shown | Engaged? | Notes)` },
    ]},
  { day: 2, phase: 1, title: `Master the CLOSER Framework`,
    objective: `Learn the exact, question-led conversation structure you'll run on every call.`,
    items: [
      { id: 'd2i1', xp: 15, text: `Read the CLOSER Framework (Scripts tab) and rewrite all six stages in your own words` },
      { id: 'd2i2', xp: 15, text: `Watch 2 hours of free sales-call breakdowns on YouTube relevant to your niche` },
      { id: 'd2i3', xp: 20, text: `Draft your first-pass responses to 3 likely objections, using the Universal Objection Method (Scripts tab)` },
      { id: 'd2i4', xp: 15, text: `Read the Mastery tab — the Five Core Philosophies and the Top 1% Habit Stack — and note which one challenges how you currently think about selling` },
    ]},
  { day: 3, phase: 1, title: `Niche Lock-In & Avatar Research`,
    objective: `Know exactly who buys your chosen niche's offer, and why.`,
    items: [
      { id: 'd3i1', xp: 20, text: `Write your ideal client avatar: who they are, their pain, their "before" and "after"` },
      { id: 'd3i2', xp: 15, text: `Read your niche's full card in Pick Lane — deal size, objections, watch-outs` },
      { id: 'd3i3', xp: 15, text: `Decide your Tier 1 criteria: what makes a target company "ideal" for you (size, price point, visible gaps)` },
    ]},
  { day: 4, phase: 1, title: `The Scout Method: Search Scouting`,
    objective: `Learn and run direct-search company discovery — the engine that replaces marketplaces.`,
    items: [
      { id: 'd4i1', xp: 15, text: `Read the Search Scouting method (Scout tab) in full` },
      { id: 'd4i2', xp: 30, text: `Run the search patterns for your niche and log every promising company you find` },
      { id: 'd4i3', xp: 10, text: `Tag each one Tier 1, 2, or 3 based on fit` },
    ]},
  { day: 5, phase: 1, title: `The Scout Method: YouTube Mining`,
    objective: `Find premium-offer sellers where they actually live — on camera.`,
    items: [
      { id: 'd5i1', xp: 15, text: `Read the YouTube Mining method (Scout tab)` },
      { id: 'd5i2', xp: 30, text: `Review 10+ channels in your niche; log every one with a real application or booking page` },
      { id: 'd5i3', xp: 10, text: `Note team-size signals for each (solo founder vs. visible team)` },
    ]},
  { day: 6, phase: 1, title: `The Scout Method: Track Active Closers`,
    objective: `Use other closers' public footprint as free market intelligence.`,
    items: [
      { id: 'd6i1', xp: 15, text: `Read the Track Active Closers method (Scout tab)` },
      { id: 'd6i2', xp: 25, text: `Find and log 5+ people currently working as closers or setters in your niche` },
      { id: 'd6i3', xp: 15, text: `Note every company they mention — each one is a validated target` },
    ]},
  { day: 7, phase: 1, title: `Consolidate the Warm List`,
    objective: `Turn three days of scouting into one clean, tiered target list.`,
    items: [
      { id: 'd7i1', xp: 20, text: `Merge everything from Days 4–6 into your tracker; remove duplicates` },
      { id: 'd7i2', xp: 15, text: `Confirm you have at least 25 logged companies, tiered 1–3` },
      { id: 'd7i3', xp: 50, badge: true, emoji: '🔭', text: `Recon Complete — you built a full target list through direct scouting, not marketplace scrolling` },
    ]},
  { day: 8, phase: 1, title: `Build Proof Asset #1 — The Pitch Video`,
    objective: `Create the 90-second video that does your talking for you.`,
    items: [
      { id: 'd8i1', xp: 15, text: `Script a 60–90 second "why hire me" video` },
      { id: 'd8i2', xp: 25, text: `Record it on your phone and upload unlisted (YouTube or free Loom)` },
      { id: 'd8i3', xp: 15, text: `Get one piece of feedback from anyone available and revise it once` },
    ]},
  { day: 9, phase: 1, title: `Build Proof Asset #2 — The Mock Call`,
    objective: `Prove — to yourself first — that you can run the framework live.`,
    items: [
      { id: 'd9i1', xp: 30, text: `Run a full mock sales call (roleplay both sides, or with a partner) on your niche avatar — ask more than you tell` },
      { id: 'd9i2', xp: 10, text: `Record it — a phone voice memo is enough` },
      { id: 'd9i3', xp: 15, text: `Self-score it against the rubric (Scripts tab) and note one fix` },
      { id: 'd9i5', xp: 15, text: `Run the Three Freedoms Questions during the call (Mastery tab) — push past the surface answer with "why" and "what can that create for you"` },
      { id: 'd9i4', xp: 40, badge: true, emoji: '📼', text: `On Tape — recorded and self-reviewed your first mock call` },
    ]},
  { day: 10, phase: 1, title: `Build Your Resume & Proof Hub`,
    objective: `Package everything into one link you can send in ten seconds.`,
    items: [
      { id: 'd10i1', xp: 20, text: `Write a one-page closer resume: your positioning statement, framework fluency, relevant experience` },
      { id: 'd10i2', xp: 25, text: `Build a free proof hub (Carrd, Notion, or Linktree) linking your video + resume + contact` },
      { id: 'd10i3', xp: 10, text: `Test the link on your own phone to confirm it loads cleanly` },
    ]},
  { day: 11, phase: 1, title: `Begin the Warm Prospect List`,
    objective: `Start identifying real people who are already showing they want what your niche sells.`,
    items: [
      { id: 'd11i1', xp: 15, text: `Read the Warm Prospect Sourcing method (Scout tab), including the ground rules` },
      { id: 'd11i2', xp: 25, text: `Find and engage 3–5 real people showing genuine buying-intent signals, with real, no-strings value only` },
      { id: 'd11i3', xp: 40, badge: true, emoji: '🌱', text: `Warm Hands — engaged your first real warm prospects` },
    ]},
  { day: 12, phase: 1, title: `Bespoke Loom Prep: Tier 1 Targets`,
    objective: `Prepare a video for your best-fit targets that could only be for them.`,
    items: [
      { id: 'd12i1', xp: 25, text: `For your top 5 Tier-1 companies, note one specific, real detail from their content to reference` },
      { id: 'd12i2', xp: 15, text: `Script a bespoke 45–60 second Loom outline per target — different from your general pitch video` },
    ]},
  { day: 13, phase: 1, title: `Record & Send Bespoke Looms`,
    objective: `Go live with your highest-leverage outreach.`,
    items: [
      { id: 'd13i1', xp: 35, text: `Record and send a bespoke Loom + resume to each of your 5 Tier-1 targets` },
      { id: 'd13i2', xp: 10, text: `Log every send with today's date` },
      { id: 'd13i3', xp: 50, badge: true, emoji: '🎯', text: `First Contact — your first outreach, personalized and scouted, not mass-applied` },
    ]},
  { day: 14, phase: 1, title: `First Broad Wave`,
    objective: `Extend outreach beyond Tier 1 without losing personalization.`,
    items: [
      { id: 'd14i1', xp: 30, text: `Send 10–15 personalized messages to Tier 2/3 targets, referencing something specific from each` },
      { id: 'd14i2', xp: 10, text: `Log every send in your tracker` },
    ]},
  { day: 15, phase: 1, title: `Phase 1 Review`,
    objective: `Audit the foundation before you scale it.`,
    items: [
      { id: 'd15i1', xp: 15, text: `Update every stat in your tracker: companies logged, outreach sent, warm prospects engaged` },
      { id: 'd15i2', xp: 15, text: `Name one thing that's working and one thing to adjust before Phase 2` },
    ]},

  { day: 16, phase: 2, title: `Fresh Scouting Sprint`,
    objective: `Keep the pipeline fed — scouting never fully stops.`,
    items: [
      { id: 'd16i1', xp: 30, text: `Run the Scout Method again (search or YouTube, your choice) for 8–10 new targets` },
      { id: 'd16i2', xp: 10, text: `Tier and log each one` },
    ]},
  { day: 17, phase: 2, title: `Outreach Wave`,
    objective: `Reach the newly scouted names plus your backlog.`,
    items: [
      { id: 'd17i1', xp: 30, text: `Send 15 personalized messages to newly scouted + backlog targets` },
      { id: 'd17i2', xp: 20, text: `Follow up on every Day 12–14 message with no reply (the +3-day rule)` },
      { id: 'd17i3', xp: 40, badge: true, emoji: '💬', text: `First Reply — a target company responded to your outreach` },
    ]},
  { day: 18, phase: 2, title: `Warm Prospect Engagement`,
    objective: `Keep building real, honest relationships in your niche's audience.`,
    items: [
      { id: 'd18i1', xp: 20, text: `Engage 3–5 more real prospects with genuine, no-strings value` },
      { id: 'd18i2', xp: 10, text: `Log new signals in your Warm Prospects table` },
    ]},
  { day: 19, phase: 2, title: `Follow-Up + Mock Call`,
    objective: `Discipline plus sharpening — most people only do one.`,
    items: [
      { id: 'd19i1', xp: 15, text: `Follow up every outstanding thread` },
      { id: 'd19i2', xp: 25, text: `Run 1 more mock call focused on objections; use Surface → Confirm → Respond, then self-score it` },
    ]},
  { day: 20, phase: 2, title: `Audition Prep / Live Auditions`,
    objective: `Prepare like the interview is also your vetting session.`,
    items: [
      { id: 'd20i1', xp: 20, text: `For any scheduled interview, deep-research the company: offer, price, founder, recent content` },
      { id: 'd20i2', xp: 15, text: `Prepare 5 questions from the Vetting Checklist` },
      { id: 'd20i3', xp: 10, text: `If nothing's scheduled yet: send 10 more scouted, personalized messages instead` },
    ]},
  { day: 21, phase: 2, title: `Maintenance + Safety Net`,
    objective: `Tend the system, and treat the marketplace check as backup, not strategy.`,
    items: [
      { id: 'd21i1', xp: 15, text: `Clean and re-tier your tracker` },
      { id: 'd21i2', xp: 10, text: `Spend 15 minutes on Indeed, Upwork, ZipRecruiter, or Glassdoor as a supplementary check — log anything relevant, then close the tab` },
    ]},
  { day: 22, phase: 2, title: `Weekly Review`,
    objective: `Know your numbers.`,
    items: [
      { id: 'd22i1', xp: 15, text: `Update your response rate %, companies contacted, and warm prospects engaged` },
      { id: 'd22i2', xp: 10, text: `Set one specific target to beat next week` },
    ]},
  { day: 23, phase: 2, title: `Fresh Scouting Sprint`,
    objective: `Scale the engine — this week's target is higher than last week's.`,
    items: [
      { id: 'd23i1', xp: 30, text: `Run the Scout Method for 10–12 new targets` },
      { id: 'd23i2', xp: 10, text: `Tier and log each one` },
    ]},
  { day: 24, phase: 2, title: `Outreach Wave`,
    objective: `Keep the volume climbing, without losing personalization.`,
    items: [
      { id: 'd24i1', xp: 35, text: `Send 15–20 personalized messages` },
      { id: 'd24i2', xp: 20, text: `Follow up every thread with no reply` },
    ]},
  { day: 25, phase: 2, title: `Warm Prospect Engagement`,
    objective: `Deepen the list you'll eventually hand off.`,
    items: [
      { id: 'd25i1', xp: 20, text: `Engage 5 more real prospects with genuine value` },
      { id: 'd25i2', xp: 10, text: `Log every new signal` },
    ]},
  { day: 26, phase: 2, title: `Follow-Up + Mock Call Intensive`,
    objective: `Sharpen the part of the call that loses deals: objections.`,
    items: [
      { id: 'd26i1', xp: 15, text: `Follow up every outstanding thread` },
      { id: 'd26i2', xp: 30, text: `Run 2 mock calls focused specifically on objection handling; score each` },
      { id: 'd26i3', xp: 60, badge: true, emoji: '🎤', text: `Auditioned — completed your first live interview or trial close` },
    ]},
  { day: 27, phase: 2, title: `Audition Prep / Live Auditions`,
    objective: `Show up prepared, or fix what isn't converting.`,
    items: [
      { id: 'd27i1', xp: 20, text: `Research any scheduled company deeply` },
      { id: 'd27i2', xp: 15, text: `Rehearse your intro and CLOSER opening out loud 3 times` },
      { id: 'd27i3', xp: 15, text: `If nothing's scheduled yet: audit your response rate and revise your bespoke Loom approach` },
    ]},
  { day: 28, phase: 2, title: `Maintenance + Safety Net`,
    objective: `Same discipline, second time around.`,
    items: [
      { id: 'd28i1', xp: 15, text: `Clean and re-tier your tracker` },
      { id: 'd28i2', xp: 10, text: `15-minute marketplace check, supplementary only` },
    ]},
  { day: 29, phase: 2, title: `Weekly Review`,
    objective: `Find your one real bottleneck.`,
    items: [
      { id: 'd29i1', xp: 15, text: `Update every stat in your tracker` },
      { id: 'd29i2', xp: 10, text: `Name your single biggest bottleneck and one fix for it` },
    ]},
  { day: 30, phase: 2, title: `Phase 2 Review`,
    objective: `Confirm you're ready to convert, not just prospect.`,
    items: [
      { id: 'd30i1', xp: 15, text: `Full pipeline audit: how many companies at each stage` },
      { id: 'd30i2', xp: 15, text: `Pick your top 2–3 live conversations to focus on closing in Phase 3` },
    ]},

  { day: 31, phase: 3, title: `Never Stop the Pipeline`,
    objective: `The pipeline is your leverage — even mid-negotiation.`,
    items: [
      { id: 'd31i1', xp: 25, text: `Send 10 new scouted, personalized messages regardless of any pending offer` },
      { id: 'd31i2', xp: 10, text: `Follow up all outstanding threads` },
    ]},
  { day: 32, phase: 3, title: `Know How to Negotiate`,
    objective: `Walk into any offer already knowing what fair looks like.`,
    items: [
      { id: 'd32i1', xp: 15, text: `Study typical commission structures: pure commission vs. draw, standard %` },
      { id: 'd32i2', xp: 20, text: `Draft the 3 questions you'll ask before accepting any offer` },
    ]},
  { day: 33, phase: 3, title: `Vet Any Offers Received`,
    objective: `Protect your time before you commit it.`,
    items: [
      { id: 'd33i1', xp: 25, text: `Run every live offer through the full Vetting Checklist` },
    ]},
  { day: 34, phase: 3, title: `Second-Round Auditions`,
    objective: `Close the loop on live conversations.`,
    items: [
      { id: 'd34i1', xp: 25, text: `Take any second-round interviews or trial closes; if none, send 10 more messages instead` },
    ]},
  { day: 35, phase: 3, title: `Weekly Review`,
    objective: `Know exactly where you stand.`,
    items: [
      { id: 'd35i1', xp: 15, text: `Full pipeline and tracker audit` },
      { id: 'd35i2', xp: 10, text: `Confirm your top choice if more than one offer is live` },
    ]},
  { day: 36, phase: 3, title: `Lock the Role`,
    objective: `Get it in writing.`,
    items: [
      { id: 'd36i1', xp: 20, text: `Finalize terms in writing: commission %, payment schedule, lead flow commitment` },
      { id: 'd36i2', xp: 100, badge: true, emoji: '🤝', text: `Signed — you secured a role` },
    ]},
  { day: 37, phase: 3, title: `Onboarding: Learn Their Offer`,
    objective: `Learn their offer like it's your own business.`,
    items: [
      { id: 'd37i1', xp: 20, text: `Learn the company's offer inside out: pricing, guarantee, refund policy, ideal client` },
      { id: 'd37i2', xp: 15, text: `Compare it honestly against your own Vetting Checklist notes` },
    ]},
  { day: 38, phase: 3, title: `Onboarding: Tools & Shadowing`,
    objective: `Get the infrastructure under you before your first real call.`,
    items: [
      { id: 'd38i1', xp: 20, text: `Shadow or review 2 real call recordings if available` },
      { id: 'd38i2', xp: 10, text: `Get set up in their tools: calendar, CRM, call platform` },
    ]},
  { day: 39, phase: 3, title: `The Warm Handoff`,
    objective: `Show up already producing value.`,
    items: [
      { id: 'd39i1', xp: 30, text: `Introduce your best Warm Prospects to your new team as immediate pipeline — real people, real interest, ethically sourced (script in Scripts tab)` },
      { id: 'd39i2', xp: 10, text: `Note their reaction — it's a strong early signal of how this seat will treat your work` },
    ]},
  { day: 40, phase: 3, title: `First Live Rep`,
    objective: `Take your first real swing.`,
    items: [
      { id: 'd40i4', xp: 15, text: `Send your pre-call WhatsApp message the night before (Mastery tab) — this is where your first real client interaction actually starts` },
      { id: 'd40i1', xp: 30, text: `Take your first real prospect interaction, shadowed or supported` },
      { id: 'd40i2', xp: 15, text: `Debrief immediately: what worked, what to adjust` },
      { id: 'd40i3', xp: 75, badge: true, emoji: '📞', text: `Live Fire — your first real client interaction` },
    ]},
  { day: 41, phase: 3, title: `Debrief & Refine`,
    objective: `Turn one real call into a sharper framework.`,
    items: [
      { id: 'd41i1', xp: 20, text: `Review your Day 40 call against CLOSER and the rubric, line by line` },
      { id: 'd41i2', xp: 10, text: `Rewrite your weakest objection response based on what actually happened` },
    ]},
  { day: 42, phase: 3, title: `First Solo Call`,
    objective: `Run it yourself.`,
    items: [
      { id: 'd42i1', xp: 30, text: `Run a real call solo, or with a supervisor listening` },
      { id: 'd42i2', xp: 15, text: `Full debrief against your framework and rubric` },
    ]},
  { day: 43, phase: 3, title: `Second Solo Call`,
    objective: `Prove Day 42 wasn't luck.`,
    items: [
      { id: 'd43i1', xp: 30, text: `Run another real call solo` },
      { id: 'd43i2', xp: 15, text: `Compare this debrief to Day 42's — what's already improving?` },
    ]},
  { day: 44, phase: 3, title: `Full System Debrief`,
    objective: `Find and fix your one recurring leak.`,
    items: [
      { id: 'd44i1', xp: 20, text: `Review every call you've taken so far against the rubric; find the one pattern that repeats` },
      { id: 'd44i2', xp: 15, text: `Fix it in writing — an updated objection response or framework note` },
    ]},
  { day: 45, phase: 3, title: `Certification Day`,
    objective: `Close the loop on this system and open the next one.`,
    items: [
      { id: 'd45i1', xp: 15, text: `Full system review: what worked, what needs sharpening` },
      { id: 'd45i2', xp: 20, text: `Set your 30/60/90-day targets (Day 46+ tab)` },
      { id: 'd45i3', xp: 15, text: `Lock in your ongoing scouting and outreach cadence so the pipeline never goes cold` },
      { id: 'd45i4', xp: 100, badge: true, emoji: '🏆', text: `Certified — you completed the full 45-day system` },
    ]},
];

const PHASE_META = {
  1: { name: "Phase 01 — Foundation & First Contact", range: "Days 1–15",
       scorecard: "Warm List of 25+ tiered companies · proof video + resume + hub live · first warm prospects engaged · bespoke Looms to Tier 1 · broader wave to Tier 2/3." },
  2: { name: "Phase 02 — Sustained Scouting & Pipeline", range: "Days 16–30",
       scorecard: "40+ additional companies scouted · two outreach waves · 10+ warm prospects engaged · first audition or trial close · both weekly reviews logged." },
  3: { name: "Phase 03 — Conversion & Launch", range: "Days 31–45",
       scorecard: "One vetted role signed · Warm Prospects handed off day one · onboarding complete · multiple live calls solo · 30/60/90 targets set." },
};

function AscentPage() {
  const check = useServerFn(checkMyAscentAccess);
  const [gate, setGate] = useState<"loading" | "granted" | "denied">("loading");

  useEffect(() => {
    check({ data: undefined as never })
      .then((r) => setGate(r?.hasAccess ? "granted" : "denied"))
      .catch(() => setGate("denied"));
  }, [check]);

  if (gate === "loading") return <div className="text-sm text-muted-foreground">Checking access…</div>;
  if (gate === "denied") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gold/40 bg-card p-10 text-center">
        <Lock className="mx-auto h-10 w-10 text-gold-deep" />
        <h1 className="mt-4 font-display text-2xl font-bold">The Ascent is invitation-only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Access is appointed by the founder. If you believe you should have access, message your council admin.
        </p>
      </div>
    );
  }
  return <AscentContent />;
}

function AscentContent() {
  const [tasks, setTasks, meta] = useSyncedTaskMap("p_ascent");
  const totalTasks = useMemo(() => DAYS.reduce((n, d) => n + d.items.length, 0), []);
  const toggle = (id: string) => setTasks((p: any) => ({ ...p, [id]: !p[id] }));

  const byPhase = useMemo(() => {
    const map: Record<number, typeof DAYS> = { 1: [], 2: [], 3: [] };
    DAYS.forEach((d) => map[d.phase].push(d));
    return map;
  }, []);

  return (
    <div className="pb-12">
      <SaveBar meta={meta} title="The Ascent" total={totalTasks} />
      <div className="max-w-[880px] mx-auto px-4 pt-8 space-y-6">
        <header>
          <div className="text-[10px] uppercase tracking-widest text-gold-deep flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5" /> The Ascent
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">High-Ticket Sales Closing — Entry System</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            45 days to a real closer role. Foundation, sustained scouting, and conversion. Access to this system is granted by the founder alone.
          </p>
          <div className="mt-3 rounded border border-crimson/40 bg-crimson/5 p-3 flex items-start gap-2 text-xs text-crimson">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>Confidential. Do not share the contents of this program outside the Citadel.</span>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <span className="rounded-full border border-gold/40 bg-accent/20 px-3 py-1 font-semibold text-gold-deep">
              {meta.completedCount} / {totalTasks} steps complete
            </span>
          </div>
        </header>

        {[1, 2, 3].map((phase) => (
          <section key={phase} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-br from-gold/10 to-transparent">
              <div className="text-[10px] uppercase tracking-widest text-gold-deep">{PHASE_META[phase].range}</div>
              <h2 className="mt-1 font-display text-xl md:text-2xl font-bold">{PHASE_META[phase].name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{PHASE_META[phase].scorecard}</p>
            </div>
            <div className="p-5 space-y-4">
              {byPhase[phase].map((d) => {
                const done = d.items.filter((i) => tasks[i.id]).length;
                const pct = Math.round((done / d.items.length) * 100);
                return (
                  <div key={d.day} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Day {d.day}</div>
                        <div className="mt-0.5 font-display text-base font-bold">{d.title}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-semibold">{done} / {d.items.length}</div>
                        <div className="text-muted-foreground">{pct}%</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 rounded bg-muted overflow-hidden">
                      <div className={`h-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-3 text-xs italic text-muted-foreground border-l-2 border-gold/40 pl-3">{d.objective}</p>
                    <ul className="mt-3 space-y-2">
                      {d.items.map((i) => (
                        <li key={i.id}>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!tasks[i.id]}
                              onChange={() => toggle(i.id)}
                              className="mt-0.5 h-4 w-4 rounded border-gold/40 accent-primary"
                            />
                            <span className={`text-sm leading-relaxed ${tasks[i.id] ? "line-through text-muted-foreground" : ""}`}>
                              {i.badge && <span className="mr-1">{i.emoji}</span>}
                              {i.text}
                              <span className="ml-2 text-[10px] text-gold-deep">+{i.xp} XP</span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
