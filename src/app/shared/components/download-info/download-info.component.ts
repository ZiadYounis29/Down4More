import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { DownloadActionEvent, DownloadItem, DownloadStatus } from '@core/models';
import { formatEta, formatSize, formatSpeed, formatWhen } from '@core/utils';
import { CheckboxComponent } from '@shared/ui/checkbox';
import { IconComponent } from '@shared/ui/icon';
import { ThumbBoxComponent } from '@shared/ui/thumb-box';
// UNRESOLVED IMPORT: ProgressBarComponent will be provided by P2
// import { ProgressBarComponent } from '@shared/ui/progress-bar';

@Component({
  selector: 'd4m-download-info',
  templateUrl: './download-info.component.html',
  styleUrl: './download-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CheckboxComponent,
    IconComponent,
    ThumbBoxComponent,
    // ProgressBarComponent — unresolved until P2 merges
  ],
})
export class DownloadInfoComponent {
  /** The download item to display. */
  readonly item = input.required<DownloadItem>();

  /** Display variant. */
  readonly variant = input.required<'small' | 'big' | 'history'>();

  /** Whether to show a checkbox (small variant). */
  readonly selectable = input(false);

  /** Whether this row is selected. */
  readonly selected = model(false);

  /** All button events (pause, resume, cancel, retry, dismiss, remove). */
  readonly action = output<DownloadActionEvent>();

  // ── Computed display helpers ────────────────────────────────────────────────

  protected readonly displaySpeed = computed(() =>
    formatSpeed(this.item().speedBps),
  );

  protected readonly displayEta = computed(() =>
    formatEta(this.item().etaSec),
  );

  /** "downloaded / total" in MB format. */
  protected readonly displayProgress = computed(() => {
    const { downloadedBytes, totalBytes } = this.item();
    const dl = formatSize(downloadedBytes, 'mb');
    const tot = formatSize(totalBytes, 'mb');
    return `${dl} / ${tot}`;
  });

  protected readonly displaySize = computed(() =>
    formatSize(this.item().totalBytes ?? this.item().sizeBytes ?? null),
  );

  protected readonly displayDate = computed(() =>
    formatWhen(this.item().finishedAt ?? ''),
  );

  protected readonly displayQuality = computed(() => {
    const { settings } = this.item();
    return settings.mode === 'audio-only' ? 'Audio' : (settings.quality ?? '—');
  });

  protected readonly displayFormat = computed(() =>
    this.item().settings.format,
  );

  protected readonly clampedProgress = computed(() =>
    Math.min(100, Math.max(0, this.item().progress)),
  );

  /** Whether this status allows pausing. */
  protected readonly canPause = computed(() =>
    this.item().status === 'downloading',
  );

  /** Whether this status allows resuming. */
  protected readonly canResume = computed(() =>
    this.item().status === 'paused',
  );

  /** Whether this status allows cancelling. */
  protected readonly canCancel = computed(() =>
    this.item().status === 'queued' ||
    this.item().status === 'downloading' ||
    this.item().status === 'paused',
  );

  /** Whether retry is available. */
  protected readonly canRetry = computed(() =>
    this.item().status === 'failed',
  );

  /** Whether dismiss is available (non-history small/big). */
  protected readonly canDismiss = computed(() =>
    (this.item().status === 'done' || this.item().status === 'failed') &&
    this.variant() !== 'history',
  );

  /** Whether remove is available (history variant only). */
  protected readonly canRemove = computed(() =>
    this.variant() === 'history',
  );

  protected readonly isProcessing = computed(() =>
    this.item().status === 'processing',
  );

  protected readonly isHistoryOk = computed(() =>
    this.item().status === 'done',
  );

  protected readonly rowStyle = computed(() => {
    if (this.variant() !== 'history') return {};
    const status = this.item().status;
    if (status === 'done') {
      return {
        '--row-bg': 'var(--color-history-ok)',
        'background': 'var(--color-history-ok)',
        'border-color': 'var(--color-history-ok-border)',
        'color': 'var(--color-on-history)',
      };
    }
    if (status === 'failed') {
      return {
        '--row-bg': 'var(--color-history-err)',
        'background': 'var(--color-history-err)',
        'border-color': 'var(--color-history-err-border)',
        'color': 'var(--color-on-history)',
      };
    }
    return {};
  });

  // ── Event emitters ──────────────────────────────────────────────────────────

  protected emit(type: DownloadActionEvent['type']): void {
    this.action.emit({ type, id: this.item().id });
  }
}
