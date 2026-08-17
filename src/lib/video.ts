// Zero-config video conferencing via Jitsi Meet's free public server
// (meet.jit.si) — no account, no API key, no cost. Room names double as
// the access control: unguessable enough in practice for a two- or
// cohort-sized-person call, consistent with how Jitsi's free tier is
// meant to be used. Swappable later for a provider-embedded SDK (Daily.co,
// Whereby, etc.) if a more integrated in-page experience is ever wanted —
// nothing else in the app depends on this specific URL shape.

const JITSI_BASE = "https://meet.jit.si";

function slug(...parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

/** Stable 1:1 room for two specific users — same room regardless of who opens it first. */
export function directCallUrl(userIdA: string, userIdB: string): string {
  const [a, b] = [userIdA, userIdB].sort();
  return `${JITSI_BASE}/DBI-${slug(a.slice(0, 8), b.slice(0, 8))}`;
}

/** Stable room for a mentor/mentee pair, keyed off the mentorship row itself. */
export function mentorshipCallUrl(mentorshipId: string): string {
  return `${JITSI_BASE}/DBI-mentorship-${slug(mentorshipId.slice(0, 12))}`;
}

/** Stable room for an entire cohort's group calls. */
export function cohortCallUrl(cohortId: string): string {
  return `${JITSI_BASE}/DBI-cohort-${slug(cohortId.slice(0, 12))}`;
}

/** The one fixed room for the app-wide general DBI call. */
export function generalCallUrl(): string {
  return `${JITSI_BASE}/DBI-general-citadel-hall`;
}
