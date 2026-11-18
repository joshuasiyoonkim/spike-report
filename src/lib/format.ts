/** Format an ISO date or timestamp as e.g. "June 5, 2026" without timezone drift. */
export function formatDate(iso: string): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Relative time for comment timestamps: "just now", "4m ago", "3h ago",
 * then an absolute date once it is a day old.
 *
 * Unlike formatDate this reads the clock, so only call it from client
 * components. Comment threads are fetched after hydration, so there is no
 * server render of this to disagree with.
 */
export function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return formatDate(iso);
}

/** Short form, e.g. "Jun 5". */
export function formatDateShort(iso: string): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
