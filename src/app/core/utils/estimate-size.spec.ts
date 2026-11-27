import { DownloadSettings } from '@core/models';
import { estimateSizeBytes } from './estimate-size';

const BASELINE_SETTINGS: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
};

const BASE_BYTES = 41_943_040; // 40 MB

describe('estimateSizeBytes', () => {
  it('returns null when baselineBytes is null', () => {
    expect(estimateSizeBytes(null, BASELINE_SETTINGS, BASELINE_SETTINGS)).toBeNull();
  });

  it('unchanged settings → same size', () => {
    expect(estimateSizeBytes(BASE_BYTES, BASELINE_SETTINGS, BASELINE_SETTINGS)).toBe(BASE_BYTES);
  });

  it('720p video+audio → ≈ 23.4 MB', () => {
    const settings: DownloadSettings = { ...BASELINE_SETTINGS, quality: '720p' };
    const result = estimateSizeBytes(BASE_BYTES, settings, BASELINE_SETTINGS)!;
    // Expected: 41943040 * (0.92*0.55 + 0.08*1.0) = 41943040 * 0.586 = ~24,578,422
    expect(result).toBeGreaterThan(24_000_000);
    expect(result).toBeLessThan(25_000_000);
  });

  it('2160p video-only → ≈ 147.2 MB', () => {
    const settings: DownloadSettings = { ...BASELINE_SETTINGS, mode: 'video-only', quality: '2160p', bitrate: null };
    const result = estimateSizeBytes(BASE_BYTES, settings, BASELINE_SETTINGS)!;
    // Expected: 41943040 * 0.92 * 4.0 = ~154,350,387 (≈147 in spec uses 1-AUDIO_SHARE = 0.92)
    expect(result).toBeGreaterThan(140_000_000);
    expect(result).toBeLessThan(165_000_000);
  });

  it('audio-only 320 kbps → ≈ 5.3 MB', () => {
    const settings: DownloadSettings = {
      ...BASELINE_SETTINGS,
      mode: 'audio-only',
      quality: null,
      bitrate: 320,
      format: 'mp3',
    };
    const result = estimateSizeBytes(BASE_BYTES, settings, BASELINE_SETTINGS)!;
    // Expected: 41943040 * 0.08 * (320/192) = ~5,570,406 (≈5.3 MB)
    expect(result).toBeGreaterThan(5_000_000);
    expect(result).toBeLessThan(6_000_000);
  });

  it('audio-only 192 kbps → returns AUDIO_SHARE of baseline', () => {
    const settings: DownloadSettings = {
      ...BASELINE_SETTINGS,
      mode: 'audio-only',
      quality: null,
      bitrate: 192,
      format: 'mp3',
    };
    // scale = 0.08 * (192/192) = 0.08
    const expected = Math.round(BASE_BYTES * 0.08);
    expect(estimateSizeBytes(BASE_BYTES, settings, BASELINE_SETTINGS)).toBe(expected);
  });
});
