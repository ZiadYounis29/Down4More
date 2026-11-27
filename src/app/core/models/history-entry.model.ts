import { DownloadItem } from './download-item.model';

export type HistoryEntry = DownloadItem & { finishedAt: string }; // status is 'done' | 'failed'
