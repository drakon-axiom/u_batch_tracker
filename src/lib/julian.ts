/**
 * Compute the Julian day number (1-indexed, Jan 1 = 1) for a given date.
 * Input should be a plain Date where year/month/day are the production date.
 */
export function toJulianDay(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function formatJulian(day: number): string {
  return day.toString().padStart(3, "0");
}
