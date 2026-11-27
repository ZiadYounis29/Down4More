import { DownloadSettings } from '@core/models';

export function sameSettings(a: DownloadSettings, b: DownloadSettings): boolean {
  return (
    a.mode === b.mode &&
    a.quality === b.quality &&
    a.format === b.format &&
    a.bitrate === b.bitrate &&
    a.captions.enabled === b.captions.enabled &&
    a.captions.separateFile === b.captions.separateFile
  );
}
