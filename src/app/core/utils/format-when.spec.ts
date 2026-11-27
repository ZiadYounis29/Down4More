import { formatWhen } from './format-when';

// now = 2026-11-27 15:00 local
const NOW = new Date(2026, 10, 27, 15, 0, 0); // month is 0-indexed → 10 = November

describe('formatWhen', () => {
  it('returns "—" for empty string', () => {
    expect(formatWhen('', NOW)).toBe('—');
  });

  it('returns "—" for invalid date string', () => {
    expect(formatWhen('not-a-date', NOW)).toBe('—');
  });

  it('today at 14:32 → "Today, 14:32"', () => {
    const d = new Date(2026, 10, 27, 14, 32, 0);
    expect(formatWhen(d.toISOString(), NOW)).toBe('Today, 14:32');
  });

  it('today at 00:01 → "Today, 00:01"', () => {
    const d = new Date(2026, 10, 27, 0, 1, 0);
    expect(formatWhen(d.toISOString(), NOW)).toBe('Today, 00:01');
  });

  it('yesterday at 23:59 → "Yesterday"', () => {
    const d = new Date(2026, 10, 26, 23, 59, 0);
    expect(formatWhen(d.toISOString(), NOW)).toBe('Yesterday');
  });

  it('Mon 23 Nov (same year) → "Mon 23 Nov"', () => {
    const d = new Date(2026, 10, 23, 10, 0, 0); // 2026-11-23 is a Monday
    expect(formatWhen(d.toISOString(), NOW)).toBe('Mon 23 Nov');
  });

  it('1 Jan 2026 (same year) → "Thu 1 Jan"', () => {
    const d = new Date(2026, 0, 1, 10, 0, 0); // Jan 1 2026 is a Thursday
    expect(formatWhen(d.toISOString(), NOW)).toBe('Thu 1 Jan');
  });

  it('31 Dec 2025 (previous year) → "31 Dec 2025"', () => {
    const d = new Date(2025, 11, 31, 10, 0, 0);
    expect(formatWhen(d.toISOString(), NOW)).toBe('31 Dec 2025');
  });

  it('23 Nov 2024 (older year) → "23 Nov 2024"', () => {
    const d = new Date(2024, 10, 23, 10, 0, 0);
    expect(formatWhen(d.toISOString(), NOW)).toBe('23 Nov 2024');
  });
});
