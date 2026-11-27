import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MediaItem } from '@core/models';
import { ItemContainerComponent, ItemTemplateDirective } from '@shared/components/item-container';
import { MediaThumbnailComponent } from '@shared/components/media-thumbnail';
import { NavButton, NavButtonsComponent, navNext } from '@shared/components/nav-buttons';
import { PageContainerComponent } from '@shared/components/page-container';
import { PlaylistStateService } from '../services/playlist-state.service';

@Component({
  selector: 'd4m-playlist-select',
  imports: [
    PageContainerComponent,
    ItemContainerComponent,
    ItemTemplateDirective,
    MediaThumbnailComponent,
    NavButtonsComponent,
  ],
  templateUrl: './playlist-select.component.html',
  styleUrl: './playlist-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistSelectComponent {
  protected readonly state = inject(PlaylistStateService);
  private readonly router = inject(Router);

  protected readonly buttons = computed<NavButton[]>(() => [
    { ...navNext(), disabled: this.state.chosenIds().length === 0 },
  ]);

  protected readonly failedText = computed(() => {
    const n = this.state.failedCount();
    return `${n} ${n === 1 ? 'link' : 'links'} couldn't be loaded.`;
  });

  protected asMediaItem(item: unknown): MediaItem {
    return item as MediaItem;
  }

  protected onPressed(id: string): void {
    if (id === 'next') {
      this.router.navigate(['/playlist', 'options']);
    }
  }
}
