import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DownloadAction, DownloadActionEvent, DownloadItem, DownloadStatus } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { ProgressService } from '@core/services/progress.service';
import { DownloadInfoComponent } from '@shared/components/download-info';
import { ItemContainerComponent, ItemTemplateDirective } from '@shared/components/item-container';
import { NavButton, NavButtonsComponent } from '@shared/components/nav-buttons';
import { PageContainerComponent } from '@shared/components/page-container';
import { PanelComponent } from '@shared/ui/panel';
import { StatusCountComponent, StatusFilter } from './components/status-count';

const IN_PROGRESS: DownloadStatus[] = ['queued', 'downloading', 'paused', 'processing'];
const PAUSABLE: DownloadStatus[] = ['queued', 'downloading', 'paused'];

@Component({
  selector: 'd4m-downloads',
  imports: [
    RouterLink,
    PageContainerComponent,
    ItemContainerComponent,
    ItemTemplateDirective,
    NavButtonsComponent,
    DownloadInfoComponent,
    PanelComponent,
    StatusCountComponent,
  ],
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent {
  private readonly progress = inject(ProgressService);
  private readonly downloads = inject(DownloadService);

  protected readonly filter = signal<StatusFilter | null>(null);
  protected readonly selectedIds = signal<string[]>([]);
  protected readonly error = signal<string | null>(null);

  private readonly all = this.progress.items;

  protected readonly counts = computed(() => ({
    done: this.all().filter((i) => i.status === 'done').length,
    downloading: this.all().filter((i) => IN_PROGRESS.includes(i.status)).length,
    failed: this.all().filter((i) => i.status === 'failed').length,
  }));

  protected readonly visible = computed(() => {
    const f = this.filter();
    if (f === 'done' || f === 'failed') {
      return this.all()
        .filter((i) => i.status === f)
        .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));
    }
    return this.all()
      .filter((i) => IN_PROGRESS.includes(i.status))
      .sort((a, b) => a.priority - b.priority);
  });

  /** the card on the right: the last ticked row, else the first row, else nothing */
  protected readonly details = computed(() => {
    const id = this.selectedIds().at(-1);
    return this.all().find((i) => i.id === id) ?? this.visible()[0] ?? null;
  });

  private readonly pausable = computed(() =>
    this.all().filter((i) => PAUSABLE.includes(i.status)),
  );

  protected readonly allPaused = computed(
    () =>
      this.pausable().length > 0 && this.pausable().every((i) => i.status === 'paused'),
  );

  private readonly priorityIds = computed(() => {
    const sel = new Set(this.selectedIds());
    return this.visible()
      .filter((i) => sel.has(i.id) && PAUSABLE.includes(i.status))
      .map((i) => i.id);
  });

  protected readonly toolbar = computed<NavButton[]>(() => [
    {
      id: 'pause-all',
      label: 'Pause all',
      variant: 'ghost',
      pressed: this.allPaused(),
      title: this.allPaused() ? 'Resume all' : undefined,
      disabled: this.pausable().length === 0,
    },
    {
      id: 'priority',
      label: 'Priority',
      variant: 'ghost',
      icon: 'arrow-up',
      disabled: this.priorityIds().length === 0,
    },
  ]);

  protected asDownloadItem(item: unknown): DownloadItem {
    return item as DownloadItem;
  }

  protected onToolbar(id: string): void {
    if (id === 'pause-all') {
      if (this.allPaused()) {
        this.run(
          'resume',
          this.pausable().map((i) => i.id),
        );
      } else {
        this.run(
          'pause',
          this.pausable()
            .filter((i) => i.status !== 'paused')
            .map((i) => i.id),
        );
      }
    }
    if (id === 'priority') {
      this.run('prioritize', this.priorityIds());
    }
  }

  protected onAction(e: DownloadActionEvent): void {
    this.run(e.type, [e.id]);
  }

  private run(action: DownloadAction, ids: string[]): void {
    this.error.set(null);
    this.downloads.control(action, ids).subscribe({
      error: () => this.error.set("Couldn't do that. Try again."),
    });
  }
}
