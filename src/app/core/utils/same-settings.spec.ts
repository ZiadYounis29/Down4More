import { DownloadSettings } from '@core/models';
import { sameSettings } from './same-settings';

const base: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
};

describe('sameSettings', () => {
  it('returns true for two equal settings objects', () => {
    const copy: DownloadSettings = {
      ...base,
      captions: { ...base.captions },
    };
    expect(sameSettings(base, copy)).toBe(true);
  });

  it('returns false when mode differs', () => {
    expect(sameSettings(base, { ...base, mode: 'video-only' })).toBe(false);
  });

  it('returns false when quality differs', () => {
    expect(sameSettings(base, { ...base, quality: '720p' })).toBe(false);
  });

  it('returns false when format differs', () => {
    expect(sameSettings(base, { ...base, format: 'mkv' })).toBe(false);
  });

  it('returns false when bitrate differs', () => {
    expect(sameSettings(base, { ...base, bitrate: 320 })).toBe(false);
  });

  it('returns false when captions.enabled differs', () => {
    expect(
      sameSettings(base, { ...base, captions: { enabled: true, separateFile: false } }),
    ).toBe(false);
  });

  it('returns false when captions.separateFile differs', () => {
    expect(
      sameSettings(base, { ...base, captions: { enabled: false, separateFile: true } }),
    ).toBe(false);
  });
});
