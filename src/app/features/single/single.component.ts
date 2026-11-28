import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DownloadRequest, TrimSegment } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { defaultDownloadSettings, estimateSizeBytes, sanitizeName } from '@core/utils';
import { DownloadOptionsComponent } from '@shared/components/download-options';
import { MediaThumbnailComponent } from '@shared/components/media-thumbnail';
import { NavButton, NavButtonsComponent, navDownload } from '@shared/components/nav-buttons';
import { PageContainerComponent } from '@shared/components/page-container';
import { FileNameComponent } from './components/file-name';
import { FrameSizeComponent } from './components/frame-size';
import { TrimVideoComponent } from './components/trim-video';
import { SingleStateService } from './single-state.service';

@Component({
  selector: 'd4m-single',
  imports: [
    PageContainerComponent,
    MediaThumbnailComponent,
    FileNameComponent,
    DownloadOptionsComponent,
    FrameSizeComponent,
    TrimVideoComponent,
    NavButtonsComponent,
  ],
  templateUrl: './single.component.html',
  styleUrl: './single.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleComponent {
  private readonly state = inject(SingleStateService);
  private readonly download = inject(DownloadService);
  private readonly router = inject(Router);

  protected readonly item = this.state.item;
  protected readonly catalog = this.state.catalog;

  protected readonly settings = this.state.settings;
  protected readonly fileName = this.state.fileName;
  protected readonly frameSizeOn = this.state.frameSizeOn;
  protected readonly frameSize = this.state.frameSize;
  protected readonly trimOn = this.state.trimOn;
  protected readonly segments = this.state.segments;
  protected readonly starting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly estimatedSize = computed(() =>
    estimateSizeBytes(
      this.item().sizeBytes ?? null,
      this.settings(),
      defaultDownloadSettings(this.catalog()),
    ),
  );

  private readonly canDownload = computed(() => {
    const trimValid = !this.trimOn() || this.segments().every((s) => s.startSec < s.endSec);
    const fs = this.frameSize();
    const frameValid =
      !this.frameSizeOn() ||
      fs.aspect !== 'custom' ||
      ((fs.customW ?? 0) > 0 && (fs.customH ?? 0) > 0);
    return trimValid && frameValid;
  });

  protected readonly buttons = computed<NavButton[]>(() => [
    {
      ...navDownload(),
      loading: this.starting(),
      disabled: !this.canDownload(),
    },
  ]);

  protected onPressed(id: string): void {
    if (id !== 'download') return;
    this.starting.set(true);
    this.error.set(null);
    this.download.start([this.buildRequest()]).subscribe({
      next: () => this.router.navigate(['/downloads']),
      error: () => {
        this.starting.set(false);
        this.error.set("Couldn't start the download. Try again.");
      },
    });
  }

  private buildRequest(): DownloadRequest {
    const s = this.settings();
    const trimmed = this.fileName().trim();
    const base = trimmed || sanitizeName(this.item().title) || 'download';
    return {
      item: this.item(),
      settings: s,
      extras: {
        fileName: `${base}.${s.format}`,
        trim: this.trimOn() && this.segments().length > 0 ? this.segments() : null,
        frameSize: this.frameSizeOn() ? this.frameSize() : null,
      },
    };
  }
}
