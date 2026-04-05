import { db } from "./db";
import { toJulianDay, formatJulian } from "./julian";

/**
 * Atomically generate the next lot number for a given family code and production date.
 * Format: PPYYDDDS
 *   PP  = 2-letter family code
 *   YY  = 2-digit year
 *   DDD = 3-digit Julian day (001-366)
 *   S   = sequence letter A-Z (resets daily per family code)
 *
 * Throws if all 26 letters are exhausted for the given prefix on the given date.
 */
export async function generateLotNumber(
  familyCode: string,
  productionDate: Date
): Promise<string> {
  const yy = String(productionDate.getFullYear()).slice(-2);
  const ddd = formatJulian(toJulianDay(productionDate));

  // Atomic upsert: on first insert for this (code, date) → last_letter = 'A'
  // On subsequent calls → increment the letter
  const result = await db.$queryRaw<{ last_letter: string }[]>`
    INSERT INTO lot_sequences (family_code, production_date, last_letter)
    VALUES (${familyCode}, ${productionDate}::date, 'A')
    ON CONFLICT (family_code, production_date)
    DO UPDATE SET last_letter = CHR(ASCII(lot_sequences.last_letter) + 1)
    RETURNING last_letter
  `;

  const letter = result[0]?.last_letter;

  if (!letter || letter > "Z") {
    throw new Error(
      `Lot number sequence exhausted for family code "${familyCode}" on ${productionDate.toISOString().slice(0, 10)}. All 26 letters (A–Z) have been used.`
    );
  }

  return `${familyCode}${yy}${ddd}${letter}`;
}

/**
 * Parse a production date string (YYYY-MM-DD) to a local Date without timezone shift.
 */
export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
