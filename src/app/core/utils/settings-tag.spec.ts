import { DownloadSettings } from '@core/models';
import { settingsTag } from './settings-tag';

describe('settingsTag', () => {
  it('formats video+audio settings', () => {
    const s: DownloadSettings = {
      mode: 'video+audio',
      quality: '1080p',
      format: 'mp4',
      bitrate: 192,
      captions: { enabled: false, separateFile: false },
    };
    expect(settingsTag(s)).toBe('1080p · mp4');
  });

  it('formats video-only settings', () => {
    const s: DownloadSettings = {
      mode: 'video-only',
      quality: '720p',
      format: 'mkv',
      bitrate: null,
      captions: { enabled: false, separateFile: false },
    };
    expect(settingsTag(s)).toBe('720p · mkv · video only');
  });

  it('formats audio-only settings with bitrate', () => {
    const s: DownloadSettings = {
      mode: 'audio-only',
      quality: null,
      format: 'mp3',
      bitrate: 300,
      captions: { enabled: false, separateFile: false },
    };
    expect(settingsTag(s)).toBe('mp3 · 300k');
  });

  it('formats audio-only settings when bitrate is null', () => {
    const s: DownloadSettings = {
      mode: 'audio-only',
      quality: null,
      format: 'mp3',
      bitrate: null,
      captions: { enabled: false, separateFile: false },
    };
    expect(settingsTag(s)).toBe('mp3');
  });
});
