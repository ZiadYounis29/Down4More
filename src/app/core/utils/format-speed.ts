/**
 * Formats a bytes-per-second speed to a human-readable string.
 *
 *  null                 →  '—'
 *  < 1 KB/s             →  'N B/s'       (rounded, no decimal)
 *  < 1 MB/s             →  'N.N KB/s'    (1 decimal)
 *  < 1 GB/s             →  'N.N MB/s'    (1 decimal)
 *  ≥ 1 GB/s             →  'N.NN GB/s'   (2 decimals)
 *
 * (Format Utils spec §1)
 */
export function formatSpeed(bytesPerSec: number | null): string {
  if (bytesPerSec == null) return '—';
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
  if (bytesPerSec < 1024 ** 2) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  if (bytesPerSec < 1024 ** 3) return `${(bytesPerSec / 1024 ** 2).toFixed(1)} MB/s`;
  return `${(bytesPerSec / 1024 ** 3).toFixed(2)} GB/s`;
}
