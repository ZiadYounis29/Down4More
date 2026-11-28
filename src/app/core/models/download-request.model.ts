import { DownloadSettings } from './download-settings.model';
import { MediaItem } from './media-item.model';

export interface TrimSegment {
  startSec: number;
  endSec: number;
}

export interface FrameCropRegion {
  /** Normalized horizontal offset (0..1) from the left edge of the source video. */
  x: number;
  /** Normalized vertical offset (0..1) from the top edge of the source video. */
  y: number;
  /** Normalized width (0..1) of the selected region. */
  width: number;
  /** Normalized height (0..1) of the selected region. */
  height: number;
}

export interface FrameSizeSettings {
  fill: 'crop' | 'blur' | 'black';
  aspect: 'original' | '16:9' | '21:9' | '4:5' | '9:16' | '1:1' | '4:3' | 'custom';
  customW?: number;
  customH?: number;
  /** Normalized crop/frame coordinates (0..1) within the source video. */
  crop?: FrameCropRegion;
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
