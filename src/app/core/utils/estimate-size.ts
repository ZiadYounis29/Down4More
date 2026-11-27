import { DownloadSettings } from '@core/models';

/** Assumed fraction of a video+audio file's size that is audio at the default bitrate. */
const AUDIO_SHARE = 0.08;

/** Quality factors relative to 1080p = 1.0 (Decisions spec §2.1). */
const QUALITY_FACTOR: Record<string, number> = {
  '2160p': 4.0,
  '1440p': 2.0,
  '1080p': 1.0,
  '720p': 0.55,
  '480p': 0.3,
  '360p': 0.15,
};

/**
 * Re-estimates file size by scaling `baselineBytes` (the size at `baselineSettings`)
 * to reflect `settings`. Returns null when `baselineBytes` is null.
 * (Decisions spec §2.1)
 */
export function estimateSizeBytes(
  baselineBytes: number | null,
  settings: DownloadSettings,
  baselineSettings: DownloadSettings,
): number | null {
  if (baselineBytes == null) return null;

  const quality = QUALITY_FACTOR[settings.quality ?? ''] ?? 1.0;
  const defaultBitrate = baselineSettings.bitrate ?? 192;
  const audioFactor = (settings.bitrate ?? defaultBitrate) / defaultBitrate;

  const scale =
    settings.mode === 'audio-only'
      ? AUDIO_SHARE * audioFactor
      : settings.mode === 'video-only'
        ? (1 - AUDIO_SHARE) * quality
        : /* video+audio */ (1 - AUDIO_SHARE) * quality + AUDIO_SHARE * audioFactor;

  return Math.round(baselineBytes * scale);
}
