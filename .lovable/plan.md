## What ships this turn

### 1. Escalation grace period — starts Mon 6 July 2026
- `src/lib/escalation.ts` gets a hard constant `ESCALATION_START = "2026-07-06"`.
- All cadence windows (14d/7d) are clamped to `max(windowStart, ESCALATION_START)`. Nobody is judged for anything before today; the app scales up naturally as the window fills.
- Fine/suspension notices only fire once the window is fully within the grace period.

### 2. Mobile bottom-nav (Fiverr style)
- `src/routes/_authenticated/route.tsx`: current top-nav stays on `md+`; on mobile/tablet it's replaced by a fixed floating bottom bar with icons + short labels for **Dashboard · Playbooks · Calendar · Report · Council** (Council only for admins).
- Active tab highlighted in gold. Bottom padding added to `<main>` so content isn't hidden.

### 3. `/weekly-report` route (kept separate from `/report`)
- New file `src/routes/_authenticated/weekly-report.tsx`. Simple weekly-cadence filing form: what I did, what blocked me, what's next. Writes to a new lightweight `weekly_check_ins` payload inside the existing `weekly_reports` table (no schema change — uses the `payload jsonb` field).
- Dashboard's "File this week's report →" now points here.
- `/report` embeds the same form component under a "Weekly cadence" section so both routes work.

### 4. Calendar upgrades
- Existing 45-day campaign grid stays as-is.
- New "Gregorian" panel above it: a real monthly calendar (July 2026 default). Each day shows a small badge (green=sealed, gold=today, red=missed, muted=future). Prev/next month navigation. Supports the year+ horizon.
- Dashboard gets a compact **Yesterday · Today · Tomorrow** strip showing that day's focus + tasks and % done, plus a small **Escalation metric card** (score + band + top drag factor) sourced from `escalation.ts`.

### 5. 45-Day Playbook v2 (in-place replacement)
- Replace `src/routes/_authenticated/playbooks/plan.tsx` with the new content (from `ImplementationPlaybook45-2.jsx`), keeping the app's "Regal" palette (parchment/gold/onyx) — dropping the source file's dark inline styles.
- Wired through the existing `useSyncedTaskMap` hook. Task-id best-effort match: `1a`/`1b`/… IDs that survive keep their tick. Orphaned rows sit harmlessly in `task_progress`.
- Existing `SaveBar` retained at the top.

### 6. SMB Performance Calculator — new playbook
- `src/routes/_authenticated/playbooks/smb-calculator.tsx`, added to the `/playbooks` index card.
- 5 tabs (Business · Reviews · Speed · Calls · Report) re-themed to the Regal palette; every tab shows a small **"Powered by Claude AI"** chip near the header.
- Each tab has a **Download PDF** button using `jsPDF + html2canvas` — captures the current tab's panel and produces a branded PDF: DFS crest, SMB name field, tab title, timestamp.

### 7. THE ASCENT — new top-level protected tab
- `src/routes/_authenticated/ascent.tsx`: content from `the-ascent-2.jsx`, re-themed. Uses `useSyncedTaskMap` under a new `playbook_id = "ascent"` so completions still feed XP.
- Gated: on load, checks `ascent_access` for the current user. If not granted (and not super admin), shows a locked screen ("The Ascent is invitation-only. Contact the founder.").
- Nav tab appears only when access is granted (or user is super admin).
- Council console (`admin.tsx`) gets a new "Ascent access" column per beneficiary — **only the super admin sees the toggle**; toggling calls new server fns `grantAscent` / `revokeAscent` (super-admin gated) in `src/lib/ascent.functions.ts`.

## Technical notes

- **DB** (already migrated this turn): `app_settings` (escalation_start_date seeded to 2026-07-06) and `ascent_access` (super-admin managed).
- **PDF** libs installed: `jspdf`, `html2canvas` (client-side only).
- **No task_progress migration needed** — new IDs that collide with old ones inherit ticks automatically; new tasks start blank; orphaned rows are ignored.
- **`weekly_reports` table**: reused as-is; the new form writes rows with `period = "weekly_checkin"` in `payload`.
- **XP engine untouched** — the Ascent's XP values in the source file are respected by the sync hook (each tick = 10 XP baseline via `task_progress`; badge tasks stay visible but don't multiply XP — the existing engine is one-per-task, and doubling XP for badges would require a schema change I'll flag if you want it).

## Files touched
```text
src/lib/escalation.ts                                     (grace period)
src/lib/ascent.functions.ts                               (new — grant/revoke/list access)
src/routes/_authenticated/route.tsx                       (mobile bottom nav + Ascent nav)
src/routes/_authenticated/dashboard.tsx                   (link fix, calendar strip, escalation card)
src/routes/_authenticated/calendar.tsx                    (gregorian month panel)
src/routes/_authenticated/weekly-report.tsx               (new)
src/routes/_authenticated/report.tsx                      (embed weekly-report form)
src/routes/_authenticated/playbooks/index.tsx             (add SMB Calculator card)
src/routes/_authenticated/playbooks/plan.tsx              (v2 content, retitled palette)
src/routes/_authenticated/playbooks/smb-calculator.tsx    (new)
src/routes/_authenticated/ascent.tsx                      (new, gated)
src/routes/_authenticated/admin.tsx                       (Ascent toggle column)
```

## What is NOT in this turn (call out to keep expectations honest)

- **Google Calendar sync** — still parked; you never sent OAuth credentials.
- **Badge XP multiplier** for the Ascent's `badge:true` tasks — flagged above; needs a small schema tweak. Say the word and I'll add it.
- **Editing the citadel-report cron for the grace period** — the cron already checks recent activity only; with the cutoff in `escalation.ts` the auto-flagging respects it. No edit needed.

Approve and I execute end-to-end.