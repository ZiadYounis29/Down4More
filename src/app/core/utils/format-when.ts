const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Formats an ISO date string relative to `now` (defaults to current time).
 * Uses local time zone. No Intl — fixed arrays for day/month names.
 *
 *  today      →  'Today, HH:mm'
 *  yesterday  →  'Yesterday'
 *  same year  →  'Ddd D Mmm'   (e.g. 'Mon 23 Nov')
 *  other year →  'D Mmm YYYY'  (e.g. '23 Nov 2025')
 *  invalid    →  '—'
 *
 * (History spec §3.2)
 */
export function formatWhen(iso: string, now: Date = new Date()): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  // Midnight (local) of `now` and `date`
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (todayMidnight.getTime() - dateMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return `Today, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  const day = DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();

  if (y === now.getFullYear()) {
    return `${day} ${d} ${month}`;
  }

  return `${d} ${month} ${y}`;
}
