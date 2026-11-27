import { formatSize } from './format-size';

describe('formatSize', () => {
  it('returns "—" for null (auto)', () => {
    expect(formatSize(null)).toBe('—');
  });

  it('returns "—" for null (mb)', () => {
    expect(formatSize(null, 'mb')).toBe('—');
  });

  // auto mode
  it('41943040 → "40 MB" (auto)', () => {
    expect(formatSize(41_943_040)).toBe('40 MB');
  });

  it('644874240 → "615 MB" (auto)', () => {
    expect(formatSize(644_874_240)).toBe('615 MB');
  });

  it('1174405120 → "1.1 GB" (auto)', () => {
    expect(formatSize(1_174_405_120)).toBe('1.1 GB');
  });

  it('2147483648 → "2.0 GB" (auto)', () => {
    expect(formatSize(2_147_483_648)).toBe('2.0 GB');
  });

  // Flow spec §6 sizes
  it('41943040 → "40 MB" (auto, flow spec)', () => {
    expect(formatSize(41_943_040)).toBe('40 MB');
  });

  it('213909504 → "204 MB" (auto, flow spec)', () => {
    expect(formatSize(213_909_504)).toBe('204 MB');
  });

  // mb mode
  it('41943040 → "40 MB" (mb)', () => {
    expect(formatSize(41_943_040, 'mb')).toBe('40 MB');
  });

  it('644874240 → "615 MB" (mb)', () => {
    expect(formatSize(644_874_240, 'mb')).toBe('615 MB');
  });

  it('1174405120 → "1,120 MB" (mb)', () => {
    expect(formatSize(1_174_405_120, 'mb')).toBe('1,120 MB');
  });

  it('2147483648 → "2,048 MB" (mb)', () => {
    expect(formatSize(2_147_483_648, 'mb')).toBe('2,048 MB');
  });
});
