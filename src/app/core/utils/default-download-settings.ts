import { DownloadOptionsCatalog, DownloadSettings } from '@core/models';
import { nearestBitrate } from './nearest-bitrate';

/**
 * Builds the default DownloadSettings for a given catalog.
 * (Decisions spec §1.4)
 */
export function defaultDownloadSettings(catalog: DownloadOptionsCatalog): DownloadSettings {
  return {
    mode: 'video+audio',
    quality: catalog.qualities.includes('1080p') ? '1080p' : (catalog.qualities[0] ?? null),
    format: catalog.videoFormats[0],
    bitrate: nearestBitrate(192, catalog.bitrates),
    captions: { enabled: false, separateFile: false },
  };
}
