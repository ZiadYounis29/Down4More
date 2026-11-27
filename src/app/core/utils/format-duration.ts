/**
 * Formats a duration in seconds to a human-readable string.
 *
 *  null / NaN / negative  →  clamped to 0
 *  <  1 hour              →  'mm:ss'  (e.g. '12:48', '08:15')
 *  >= 1 hour              →  'h:mm:ss' (e.g. '1:02:05', '2:00:00')
 *  null                   →  '—'
 */
export function formatDuration(sec: number | null): string {
  if (sec == null) return '—';

  const s = Math.max(0, Math.floor(Number.isNaN(sec) ? 0 : sec));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
