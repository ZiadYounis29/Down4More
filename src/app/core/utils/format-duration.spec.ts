import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('returns "—" for null', () => {
    expect(formatDuration(null)).toBe('—');
  });

  it('clamps negative to 0:00', () => {
    expect(formatDuration(-5)).toBe('00:00');
  });

  it('clamps NaN to 0:00', () => {
    expect(formatDuration(NaN)).toBe('00:00');
  });

  it('zero → 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('45 seconds → 00:45', () => {
    expect(formatDuration(45)).toBe('00:45');
  });

  it('768 seconds → 12:48', () => {
    expect(formatDuration(768)).toBe('12:48');
  });

  it('495 seconds → 08:15', () => {
    expect(formatDuration(495)).toBe('08:15');
  });

  it('207 seconds → 03:27', () => {
    expect(formatDuration(207)).toBe('03:27');
  });

  it('3600 seconds → 1:00:00', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
  });

  it('3725 seconds → 1:02:05', () => {
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  it('7200 seconds → 2:00:00', () => {
    expect(formatDuration(7200)).toBe('2:00:00');
  });
});
