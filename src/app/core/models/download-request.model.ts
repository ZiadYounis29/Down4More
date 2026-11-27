import { DownloadSettings } from './download-settings.model';
import { MediaItem } from './media-item.model';

export interface TrimSegment {
  startSec: number;
  endSec: number;
}

export interface FrameSizeSettings {
  fill: 'crop' | 'blur' | 'black';
  aspect: 'original' | '16:9' | '21:9' | '4:5' | '9:16' | '1:1' | '4:3' | 'custom';
  customW?: number;
  customH?: number;
}

export interface SingleExtras {
  fileName: string; // full name with extension
  trim?: TrimSegment[] | null; // null = the whole video
  frameSize?: FrameSizeSettings | null; // null = original frame
}

export interface DownloadRequest {
  item: MediaItem;
  settings: DownloadSettings;
  extras?: SingleExtras;
}
