const MB = 1024 * 1024;
const GB = 1024 * MB;

/**
 * Formats a byte count as a human-readable string.
 *
 * unit 'auto' (default):
 *   < 1 GB  → whole MB, e.g. '40 MB', '615 MB'
 *   ≥ 1 GB  → one decimal in GB, e.g. '1.1 GB', '2.0 GB'
 *
 * unit 'mb':
 *   Always whole MB with thousands separator, e.g. '1,120 MB', '40 MB'
 *
 * null → '—'
 */
export function formatSize(bytes: number | null, unit: 'auto' | 'mb' = 'auto'): string {
  if (bytes == null) return '—';

  if (unit === 'mb') {
    const mb = Math.round(bytes / MB);
    return `${addThousandsSeparator(mb)} MB`;
  }

  // 'auto'
  if (bytes < GB) {
    return `${Math.round(bytes / MB)} MB`;
  }
  return `${(bytes / GB).toFixed(1)} GB`;
}

/** Inserts commas every three digits from the right. */
function addThousandsSeparator(n: number): string {
  const s = String(n);
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) {
      result += ',';
    }
    result += s[i];
  }
  return result;
}
