import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MediaItem } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { DownloadOptionsComponent } from '@shared/components/download-options';
import { ItemContainerComponent, ItemTemplateDirective } from '@shared/components/item-container';
import { MediaThumbnailComponent } from '@shared/components/media-thumbnail';
import {
  NavButton,
  NavButtonsComponent,
  navApply,
  navDownload,
} from '@shared/components/nav-buttons';
import { PageContainerComponent } from '@shared/components/page-container';
import { PlaylistStateService } from '../services/playlist-state.service';

@Component({
  selector: 'd4m-playlist-options',
  imports: [
    PageContainerComponent,
    ItemContainerComponent,
    ItemTemplateDirective,
    MediaThumbnailComponent,
    DownloadOptionsComponent,
    NavButtonsComponent,
  ],
  templateUrl: './playlist-options.component.html',
  styleUrl: './playlist-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistOptionsComponent {
  protected readonly state = inject(PlaylistStateService);
  private readonly download = inject(DownloadService);
  private readonly router = inject(Router);

  protected readonly starting = signal(false);
  protected readonly message = signal<string | null>(null);

  protected readonly applyButtons = [navApply()];
  protected readonly downloadButtons = computed<NavButton[]>(() => [
    {
      ...navDownload(),
      label: `Download (${this.state.targetItems().length})`,
      loading: this.starting(),
    },
  ]);

  protected asMediaItem(item: unknown): MediaItem {
    return item as MediaItem;
  }

  protected onPressed(id: string): void {
    if (id === 'apply') {
      this.message.set(null);
      this.state.apply();
    }
    if (id === 'download') {
      this.startDownload();
    }
  }

  private startDownload(): void {
    if (this.state.dirty()) {
      this.message.set('Press Apply to save your changes first.');
      return;
    }
    this.message.set(null);
    this.starting.set(true);
    this.download.start(this.state.requests()).subscribe({
      next: () => this.router.navigate(['/downloads']),
      error: () => {
        this.starting.set(false);
        this.message.set("Couldn't start the downloads. Try again.");
      },
    });
  }
}
