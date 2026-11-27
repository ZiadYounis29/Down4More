import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DownloadActionEvent, DownloadItem } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { HistoryService } from '@core/services/history.service';
import { DownloadInfoComponent } from '@shared/components/download-info';
import { ItemContainerComponent, ItemTemplateDirective } from '@shared/components/item-container';
import { PageContainerComponent } from '@shared/components/page-container';
import { SearchBarComponent } from './components/search-bar';

@Component({
  selector: 'd4m-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ItemContainerComponent,
    ItemTemplateDirective,
    DownloadInfoComponent,
    SearchBarComponent,
  ],
})
export class HistoryComponent {
  private readonly history = inject(HistoryService);
  private readonly downloads = inject(DownloadService);

  private readonly searchBar = viewChild(SearchBarComponent);

  protected readonly query = signal('');
  protected readonly status = this.history.status;
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal('');

  protected readonly total = computed(() => this.history.items().length);

  /** newest first */
  private readonly sorted = computed(() =>
    [...this.history.items()].sort((a, b) =>
      (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''),
    ),
  );

  protected readonly shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.sorted().filter((i) => i.title.toLowerCase().includes(q)) : this.sorted();
  });

  protected readonly countText = computed(
    () => `${this.shown().length} of ${this.total()} ${this.total() === 1 ? 'item' : 'items'}`,
  );

  constructor() {
    this.history.load();
  }

  protected reload(): void {
    this.history.load();
  }

  protected asDownloadItem(item: unknown): DownloadItem {
    return item as DownloadItem;
  }

  protected onAction(e: DownloadActionEvent): void {
    const item = this.history.items().find((i) => i.id === e.id);
    this.error.set(null);
    this.downloads.control(e.type, [e.id]).subscribe({
      next: () => {
        this.history.drop(e.id);
        this.notice.set(
          e.type === 'retry'
            ? `Retrying ${item?.title}. It is back in Downloads.`
            : `Removed ${item?.title} from history.`,
        );
        this.searchBar()?.focus();
      },
      error: () => this.error.set("Couldn't do that. Try again."),
    });
  }
}
