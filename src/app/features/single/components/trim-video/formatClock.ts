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

/** Parses 'SS', 'MM:SS', or 'HH:MM:SS' into total seconds, or null if invalid. */
export function parseClock(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+(:\d+){0,2}$/.test(trimmed)) return null;
  const parts = trimmed.split(':').map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
