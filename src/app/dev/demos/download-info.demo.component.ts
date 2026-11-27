import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MOCK_DOWNLOADS } from '@core/mocks/mock-data';
import { DownloadActionEvent, DownloadItem, DownloadSettings } from '@core/models';
import { DownloadInfoComponent } from '@shared/components/download-info';

const DEFAULT_SETTINGS: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
};

function makeItem(
  id: string,
  title: string,
  status: DownloadItem['status'],
  progress: number,
  downloadedBytes: number,
  totalBytes: number | null,
  speedBps: number | null,
  etaSec: number | null,
  sizeBytes: number | null,
  error?: string,
  finishedAt?: string,
): DownloadItem {
  return {
    id,
    url: `https://youtube.com/watch?v=${id}`,
    title,
    thumbnailUrl: null,
    durationSec: null,
    channelName: 'Down4More Demo',
    sizeBytes,
    status,
    progress,
    downloadedBytes,
    totalBytes,
    speedBps,
    etaSec,
    settings: { ...DEFAULT_SETTINGS },
    priority: 1,
    ...(error ? { error } : {}),
    ...(finishedAt ? { finishedAt } : {}),
  };
}

/** Demo for d4m-download-info — covers all variants, statuses, and edge cases. */
@Component({
  selector: 'd4m-download-info-demo',
  templateUrl: './download-info.demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DownloadInfoComponent],
})
export class DownloadInfoDemoComponent {
  // ── Status items ─────────────────────────────────────────────────────────────
  readonly queued = makeItem('demo-q', 'Queued video title', 'queued', 0, 0, null, null, null, null);
  readonly downloading = MOCK_DOWNLOADS[0]; // dl-1: 67%, 17.2 MB/s, 40 hrs
  readonly paused = makeItem('demo-p', 'Paused video title', 'paused', 45, 45000000, 100000000, null, null, 52428800);
  readonly processing = makeItem('demo-proc', 'Processing video title', 'processing', 100, 671088640, 671088640, null, null, 67108864);
  readonly done = makeItem('demo-done', 'Done video title', 'done', 100, 50000000, 50000000, null, null, 50000000, undefined, new Date().toISOString());
  readonly failed = makeItem('demo-fail', 'Failed video title', 'failed', 0, 0, 40000000, null, null, 40000000, 'Video unavailable');

  // ── Edge cases ───────────────────────────────────────────────────────────────
  readonly longTitle = makeItem('demo-lt', 'Morning run routine - A comprehensive guided morning run for beginners covering warm-up, interval training, cardio, breathing, cool-down stretches', 'downloading', 55, 55000000, 100000000, 5000000, 9000, 100000000);
  readonly unknownSize = makeItem('demo-us', 'Unknown total size item', 'downloading', 30, 30000000, null, 4000000, null, null);

  // ── History items ─────────────────────────────────────────────────────────────
  readonly historyDone = makeItem('demo-hd', 'History done item', 'done', 100, 644874240, 644874240, null, null, 644874240, undefined, new Date(Date.now() - 20 * 60 * 1000).toISOString());
  readonly historyFailed = makeItem('demo-hf', 'History failed item', 'failed', 0, 0, 293601280, null, null, 29360128, 'Video unavailable', new Date(Date.now() - 90 * 60 * 1000).toISOString());

  // ── Action log ────────────────────────────────────────────────────────────────
  readonly lastAction = signal<string>('—');

  onAction(event: DownloadActionEvent): void {
    this.lastAction.set(`${event.type} → ${event.id}`);
  }
}
