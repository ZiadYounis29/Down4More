import { formatSpeed } from './format-speed';

describe('formatSpeed', () => {
  it('returns "—" for null', () => {
    expect(formatSpeed(null)).toBe('—');
  });

  it('0 → "0 B/s"', () => {
    expect(formatSpeed(0)).toBe('0 B/s');
  });

  it('512 → "512 B/s"', () => {
    expect(formatSpeed(512)).toBe('512 B/s');
  });

  it('1023 → "1023 B/s"', () => {
    expect(formatSpeed(1023)).toBe('1023 B/s');
  });

  it('10035814 → "9.6 MB/s"', () => {
    // 10035814 / 1024^2 = 9.57... → 9.6
    expect(formatSpeed(10_035_814)).toBe('9.6 MB/s');
  });

  it('18035814 → "17.2 MB/s"', () => {
    expect(formatSpeed(18_035_814)).toBe('17.2 MB/s');
  });

  it('22545612 → "21.5 MB/s"', () => {
    expect(formatSpeed(22_545_612)).toBe('21.5 MB/s');
  });

  it('1024 → "1.0 KB/s"', () => {
    expect(formatSpeed(1024)).toBe('1.0 KB/s');
  });

  it('1 GB/s range → two decimals', () => {
    const gbps = 1024 ** 3;
    expect(formatSpeed(gbps)).toBe('1.00 GB/s');
  });
});
