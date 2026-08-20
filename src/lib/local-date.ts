/**
 * The app's single "what day is it" helper. `Date.toISOString().slice(0,10)`
 * — used all over before this — always converts to UTC first, so anyone
 * more than a few hours off UTC could see "today" flip at the wrong local
 * hour (or even land on the wrong calendar day entirely). This reads the
 * date parts straight off the Date object instead, which JavaScript
 * already gives you in the browser's local time zone by default.
 */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * `localDateStr`'s server-side counterpart for gates that must respect a
 * SPECIFIC beneficiary's own timezone rather than the runtime's — e.g.
 * "has this beneficiary's own local calendar reached the 15th yet",
 * which `new Date() < someInstant` cannot answer correctly (that compares
 * a single global instant, silently anchored to whatever timezone the
 * server process happens to run in). Works in both Node and Deno — both
 * ship full ICU, so `Intl.DateTimeFormat` accepts any IANA `timeZone`.
 */
export function localDateStrInTimeZone(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}
