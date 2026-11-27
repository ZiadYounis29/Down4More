import { DownloadOptionsCatalog, DownloadSettings } from '@core/models';
import { fallbackQuality } from './fallback-quality';
import { nearestBitrate } from './nearest-bitrate';

/**
 * Applies all download-option dependency rules (Shared spec §6.4 + Decisions §1.3 + Per-Video §2.2).
 * Pure: never mutates the input, always returns a fresh object.
 *
 * Rules:
 *  - audio-only  → quality = null; format from audioFormats; bitrate enabled; separateFile forced true.
 *  - video-only  → bitrate = null; quality enabled; format from videoFormats.
 *  - video+audio → quality enabled; bitrate enabled; format from videoFormats.
 *  - If format is not valid for the mode, reset to first valid one.
 *  - If a field is enabled but was null (previously disabled), restore a default.
 *  - If bitrate is enabled but not in catalog.bitrates, snap to nearest.
 *  - If quality is enabled but not in catalog.qualities, replace with fallbackQuality().
 *  - If captions.enabled is false → separateFile = false.
 *  - If captions.enabled is true and mode is audio-only → separateFile = true.
 */
export function applyOptionRules(
  settings: DownloadSettings,
  catalog: DownloadOptionsCatalog,
): DownloadSettings {
  const result = { ...settings, captions: { ...settings.captions } };
  const { mode } = result;

  // ── Quality ────────────────────────────────────────────────────────────────
  if (mode === 'audio-only') {
    result.quality = null;
  } else {
    // quality is enabled
    if (result.quality == null) {
      // Was null (came from audio-only), restore default
      result.quality = catalog.qualities.includes('1080p')
        ? '1080p'
        : (catalog.qualities[0] ?? null);
    } else if (!catalog.qualities.includes(result.quality)) {
      // Stale value: snap to nearest lower (or lowest above) per spec
      result.quality = fallbackQuality(result.quality, catalog.qualities);
    }
  }

  // ── Format ─────────────────────────────────────────────────────────────────
  if (mode === 'audio-only') {
    if (!catalog.audioFormats.includes(result.format)) {
      result.format = catalog.audioFormats[0];
    }
  } else {
    if (!catalog.videoFormats.includes(result.format)) {
      result.format = catalog.videoFormats[0];
    }
  }

  // ── Bitrate ────────────────────────────────────────────────────────────────
  if (mode === 'video-only') {
    result.bitrate = null;
  } else {
    // bitrate is enabled
    if (result.bitrate == null) {
      // Was null (came from video-only), restore default
      result.bitrate = nearestBitrate(192, catalog.bitrates);
    } else if (!catalog.bitrates.includes(result.bitrate)) {
      // Stale value: snap to nearest available
      result.bitrate = nearestBitrate(result.bitrate, catalog.bitrates);
    }
  }

  // ── Captions ───────────────────────────────────────────────────────────────
  if (!result.captions.enabled) {
    result.captions.separateFile = false;
  } else if (mode === 'audio-only') {
    result.captions.separateFile = true;
  }

  return result;
}
