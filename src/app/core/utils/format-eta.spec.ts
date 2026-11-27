import { formatEta } from './format-eta';

describe('formatEta', () => {
  it('returns "—" for null', () => {
    expect(formatEta(null)).toBe('—');
  });

  it('returns "—" for NaN', () => {
    expect(formatEta(NaN)).toBe('—');
  });

  it('negative clamped to "0 sec"', () => {
    expect(formatEta(-10)).toBe('0 sec');
  });

  it('0 → "0 sec"', () => {
    expect(formatEta(0)).toBe('0 sec');
  });

  it('6 → "6 sec"', () => {
    expect(formatEta(6)).toBe('6 sec');
  });

  it('59 → "59 sec"', () => {
    expect(formatEta(59)).toBe('59 sec');
  });

  it('60 → "1 min"', () => {
    expect(formatEta(60)).toBe('1 min');
  });

  it('720 → "12 min"', () => {
    expect(formatEta(720)).toBe('12 min');
  });

  it('1680 → "28 min"', () => {
    expect(formatEta(1680)).toBe('28 min');
  });

  it('3600 → "1 hr" (singular)', () => {
    expect(formatEta(3600)).toBe('1 hr');
  });

  it('10800 → "3 hrs"', () => {
    expect(formatEta(10800)).toBe('3 hrs');
  });

  it('144000 → "40 hrs"', () => {
    expect(formatEta(144000)).toBe('40 hrs');
  });
});
