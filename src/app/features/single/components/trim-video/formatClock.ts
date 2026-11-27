/**
 * Formats seconds as 'HH:MM:SS' for the Trim Video component.
 * Clamps negative/NaN to 0.
 */
export function formatClock(sec: number | null | undefined): string {
  if (sec == null || Number.isNaN(sec)) return '00:00:00';
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
