import { DownloadOptionsCatalog } from './download-settings.model';
import { MediaItem } from './media-item.model';

export interface FetchFailure {
  url: string;
  reason: string;
}

export interface FetchResult {
  kind: 'single' | 'playlist'; // 'playlist' also means a multi-link batch
  items: MediaItem[]; // 1 item for 'single'
  catalog: DownloadOptionsCatalog; // main catalog, and fallback for items without MediaItem.catalog
  failed: FetchFailure[]; // links that could not be loaded
  title?: string; // playlist title when the batch is one playlist link
}
