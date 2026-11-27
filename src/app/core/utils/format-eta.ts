/**
 * Formats an ETA in seconds to a human-readable string.
 *
 *  null / negative / NaN  →  '—'
 *  < 60 s                 →  'N sec'
 *  < 3600 s               →  'N min'  (1 min singular)
 *  ≥ 3600 s               →  'N hr' / 'N hrs'  (1 hr singular)
 *
 * (Format Utils spec §2 and §3.1)
 */
export function formatEta(sec: number | null): string {
  if (sec == null || Number.isNaN(sec)) return '—';

  const s = Math.max(0, sec);

  if (s < 60) {
    return `${Math.round(s)} sec`;
  }

  if (s < 3600) {
    const mins = Math.max(1, Math.round(s / 60));
    return `${mins} ${mins === 1 ? 'min' : 'min'}`;
  }

  const hrs = Math.max(1, Math.round(s / 3600));
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
}
