import type { LucideIcon } from "lucide-react";
import {
  Flame, Compass, Target, Users, Wallet, CalendarClock, Crown,
} from "lucide-react";

export type WalkthroughStep = {
  key: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  highlights: string[];
};

/**
 * Single source of truth for both the mobile and desktop walkthroughs —
 * the two components present this completely differently, but neither
 * duplicates the copy. Seven steps: a welcome, five surfaces of the app
 * grouped the way a beneficiary actually experiences them, and a close.
 */
export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    key: "welcome",
    icon: Flame,
    eyebrow: "Welcome",
    title: "Accende Potentiam — welcome to the Citadel",
    body: "You've just stepped into DBI Citadel, the actual operating system behind D'Famocious Business Incubator — not a course library, a command center. Every screen here maps to something you're expected to do: a path to run, a pipeline to fill, goals to keep honestly, people who are watching your back. Give us two minutes and you'll never have to wonder where anything lives again.",
    highlights: [
      "Everything in this tour points at a real, working part of the app",
      "You can replay it anytime from your profile menu",
      "Nothing here is locked behind a paywall you haven't seen coming",
    ],
  },
  {
    key: "path",
    icon: Compass,
    eyebrow: "Stage 1 — Digital Systems Engineering",
    title: "Pick your lane, then run it until it's undeniable",
    body: "DSE gives you seven client-acquisition systems to choose between — Ascent, CareBridge, Digital Ministry Systems, Revenue Recovery Engine, SMB Optimization, The Broadcast Engine, The Authority Engine. Your Dashboard is where you feel the climb: XP, rank, and a live countdown on your path deadline. Once your income is real and repeatable, you graduate into the Start-up Catalyst — Stage 2 — and build something you actually own.",
    highlights: [
      "Playbooks — the exact day-by-day plan for your chosen system",
      "Dashboard — XP, rank, and your path deadline at a glance",
      "Your Path — where you first choose, and can revisit your niche",
    ],
  },
  {
    key: "bps",
    icon: Target,
    eyebrow: "The Blazer Productivity Scheme",
    title: "Where discipline stops being a feeling and becomes a record",
    body: "BPS is your daily and monthly accountability, all in one place. The Client CRM runs your entire outreach pipeline — leads, stages, follow-ups — so nothing lives in a lost spreadsheet again. The Daily Tracker is binary: you did the action or you didn't, locked once the day passes, no backfilling. And the Belief → Affirmation → Evaluation cycle reviews your month in fixed, honest language — no spin, no vague vibes.",
    highlights: [
      "Client CRM — cards or table view, CSV import, priority scoring built in",
      "Daily Tracker — auto-derived from your own Belief Goal, day by day",
      "Belief / Affirmation / Evaluation — the three-goal monthly cycle",
    ],
  },
  {
    key: "people",
    icon: Users,
    eyebrow: "Mentorship & Messages",
    title: "You are never doing this alone",
    body: "Every beneficiary gets a DSE Rep, and — once assigned — a mentor: real people reviewing your progress, not a silent dashboard. Messages puts your Rep, your mentor, and your whole cohort's shared room one tap away, with a video call link built in for when a conversation needs a face instead of text.",
    highlights: [
      "Mentorship — scheduled checkpoints, and an escalation path if something stalls",
      "Messages — direct chats plus your cohort's own group room",
      "Nothing you flag privately gets shared without your say-so",
    ],
  },
  {
    key: "money",
    icon: Wallet,
    eyebrow: "Payments & the Pocket System",
    title: "Money, handled the way a real institution handles it",
    body: "DSE entry, DFY remittances, and SUC entry all run through Payments — Stripe for the world, or NBO's further-subsidized Paystack rate if you're in Nigeria through that channel. Once income starts moving, the Pocket System governs how it's actually managed: a monthly floor and ceiling, savings that unlock on a real schedule, and a genuine emergency-withdrawal process instead of a suggestion box.",
    highlights: [
      "Payments — entry fees and remittances, every receipt kept automatically",
      "Pocket System — structured income management, not just 'save what's left'",
    ],
  },
  {
    key: "rhythm",
    icon: CalendarClock,
    eyebrow: "Staying on schedule",
    title: "Everything that keeps you from missing a beat",
    body: "Your Calendar fills itself with what your goals actually generate — Affirmation and Evaluation days, weekly check-ins, playbook tasks — day, week, or month view, your choice. The bell at the top of the screen logs every notification the app has ever sent you, even the ones you missed. And once you're active, The Practise of Enterprise gives you twelve real sessions on actually running a business, not just building one.",
    highlights: [
      "Calendar — auto-filled reminders, never manually maintained",
      "Notifications — a running history, not just a toast you blinked through",
      "TPE — twelve sessions, compulsory weekly viewing once you're in motion",
    ],
  },
  {
    key: "close",
    icon: Crown,
    eyebrow: "That's the whole Citadel",
    title: "Now go make it yours",
    body: "You've seen where everything lives. You can reopen this tour anytime from your profile menu — nothing here was hidden on purpose. For now: set your Belief Goal, add your first CRM lead, or just look around. Fortuna Audentes Iuvat — fortune favors the bold, and you're already inside the gate.",
    highlights: [
      "\"Skip\" leaves this tour to show again next time you open the app",
      "\"Don't show this again\" turns it off for good — reopen it anytime from your profile",
    ],
  },
];
