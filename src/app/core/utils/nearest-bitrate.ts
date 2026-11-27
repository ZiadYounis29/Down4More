/**
 * Returns the value in `available` closest to `wanted`.
 * When two values are equidistant, the lower one wins.
 * Assumes `available` is non-empty; callers guarantee this.
 */
export function nearestBitrate(wanted: number, available: number[]): number {
  return available.reduce((best, cur) => {
    const bestDiff = Math.abs(best - wanted);
    const curDiff = Math.abs(cur - wanted);
    // Prefer cur when strictly closer, or when tied and cur is lower
    return curDiff < bestDiff || (curDiff === bestDiff && cur < best) ? cur : best;
  });
}
