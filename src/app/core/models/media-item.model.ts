import { DownloadOptionsCatalog } from './download-settings.model';

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string | null;
  durationSec: number | null; // null = unknown / live
  channelName?: string;
  sizeBytes?: number | null; // estimate, changes with settings
  /** Options actually available for THIS video. Missing = use FetchResult.catalog. */
  catalog?: DownloadOptionsCatalog;
}
