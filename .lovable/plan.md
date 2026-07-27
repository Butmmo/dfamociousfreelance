# Ascent as a standalone sub-app

Right now `/ascent` is one big single-page module with 8 sub-tabs. You asked for it to feel like its own app with its own top-level sections (Dashboard, Calendar, Report, Council), preserving every piece of the original curriculum you uploaded. Here is exactly what I'll build.

## New URL structure

```text
/ascent                → Ascent Dashboard (rank, XP, next mission)
/ascent/curriculum     → the full 8-tab curriculum, unchanged content
/ascent/calendar       → 45-day Ascent calendar (its own timeline)
/ascent/report         → Ascent-only progress / velocity / escalation
/ascent/council        → admin view of everyone with Ascent access
```

Everything the main Citadel does at the top level, Ascent now does *inside itself*, without touching the main app's dashboard, calendar, report or Council.

## Shell + navigation

- `/ascent` becomes a **layout route** with its own dark, insignia-styled sub-header:
  - Small "← Back to Citadel" link on the left (returns to `/dashboard`).
  - Ascent wordmark + current rank + XP bar in the middle.
  - Sub-tabs: Dashboard · Curriculum · Calendar · Report · Council (Council only shown to admins).
- The main Citadel top nav still shows the "Ascent" pill; clicking it lands on `/ascent` (the Ascent Dashboard) and swaps in the Ascent sub-nav.
- Mobile: the same sub-tabs appear as a secondary floating bar just above the existing Citadel bottom nav, so users always know which "app" they are in.

## What each Ascent tab does

- **Dashboard** — Ascent-scoped rank (Recruit → Certified High-Ticket Closer), XP total, % complete across the 45-day curriculum, "Continue where you left off" card, and the next 3 unchecked missions with day numbers.
- **Curriculum** — the existing 8 sub-tabs (Start Here, Pick Lane, Scout, 45 Days, Scripts, Mastery, Toolkit, Day 46+) preserved 1:1 from your uploaded file. Nothing removed, nothing reworded.
- **Calendar** — 45-day Ascent timeline as a grid, mirroring the main Citadel calendar but sourced from Ascent's `DAYS` data. Each cell shows day #, phase, title, and a completion ring.
- **Report** — Ascent-only progress report: tasks completed vs total, XP earned, phase-by-phase breakdown, active-day cadence for the last 7/14 days (using the same escalation math), and a "Days since last Ascent task" counter.
- **Council** (admin-only) — table of every beneficiary with Ascent access: name, rank, XP, % complete, last activity, and a link to grant/revoke access (revoke wired to the existing `ascent_access` table).

## Data model (no schema changes)

All Ascent tasks already write to `task_progress` with `playbook = "p_ascent"`. Dashboard, Calendar, Report and Council all read from that same table filtered on that playbook key — nothing new to migrate, no new tables. Access stays gated by the existing `ascent_access` row + `checkMyAscentAccess` server function.

## Files

- Delete `src/routes/_authenticated/ascent.tsx`.
- Create `src/routes/_authenticated/ascent/route.tsx` — the gated layout + sub-nav shell.
- Create `src/routes/_authenticated/ascent/index.tsx` — Dashboard.
- Create `src/routes/_authenticated/ascent/curriculum.tsx` — the full existing 8-tab body verbatim.
- Create `src/routes/_authenticated/ascent/calendar.tsx`.
- Create `src/routes/_authenticated/ascent/report.tsx`.
- Create `src/routes/_authenticated/ascent/council.tsx`.
- Extract shared `RANKS` + `DAYS` (and the `p_ascent` key) into `src/lib/ascent-data.ts` so all five pages read from one source of truth.

## What stays untouched

- Your 4 main-app playbooks and their progress data.
- The main Citadel dashboard, calendar, report, and Council.
- All existing DB tables, RLS, and the ascent-access gate.
- The 45-Day Implementation Playbook (we'll return to the numbering issue you flagged after this).

Say the word and I'll build it in that order (shell → dashboard → curriculum move → calendar → report → council).