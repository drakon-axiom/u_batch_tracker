/**
 * Compute the Julian day number (1-indexed, Jan 1 = 1) for a given date.
 * Uses direct month/day arithmetic to avoid DST time-diff errors.
 */
export function toJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let julian = day;
  for (let m = 0; m < month; m++) {
    julian += daysInMonth[m];
  }
  return julian;
}

export function formatJulian(day: number): string {
  return day.toString().padStart(3, "0");
}
