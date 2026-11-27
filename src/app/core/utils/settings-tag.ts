import { DownloadSettings } from '@core/models';

export function settingsTag(s: DownloadSettings): string {
  if (s.mode === 'audio-only') {
    return s.bitrate != null ? `${s.format} · ${s.bitrate}k` : s.format;
  }
  const base = `${s.quality} · ${s.format}`;
  return s.mode === 'video-only' ? `${base} · video only` : base;
}
