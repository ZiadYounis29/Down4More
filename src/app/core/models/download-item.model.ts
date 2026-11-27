import { DownloadSettings } from './download-settings.model';
import { MediaItem } from './media-item.model';

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'processing'
  | 'done'
  | 'failed';

export interface DownloadItem extends MediaItem {
  status: DownloadStatus;
  progress: number; // 0..100
  downloadedBytes: number;
  totalBytes: number | null;
  /** Bytes per second. */
  speedBps: number | null;
  etaSec: number | null;
  settings: DownloadSettings; // what it was started with (resolved by backend)
  priority: number;
  error?: string;
  startedAt?: string; // ISO date
  finishedAt?: string; // ISO date, set when done/failed
}

export type DownloadAction =
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'retry'
  | 'remove'
  | 'prioritize'
  | 'dismiss';

export interface DownloadActionEvent {
  type: DownloadAction;
  id: string;
}
