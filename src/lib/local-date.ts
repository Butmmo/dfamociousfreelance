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
