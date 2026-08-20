// Pure computation for the Calendar page's Week/Day hour-grid — turning a
// day's events into vertical position/height (as a fraction of the 24h
// column) and, for events that overlap in time, a side-by-side column
// assignment so two 9am meetings don't render on top of each other.

export interface TimedEvent {
  id: string;
  startMin: number; // minutes since midnight, local time
  endMin: number;   // minutes since midnight, local time — always > startMin
}

export interface LaidOutEvent<T extends TimedEvent> {
  event: T;
  col: number;   // 0-indexed column within its overlap cluster
  cols: number;  // total columns in that cluster
}

/**
 * Greedy interval-column assignment: sweep events in start order, giving
 * each the lowest-numbered column not occupied by a still-active event.
 * Events are grouped into clusters (runs of mutual overlap) so a cluster's
 * column count reflects only its own peak concurrency, not the whole day's.
 */
export function layoutDayEvents<T extends TimedEvent>(events: T[]): LaidOutEvent<T>[] {
  const sorted = [...events].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const active: { event: T; col: number }[] = [];
  const result: LaidOutEvent<T>[] = [];
  let cluster: { event: T; col: number }[] = [];
  let clusterEnd = -Infinity;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const cols = Math.max(...cluster.map((c) => c.col)) + 1;
    for (const c of cluster) result.push({ event: c.event, col: c.col, cols });
    cluster = [];
  };

  for (const event of sorted) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].event.endMin <= event.startMin) active.splice(i, 1);
    }
    if (active.length === 0 && cluster.length > 0 && event.startMin >= clusterEnd) {
      flushCluster();
    }
    const usedCols = new Set(active.map((a) => a.col));
    let col = 0;
    while (usedCols.has(col)) col++;
    active.push({ event, col });
    cluster.push({ event, col });
    clusterEnd = Math.max(clusterEnd, event.endMin);
  }
  flushCluster();
  return result;
}

export function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export const CALENDAR_COLORS = {
  gold: { bg: "bg-gold/20", border: "border-gold/60", text: "text-gold-deep", dot: "bg-gold" },
  emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/50", text: "text-emerald-700", dot: "bg-emerald-500" },
  sky: { bg: "bg-sky-500/15", border: "border-sky-500/50", text: "text-sky-700", dot: "bg-sky-500" },
  crimson: { bg: "bg-crimson/15", border: "border-crimson/50", text: "text-crimson", dot: "bg-crimson" },
  purple: { bg: "bg-purple-500/15", border: "border-purple-500/50", text: "text-purple-700", dot: "bg-purple-500" },
} as const;

export type CalendarColor = keyof typeof CALENDAR_COLORS;
export const CALENDAR_COLOR_KEYS = Object.keys(CALENDAR_COLORS) as CalendarColor[];
