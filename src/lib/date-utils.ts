/**
 * Format a production date string (ISO or YYYY-MM-DD) for display without
 * timezone shifting. Parses as local noon so any UTC offset stays on the
 * correct calendar day.
 */
export function formatProdDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
): string {
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
  return d.toLocaleDateString(undefined, options);
}

export function formatProdDateShort(dateStr: string): string {
  return formatProdDate(dateStr, { year: "numeric", month: "numeric", day: "numeric" });
}

/** Today's date as YYYY-MM-DD in local time (not UTC). */
export function todayLocal(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
