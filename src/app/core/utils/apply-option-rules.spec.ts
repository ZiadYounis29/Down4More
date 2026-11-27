import { DownloadOptionsCatalog, DownloadSettings } from '@core/models';
import { applyOptionRules } from './apply-option-rules';

const CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
  bitrates: [96, 128, 160, 192, 256, 320],
};

const BASE: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
};

describe('applyOptionRules', () => {
  it('video+audio: keeps quality, bitrate, and videoFormat', () => {
    const r = applyOptionRules(BASE, CATALOG);
    expect(r.mode).toBe('video+audio');
    expect(r.quality).toBe('1080p');
    expect(r.bitrate).toBe(192);
    expect(r.format).toBe('mp4');
  });

  it('audio-only: sets quality to null', () => {
    const r = applyOptionRules({ ...BASE, mode: 'audio-only', format: 'mp3' }, CATALOG);
    expect(r.quality).toBeNull();
  });

  it('audio-only: forces format to audioFormats (or resets if invalid)', () => {
    // mp4 is not an audio format → reset to mp3
    const r = applyOptionRules({ ...BASE, mode: 'audio-only' }, CATALOG);
    expect(CATALOG.audioFormats).toContain(r.format);
    expect(r.format).toBe('mp3');
  });

  it('audio-only: keeps bitrate enabled', () => {
    const r = applyOptionRules({ ...BASE, mode: 'audio-only', format: 'mp3' }, CATALOG);
    expect(r.bitrate).not.toBeNull();
  });

  it('video-only: sets bitrate to null', () => {
    const r = applyOptionRules({ ...BASE, mode: 'video-only' }, CATALOG);
    expect(r.bitrate).toBeNull();
  });

  it('video-only: keeps quality enabled', () => {
    const r = applyOptionRules({ ...BASE, mode: 'video-only' }, CATALOG);
    expect(r.quality).toBe('1080p');
  });

  it('restores quality default when switching back from audio-only', () => {
    const audioOnly: DownloadSettings = {
      ...BASE,
      mode: 'audio-only',
      quality: null,
      format: 'mp3',
    };
    // Switch back to video+audio
    const r = applyOptionRules({ ...audioOnly, mode: 'video+audio' }, CATALOG);
    expect(r.quality).toBe('1080p');
  });

  it('restores bitrate default when switching back from video-only', () => {
    const videoOnly: DownloadSettings = { ...BASE, mode: 'video-only', bitrate: null };
    const r = applyOptionRules({ ...videoOnly, mode: 'video+audio' }, CATALOG);
    expect(r.bitrate).toBe(192);
  });

  it('snaps stale bitrate to nearest available', () => {
    const r = applyOptionRules({ ...BASE, bitrate: 300 }, CATALOG);
    // nearest to 300 in catalog is 320
    expect(r.bitrate).toBe(320);
  });

  it('snaps stale quality to nearest lower', () => {
    // 900p → nearest lower in catalog is 720p
    const r = applyOptionRules({ ...BASE, quality: '900p' }, CATALOG);
    expect(r.quality).toBe('720p');
  });

  it('resets format when not in videoFormats for video+audio', () => {
    const r = applyOptionRules({ ...BASE, format: 'mp3' }, CATALOG);
    expect(r.format).toBe('mp4');
  });

  it('captions disabled → separateFile forced false', () => {
    const r = applyOptionRules(
      { ...BASE, captions: { enabled: false, separateFile: true } },
      CATALOG,
    );
    expect(r.captions.separateFile).toBe(false);
  });

  it('captions enabled + audio-only → separateFile forced true', () => {
    const r = applyOptionRules(
      { ...BASE, mode: 'audio-only', format: 'mp3', captions: { enabled: true, separateFile: false } },
      CATALOG,
    );
    expect(r.captions.separateFile).toBe(true);
  });

  it('does not mutate the input settings', () => {
    const input: DownloadSettings = { ...BASE };
    const captionsCopy = { ...BASE.captions };
    input.captions = captionsCopy;
    applyOptionRules({ ...input, mode: 'audio-only', format: 'mp3' }, CATALOG);
    expect(input.mode).toBe('video+audio');
    expect(input.quality).toBe('1080p');
  });
});
