import { APP_TIME_ZONE } from "./constants";

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: APP_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

// Asia/Manila is UTC+8 with no daylight saving, so a fixed offset is safe.
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

/** ISO timestamp of 00:00 Manila time for the day containing `date`, shifted by `dayOffset` days. */
export function startOfManilaDay(date = new Date(), dayOffset = 0): string {
  const local = new Date(date.getTime() + MANILA_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  local.setUTCDate(local.getUTCDate() + dayOffset);
  return new Date(local.getTime() - MANILA_OFFSET_MS).toISOString();
}

/** Start of the Monday of the current week (Manila). */
export function startOfManilaWeek(date = new Date()): string {
  const local = new Date(date.getTime() + MANILA_OFFSET_MS);
  const dow = (local.getUTCDay() + 6) % 7; // Monday = 0
  return startOfManilaDay(date, -dow);
}

export function startOfManilaMonth(date = new Date()): string {
  const local = new Date(date.getTime() + MANILA_OFFSET_MS);
  local.setUTCDate(1);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - MANILA_OFFSET_MS).toISOString();
}

/** "12 min", "1 hr 5 min" between two ISO timestamps; "—" when either is missing or out of order. */
export function formatDuration(from: string | null, to: string | null): string {
  if (!from || !to) return "—";
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "< 1 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}

/** Date-only value (YYYY-MM-DD) shown as a readable date. */
export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** Elapsed time from an ISO timestamp to now, e.g. "5 min", "1 hr 12 min". */
export function formatElapsed(from: string | null): string {
  if (!from) return "—";
  const ms = Date.now() - new Date(from).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "< 1 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}

/** Full Manila date, e.g. "Oktubre 23, 2026 · Huwebes". */
export function formatManilaDateFull(date = new Date()): string {
  try {
    const datePart = new Intl.DateTimeFormat("fil-PH", {
      timeZone: APP_TIME_ZONE,
      dateStyle: "long",
    }).format(date);
    const dayPart = new Intl.DateTimeFormat("fil-PH", {
      timeZone: APP_TIME_ZONE,
      weekday: "long",
    }).format(date);
    return `${datePart} · ${dayPart}`;
  } catch {
    // Fallback if fil-PH locale is not supported
    const datePart = new Intl.DateTimeFormat("en-PH", {
      timeZone: APP_TIME_ZONE,
      dateStyle: "long",
    }).format(date);
    const dayPart = new Intl.DateTimeFormat("en-PH", {
      timeZone: APP_TIME_ZONE,
      weekday: "long",
    }).format(date);
    return `${datePart} · ${dayPart}`;
  }
}
