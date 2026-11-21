/**
 * Shared formatting helpers. Pure functions — safe on server and client.
 */

const EVENT_TIME_ZONE = "Africa/Lagos";

export function formatEventDate(date: Date | null): string | null {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}
