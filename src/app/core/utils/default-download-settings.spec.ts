import { DownloadOptionsCatalog } from '@core/models';
import { defaultDownloadSettings } from './default-download-settings';

const CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
  bitrates: [96, 128, 160, 192, 256, 320],
};

describe('defaultDownloadSettings', () => {
  it('uses video+audio mode', () => {
    expect(defaultDownloadSettings(CATALOG).mode).toBe('video+audio');
  });

  it('defaults quality to 1080p when available', () => {
    expect(defaultDownloadSettings(CATALOG).quality).toBe('1080p');
  });

  it('falls back to first quality when 1080p is absent', () => {
    const cat: DownloadOptionsCatalog = { ...CATALOG, qualities: ['720p', '480p'] };
    expect(defaultDownloadSettings(cat).quality).toBe('720p');
  });

  it('defaults format to first videoFormat', () => {
    expect(defaultDownloadSettings(CATALOG).format).toBe('mp4');
  });

  it('defaults bitrate to 192 (nearest in catalog)', () => {
    expect(defaultDownloadSettings(CATALOG).bitrate).toBe(192);
  });

  it('snaps bitrate to nearest when 192 is not in catalog', () => {
    const cat: DownloadOptionsCatalog = { ...CATALOG, bitrates: [96, 160, 256] };
    // |160-192|=32, |256-192|=64 → 160
    expect(defaultDownloadSettings(cat).bitrate).toBe(160);
  });

  it('defaults captions to disabled', () => {
    expect(defaultDownloadSettings(CATALOG).captions).toEqual({ enabled: false, separateFile: false });
  });
});
