import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO-8601 duration ("PT1H2M3S") as "1:02:03".
 *
 * Sub-minute videos previously came back as a bare number ("45" instead of
 * "0:45"), and the minute/second groups were parsed with `.replace()` on an
 * already-captured group, which mis-parsed "PT1H30S" as 1:30 rather than 1:00:30.
 */
export function formatDuration(duration: string): string {
  if (!duration) return "0:00";

  // Already display-formatted (e.g. "17:04") — pass through unchanged.
  if (/^\d{1,2}(:\d{2}){1,2}$/.test(duration)) return duration;

  const match = duration.match(/^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return "0:00";

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** Formats a raw view count ("1234567") as "1.2M". */
export function formatViewCount(count: string | number): string {
  const value = typeof count === "number" ? count : Number(count);
  if (!Number.isFinite(value)) return typeof count === "string" ? count : "0";

  // `toFixed(1)` unconditionally rendered round numbers as "172.0K"/"5.0M".
  const compact = (n: number, suffix: string) =>
    `${Number(n.toFixed(1))}${suffix}`;

  if (value >= 1e9) return compact(value / 1e9, "B");
  if (value >= 1e6) return compact(value / 1e6, "M");
  if (value >= 1e3) return compact(value / 1e3, "K");
  return value.toLocaleString("en-US");
}

/** Formats a date as "3 days ago". Returns the input unchanged if unparseable. */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return "";

  const past = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(past.getTime())) {
    return typeof date === "string" ? date : "";
  }

  const diffInSeconds = Math.floor((Date.now() - past.getTime()) / 1000);
  if (diffInSeconds < 0) return "just now";

  const intervals: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of intervals) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
