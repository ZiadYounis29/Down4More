/**
 * Finds the best quality from `available` for the requested `wanted` value.
 *
 * Rules (Per-Video spec §2.2):
 *  1. Exact match → keep it.
 *  2. Otherwise parse the numeric px value from each quality string (e.g. "1080p" → 1080).
 *  3. If `wanted` has no number, return the first entry.
 *  4. Nearest lower quality (by number) → use highest of those.
 *  5. If none is lower, lowest one above.
 *  6. Empty list → null.
 */
export function fallbackQuality(
  wanted: string | null,
  available: string[],
): string | null {
  if (available.length === 0) return null;
  if (wanted == null) return available[0];
  if (available.includes(wanted)) return wanted;

  const rank = (q: string): number => parseInt(q, 10);
  const w = rank(wanted);

  if (Number.isNaN(w)) return available[0];

  // All entries that are strictly lower, sorted descending → take first (= highest lower)
  const lower = available
    .filter((q) => !Number.isNaN(rank(q)) && rank(q) < w)
    .sort((a, b) => rank(b) - rank(a));
  if (lower.length) return lower[0];

  // No lower: take the lowest one above
  return available
    .filter((q) => !Number.isNaN(rank(q)))
    .sort((a, b) => rank(a) - rank(b))[0] ?? available[0];
}
