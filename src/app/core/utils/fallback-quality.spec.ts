import { fallbackQuality } from './fallback-quality';

describe('fallbackQuality', () => {
  const catalog = ['2160p', '1440p', '1080p', '720p', '480p', '360p'];

  it('returns null for empty list', () => {
    expect(fallbackQuality('1080p', [])).toBeNull();
  });

  it('returns exact match', () => {
    expect(fallbackQuality('720p', catalog)).toBe('720p');
  });

  it('returns nearest lower when wanted is not available', () => {
    // 900p → nearest lower is 720p
    expect(fallbackQuality('900p', catalog)).toBe('720p');
  });

  it('returns lowest above when no lower quality exists', () => {
    // 240p → no lower; lowest above is 360p
    expect(fallbackQuality('240p', catalog)).toBe('360p');
  });

  it('returns first entry when wanted has no number', () => {
    expect(fallbackQuality('best', catalog)).toBe('2160p');
  });

  it('returns first entry when list has no parseable numbers', () => {
    expect(fallbackQuality('720p', ['best', 'medium', 'low'])).toBe('best');
  });

  it('handles null wanted by returning first entry', () => {
    expect(fallbackQuality(null, catalog)).toBe('2160p');
  });
});
