import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  DownloadOptionsCatalog,
  DownloadRequest,
  DownloadSettings,
  TrimSegment,
} from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { FetchInfoService } from '@core/services/fetch-info.service';
// UNRESOLVED IMPORTS (not yet on main):
// import { PageContainerComponent } from '@shared/ui/page-container';
// import { MediaThumbnailComponent } from '@shared/components/media-thumbnail';
// import { FileNameComponent } from '@features/single/components/file-name';
// import { DownloadOptionsComponent } from '@shared/components/download-options';
// import { FrameSizeComponent } from '@features/single/components/frame-size';
// import { TrimVideoComponent } from '@features/single/components/trim-video';
// import { NavButtonsComponent, navDownload } from '@shared/components/nav-buttons';
// import { defaultDownloadSettings } from '@core/utils/default-download-settings';
// import { sanitizeName } from '@core/utils/sanitize-name';
// import { estimateSizeBytes } from '@core/utils/estimate-size';

function sanitizeName(text: string): string {
  return text
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);
}

function defaultDownloadSettings(catalog: DownloadOptionsCatalog): DownloadSettings {
  return {
    mode: 'video+audio',
    quality: catalog.qualities.includes('1080p') ? '1080p' : (catalog.qualities[0] ?? null),
    format: catalog.videoFormats[0] ?? 'mp4',
    bitrate: catalog.bitrates.includes(192) ? 192 : (catalog.bitrates[0] ?? null),
    captions: { enabled: false, separateFile: false },
  };
}

function estimateSizeBytes(
  baseBytes: number | null,
  settings: DownloadSettings,
  defaults: DownloadSettings,
): number | null {
  if (baseBytes === null) return null;
  if (settings.mode === 'audio-only') {
    const br = settings.bitrate ?? defaults.bitrate ?? 192;
    return Math.round(baseBytes * 0.1 * (br / 192));
  }
  const qMap: Record<string, number> = {
    '2160p': 2.5,
    '1440p': 1.6,
    '1080p': 1.0,
    '720p': 0.6,
    '480p': 0.35,
    '360p': 0.2,
  };
  const factor = settings.quality ? (qMap[settings.quality] ?? 1.0) : 1.0;
  return Math.round(baseBytes * factor);
}

@Component({
  selector: 'd4m-single',
  imports: [],
  templateUrl: './single.component.html',
  styleUrl: './single.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleComponent {
  private readonly fetchInfo = inject(FetchInfoService);
  private readonly download = inject(DownloadService);
  private readonly router = inject(Router);

  private readonly result = computed(() => this.fetchInfo.lastResult());
  protected readonly item = computed(() => this.result()!.items[0]);
  protected readonly catalog = computed(() => this.item().catalog ?? this.result()!.catalog);

  protected readonly settings = signal<DownloadSettings>(defaultDownloadSettings(this.catalog()));
  protected readonly fileName = signal(sanitizeName(this.item().title));
  protected readonly frameSizeOn = signal(false);
  protected readonly trimOn = signal(false);
  protected readonly segments = signal<TrimSegment[]>([]);
  protected readonly starting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly estimatedSize = computed(() =>
    estimateSizeBytes(
      this.item().sizeBytes ?? null,
      this.settings(),
      defaultDownloadSettings(this.catalog()),
    ),
  );

  private readonly canDownload = computed(
    () => !this.trimOn() || this.segments().every((s) => s.startSec < s.endSec),
  );

  protected readonly buttons = computed(() => [
    {
      id: 'download',
      label: 'Download',
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
    return {
      item: this.item(),
      settings: s,
      extras: {
        fileName: (this.fileName().trim() || sanitizeName(this.item().title)) + '.' + s.format,
        trim: this.trimOn() && this.segments().length ? this.segments() : null,
        frameSize: null,
      },
    };
  }
}
