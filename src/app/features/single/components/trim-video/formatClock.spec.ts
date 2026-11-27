import { formatClock } from './formatClock';

describe('formatClock', () => {
  it('formats 0 as 00:00:00', () => {
    expect(formatClock(0)).toBe('00:00:00');
  });

  it('formats 65 as 00:01:05', () => {
    expect(formatClock(65)).toBe('00:01:05');
  });

  it('formats 3725 as 01:02:05', () => {
    expect(formatClock(3725)).toBe('01:02:05');
  });

  it('clamps negative and NaN to 00:00:00', () => {
    expect(formatClock(-10)).toBe('00:00:00');
    expect(formatClock(NaN)).toBe('00:00:00');
  });

  it('handles null/undefined as 00:00:00', () => {
    expect(formatClock(null)).toBe('00:00:00');
    expect(formatClock(undefined)).toBe('00:00:00');
  });
});
