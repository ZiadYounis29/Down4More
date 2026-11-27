import { nearestBitrate } from './nearest-bitrate';

describe('nearestBitrate', () => {
  const catalog = [96, 128, 160, 192, 256, 320];

  it('returns exact match', () => {
    expect(nearestBitrate(192, catalog)).toBe(192);
  });

  it('returns the nearest value below', () => {
    expect(nearestBitrate(100, catalog)).toBe(96);
  });

  it('returns the nearest value above', () => {
    expect(nearestBitrate(300, catalog)).toBe(320);
  });

  it('on a tie picks the lower value', () => {
    // 144 is equidistant from 128 and 160
    expect(nearestBitrate(144, catalog)).toBe(128);
  });

  it('single-element list always returns that element', () => {
    expect(nearestBitrate(999, [192])).toBe(192);
  });

  it('works with two-element list', () => {
    expect(nearestBitrate(200, [160, 320])).toBe(160);
  });
});
