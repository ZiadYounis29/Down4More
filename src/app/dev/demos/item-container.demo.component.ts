import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  generatePlaylistItems,
  MOCK_DOWNLOADS,
  MOCK_HISTORY,
  MOCK_PLAYLIST_ITEMS,
} from '@core/mocks/mock-data';
import { DownloadItem, MediaItem } from '@core/models';
import { DownloadInfoComponent } from '@shared/components/download-info';
import { ItemContainerComponent, ItemTemplateDirective } from '@shared/components/item-container';
import { MediaThumbnailComponent } from '@shared/components/media-thumbnail';
import { NavButton, NavButtonsComponent } from '@shared/components/nav-buttons';

@Component({
  selector: 'd4m-item-container-demo',
  imports: [
    ItemContainerComponent,
    ItemTemplateDirective,
    MediaThumbnailComponent,
    DownloadInfoComponent,
    NavButtonsComponent,
  ],
  template: `
    <h2>Item container</h2>

    <section class="demo__case">
      <p class="demo__caption">Usage 1: Playlist Select (9 items, 5 visible rows)</p>
      <d4m-item-container
        [items]="playlistItems"
        [selectable]="true"
        [visibleRows]="5"
        [(selectedIds)]="selectedPlaylistIds"
      >
        <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
          <d4m-media-thumbnail
            variant="pre-select"
            [item]="asMediaItem(item)"
            [selected]="sel"
            (selectedChange)="toggle()"
          />
        </ng-template>
      </d4m-item-container>
    </section>

    <section class="demo__case">
      <p class="demo__caption">Usage 2: Downloads queue with toolbar (last action: {{ lastAction() }})</p>
      <d4m-item-container
        [items]="downloads"
        [selectable]="true"
        [visibleRows]="5"
        [(selectedIds)]="selectedDownloadIds"
      >
        <d4m-nav-buttons
          toolbar
          size="sm"
          [buttons]="toolbarButtons"
          (pressed)="lastAction.set($event)"
        />
        <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
          <d4m-download-info
            variant="small"
            [item]="asDownloadItem(item)"
            [selectable]="true"
            [selected]="sel"
            (selectedChange)="toggle()"
            (action)="lastAction.set($event.type + ':' + $event.id)"
          />
        </ng-template>
      </d4m-item-container>
    </section>

    <section class="demo__case">
      <p class="demo__caption">Usage 3: History (selectable=false)</p>
      <d4m-item-container [items]="historyItems" [selectable]="false" [visibleRows]="3">
        <ng-template d4mItem let-item>
          <d4m-download-info
            variant="history"
            [item]="asDownloadItem(item)"
            (action)="lastAction.set($event.type + ':' + $event.id)"
          />
        </ng-template>
      </d4m-item-container>
    </section>

    <section class="demo__case">
      <p class="demo__caption">300 items virtual scroll &amp; empty slot toggle</p>
      <div style="margin-bottom: 12px;">
        <button
          type="button"
          class="btn btn--sm btn--secondary"
          (click)="showEmpty.set(!showEmpty())"
        >
          {{ showEmpty() ? 'Show 300 items' : 'Show empty state' }}
        </button>
      </div>
      <d4m-item-container
        [items]="showEmpty() ? [] : bigItems"
        [selectable]="true"
        [visibleRows]="5"
        [(selectedIds)]="selectedBigIds"
      >
        <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
          <d4m-media-thumbnail
            variant="pre-select"
            [item]="asMediaItem(item)"
            [selected]="sel"
            (selectedChange)="toggle()"
          />
        </ng-template>
        <p empty style="text-align: center; color: var(--color-text-muted);">No items in the list.</p>
      </d4m-item-container>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemContainerDemoComponent {
  protected readonly playlistItems = MOCK_PLAYLIST_ITEMS;
  protected readonly downloads = MOCK_DOWNLOADS;
  protected readonly historyItems = MOCK_HISTORY.slice(0, 8);
  protected readonly bigItems = generatePlaylistItems(300);

  protected readonly selectedPlaylistIds = signal<string[]>(['p-1', 'p-2']);
  protected readonly selectedDownloadIds = signal<string[]>([]);
  protected readonly selectedBigIds = signal<string[]>([]);
  protected readonly showEmpty = signal(false);
  protected readonly lastAction = signal('none');

  protected readonly toolbarButtons: NavButton[] = [
    { id: 'pause-all', label: 'Pause all', variant: 'ghost' },
    { id: 'priority', label: 'Priority', variant: 'ghost', icon: 'arrow-up' },
  ];

  protected asMediaItem(item: unknown): MediaItem {
    return item as MediaItem;
  }

  protected asDownloadItem(item: unknown): DownloadItem {
    return item as DownloadItem;
  }
}
